import type { FlowItem, NodeDefinition } from '@flowforge/shared';

export interface NodeExecuteContext {
  parameters: Record<string, unknown>;
  input: FlowItem[];
  credentials: Record<string, Record<string, unknown>>;
  workflow: { id: string; name: string };
  nodeId: string;
}

export interface NodeHandler {
  definition: NodeDefinition;
  execute(ctx: NodeExecuteContext): Promise<FlowItem[]>;
}

class NodeRegistry {
  private handlers = new Map<string, NodeHandler>();

  register(handler: NodeHandler): void {
    this.handlers.set(handler.definition.type, handler);
  }

  get(type: string): NodeHandler | undefined {
    return this.handlers.get(type);
  }

  list(): NodeDefinition[] {
    return Array.from(this.handlers.values()).map(h => h.definition);
  }
}

export const nodeRegistry = new NodeRegistry();
