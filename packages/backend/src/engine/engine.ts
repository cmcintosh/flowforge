import type { PrismaClient } from '@prisma/client';
import { v4 as uuid } from 'uuid';
import type { Workflow, Execution, ExecutionData, FlowItem, NodeDefinition } from '@flowforge/shared';
import type { CredentialVault } from '../credentials/vault.js';
import { nodeRegistry } from '../nodes/registry.js';

export class ExecutionEngine {
  constructor(
    private prisma: PrismaClient,
    private vault: CredentialVault,
  ) {}

  async executeWorkflow(
    workflow: Workflow,
    mode: 'manual' | 'webhook' | 'cron' | 'api' = 'manual',
    triggerData?: unknown,
  ): Promise<Execution> {
    const executionId = uuid();
    const startTime = Date.now();

    // Create execution record
    const execution = await this.prisma.execution.create({
      data: {
        id: executionId,
        workflowId: workflow.id,
        status: 'running',
        mode,
        startedAt: new Date(),
        data: '[]',
      },
    });

    const executionData: ExecutionData[] = [];

    try {
      // Build adjacency map: nodeId → connected targets
      const adjacency = this.buildAdjacency(workflow.connections);

      // Find trigger nodes (nodes with no incoming connections)
      const triggerNodeIds = this.findTriggers(workflow.nodes, workflow.connections);

      // If triggerData provided, start from webhook/cron node
      let startNodes: string[];
      if (triggerData && mode === 'webhook') {
        // Find the webhook node that matches
        const webhookNode = workflow.nodes.find(n => n.type === 'webhookTrigger');
        startNodes = webhookNode ? [webhookNode.id] : triggerNodeIds;
      } else {
        startNodes = triggerNodeIds;
      }

      // Execute nodes in topological order
      await this.executeNodes(workflow, startNodes, adjacency, triggerData, executionData);

      // Update execution as success
      const duration = Date.now() - startTime;
      await this.prisma.execution.update({
        where: { id: executionId },
        data: {
          status: 'success',
          finishedAt: new Date(),
          duration,
          data: JSON.stringify(executionData),
        },
      });

      return {
        id: executionId,
        workflowId: workflow.id,
        status: 'success',
        mode,
        startedAt: execution.startedAt.toISOString(),
        finishedAt: new Date().toISOString(),
        duration,
        error: null,
        data: executionData,
      };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      const duration = Date.now() - startTime;

      await this.prisma.execution.update({
        where: { id: executionId },
        data: {
          status: 'failed',
          finishedAt: new Date(),
          duration,
          error: errorMsg,
          data: JSON.stringify(executionData),
        },
      });

      return {
        id: executionId,
        workflowId: workflow.id,
        status: 'failed',
        mode,
        startedAt: execution.startedAt.toISOString(),
        finishedAt: new Date().toISOString(),
        duration,
        error: errorMsg,
        data: executionData,
      };
    }
  }

  private buildAdjacency(connections: Workflow['connections']): Map<string, string[]> {
    const adj = new Map<string, string[]>();
    for (const conn of connections) {
      const targets = adj.get(conn.source) || [];
      targets.push(conn.target);
      adj.set(conn.source, targets);
    }
    return adj;
  }

  private findTriggers(nodes: Workflow['nodes'], connections: Workflow['connections']): string[] {
    const targetIds = new Set(connections.map(c => c.target));
    return nodes.filter(n => !targetIds.has(n.id)).map(n => n.id);
  }

  private async executeNodes(
    workflow: Workflow,
    startNodeIds: string[],
    adjacency: Map<string, string[]>,
    triggerData: unknown,
    executionData: ExecutionData[],
  ): Promise<void> {
    // BFS execution with data passing
    const nodeOutputs = new Map<string, FlowItem[]>();
    const executed = new Set<string>();
    const queue = [...startNodeIds];

    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      if (executed.has(nodeId)) continue;

      const node = workflow.nodes.find(n => n.id === nodeId);
      if (!node) continue;

      // Check all incoming nodes have executed
      const incoming = workflow.connections.filter(c => c.target === nodeId);
      const allIncomingExecuted = incoming.every(c => executed.has(c.source));
      if (!allIncomingExecuted && !startNodeIds.includes(nodeId)) {
        // Re-queue for later
        queue.push(nodeId);
        continue;
      }

      // Gather input items from incoming connections
      let inputItems: FlowItem[] = [];
      if (startNodeIds.includes(nodeId) && triggerData) {
        inputItems = [{ json: triggerData as Record<string, unknown> }];
      } else {
        for (const conn of incoming) {
          const sourceOutput = nodeOutputs.get(conn.source) || [];
          inputItems = inputItems.concat(sourceOutput);
        }
      }

      const nodeStartTime = Date.now();

      try {
        // Get node handler from registry
        const handler = nodeRegistry.get(node.type);
        if (!handler) {
          throw new Error(`Unknown node type: ${node.type}`);
        }

        // Resolve credentials if needed
        let credentials: Record<string, Record<string, unknown>> = {};
        if (node.credentials) {
          for (const [credKey, credId] of Object.entries(node.credentials)) {
            const credRow = await this.prisma.credential.findUnique({ where: { id: credId } });
            if (credRow) {
              credentials[credKey] = this.vault.decrypt(credRow.data);
            }
          }
        }

        // Execute node
        const outputItems = await handler.execute({
          parameters: node.parameters,
          input: inputItems,
          credentials,
          workflow,
          nodeId,
        });

        nodeOutputs.set(nodeId, outputItems);

        const nodeEndTime = Date.now();
        executionData.push({
          nodeId,
          nodeName: node.name,
          nodeType: node.type,
          status: 'success',
          startTime: new Date(nodeStartTime).toISOString(),
          endTime: new Date(nodeEndTime).toISOString(),
          duration: nodeEndTime - nodeStartTime,
          input: inputItems,
          output: outputItems,
          error: null,
        });

        executed.add(nodeId);

        // Queue next nodes
        const next = adjacency.get(nodeId) || [];
        for (const nextId of next) {
          if (!executed.has(nextId)) {
            queue.push(nextId);
          }
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        const nodeEndTime = Date.now();
        executionData.push({
          nodeId,
          nodeName: node.name,
          nodeType: node.type,
          status: 'failed',
          startTime: new Date(nodeStartTime).toISOString(),
          endTime: new Date(nodeEndTime).toISOString(),
          duration: nodeEndTime - nodeStartTime,
          input: inputItems,
          output: [],
          error: errorMsg,
        });

        executed.add(nodeId);

        // Continue or stop based on workflow settings
        if (!workflow.settings.retryOnFail) {
          throw err;
        }
      }
    }
  }
}
