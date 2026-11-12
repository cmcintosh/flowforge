import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { v4 as uuid } from 'uuid';
import type { Workflow, WorkflowNode, WorkflowConnection, WorkflowSettings } from '@flowforge/shared';

const prisma = new PrismaClient();

function parseWorkflow(row: any): Workflow {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    active: row.active,
    nodes: JSON.parse(row.nodes),
    connections: JSON.parse(row.connections),
    settings: JSON.parse(row.settings),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function workflowRoutes(app: FastifyInstance) {
  // List workflows
  app.get('/', async (req: FastifyRequest) => {
    const { page = '1', pageSize = '50' } = req.query as { page?: string; pageSize?: string };
    const p = parseInt(page, 10);
    const ps = parseInt(pageSize, 10);

    const [total, rows] = await Promise.all([
      prisma.workflow.count(),
      prisma.workflow.findMany({
        orderBy: { updatedAt: 'desc' },
        skip: (p - 1) * ps,
        take: ps,
      }),
    ]);

    return { data: rows.map(parseWorkflow), total, page: p, pageSize: ps };
  });

  // Get single workflow
  app.get('/:id', async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    const row = await prisma.workflow.findUnique({ where: { id } });
    if (!row) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Workflow not found' } });
    }
    return { data: parseWorkflow(row) };
  });

  // Create workflow
  app.post('/', async (req: FastifyRequest) => {
    const { name, description, nodes, connections, settings } = req.body as {
      name: string;
      description?: string;
      nodes?: WorkflowNode[];
      connections?: WorkflowConnection[];
      settings?: WorkflowSettings;
    };

    const row = await prisma.workflow.create({
      data: {
        id: uuid(),
        name: name || 'New Workflow',
        description: description || '',
        nodes: JSON.stringify(nodes || []),
        connections: JSON.stringify(connections || []),
        settings: JSON.stringify(settings || { executionTimeout: 300, retryOnFail: false, maxRetries: 3, retryInterval: 10 }),
        active: false,
      },
    });

    return { data: parseWorkflow(row) };
  });

  // Update workflow
  app.put('/:id', async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    const updates = req.body as Partial<{ name: string; description: string; nodes: WorkflowNode[]; connections: WorkflowConnection[]; settings: WorkflowSettings }>;

    const existing = await prisma.workflow.findUnique({ where: { id } });
    if (!existing) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Workflow not found' } });
    }

    const data: any = {};
    if (updates.name !== undefined) data.name = updates.name;
    if (updates.description !== undefined) data.description = updates.description;
    if (updates.nodes !== undefined) data.nodes = JSON.stringify(updates.nodes);
    if (updates.connections !== undefined) data.connections = JSON.stringify(updates.connections);
    if (updates.settings !== undefined) data.settings = JSON.stringify(updates.settings);

    const row = await prisma.workflow.update({ where: { id }, data });
    return { data: parseWorkflow(row) };
  });

  // Delete workflow
  app.delete('/:id', async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    try {
      await prisma.workflow.delete({ where: { id } });
      return { success: true };
    } catch {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Workflow not found' } });
    }
  });

  // Activate workflow
  app.post('/:id/activate', async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    const row = await prisma.workflow.update({
      where: { id },
      data: { active: true },
    });
    // TODO: Register webhook/cron triggers based on nodes
    return { data: parseWorkflow(row) };
  });

  // Deactivate workflow
  app.post('/:id/deactivate', async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    const row = await prisma.workflow.update({
      where: { id },
      data: { active: false },
    });
    // TODO: Unregister webhook/cron triggers
    return { data: parseWorkflow(row) };
  });

  // Execute workflow manually
  app.post('/:id/execute', async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    const row = await prisma.workflow.findUnique({ where: { id } });
    if (!row) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Workflow not found' } });
    }

    // Import engine dynamically to avoid circular deps
    const { engine } = await import('../index.js');
    const execution = await engine.executeWorkflow(parseWorkflow(row), 'manual');

    return { data: execution };
  });
}
