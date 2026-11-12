import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function webhookRoutes(app: FastifyInstance) {
  // Webhook trigger endpoint: POST /api/webhooks/:workflowId/:webhookNodeId
  app.post('/:workflowId/:nodeId', async (req: FastifyRequest, reply: FastifyReply) => {
    const { workflowId, nodeId } = req.params as { workflowId: string; nodeId: string };

    const workflow = await prisma.workflow.findUnique({ where: { id: workflowId } });
    if (!workflow || !workflow.active) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Workflow not found or inactive' } });
    }

    const nodes = JSON.parse(workflow.nodes);
    const webhookNode = nodes.find((n: any) => n.id === nodeId && n.type === 'webhookTrigger');
    if (!webhookNode) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Webhook trigger not found' } });
    }

    // Execute workflow with webhook data
    const { engine } = await import('../index.js');
    const wf = {
      id: workflow.id,
      name: workflow.name,
      description: workflow.description,
      active: workflow.active,
      nodes: JSON.parse(workflow.nodes),
      connections: JSON.parse(workflow.connections),
      settings: JSON.parse(workflow.settings),
      createdAt: workflow.createdAt.toISOString(),
      updatedAt: workflow.updatedAt.toISOString(),
    };

    const webhookData = {
      headers: req.headers,
      body: req.body,
      query: req.query,
      params: req.params,
    };

    const execution = await engine.executeWorkflow(wf, 'webhook', webhookData);

    // If workflow has a "Respond to Webhook" node, use its response
    const respondNode = wf.nodes.find((n: any) => n.type === 'respondToWebhook');
    if (respondNode && execution.data) {
      const respondData = execution.data.find((d: any) => d.nodeId === respondNode.id);
      if (respondData && respondData.output[0]) {
        const response = respondData.output[0] as any;
        return reply.status(response.statusCode || 200).headers(response.headers || {}).send(response.body);
      }
    }

    return { data: execution };
  });

  // GET webhook (for simple triggers)
  app.get('/:workflowId/:nodeId', async (req: FastifyRequest, reply: FastifyReply) => {
    const { workflowId, nodeId } = req.params as { workflowId: string; nodeId: string };

    const workflow = await prisma.workflow.findUnique({ where: { id: workflowId } });
    if (!workflow || !workflow.active) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Workflow not found or inactive' } });
    }

    const nodes = JSON.parse(workflow.nodes);
    const webhookNode = nodes.find((n: any) => n.id === nodeId && n.type === 'webhookTrigger');
    if (!webhookNode) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Webhook trigger not found' } });
    }

    const { engine } = await import('../index.js');
    const wf = {
      id: workflow.id,
      name: workflow.name,
      description: workflow.description,
      active: workflow.active,
      nodes: JSON.parse(workflow.nodes),
      connections: JSON.parse(workflow.connections),
      settings: JSON.parse(workflow.settings),
      createdAt: workflow.createdAt.toISOString(),
      updatedAt: workflow.updatedAt.toISOString(),
    };

    const webhookData = {
      headers: req.headers,
      body: {},
      query: req.query,
      params: req.params,
    };

    const execution = await engine.executeWorkflow(wf, 'webhook', webhookData);
    return { data: execution };
  });
}
