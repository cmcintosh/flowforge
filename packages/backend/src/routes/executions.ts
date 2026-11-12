import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function parseExecution(row: any) {
  return {
    id: row.id,
    workflowId: row.workflowId,
    status: row.status,
    mode: row.mode,
    startedAt: row.startedAt.toISOString(),
    finishedAt: row.finishedAt?.toISOString() || null,
    duration: row.duration,
    error: row.error,
    data: JSON.parse(row.data),
  };
}

export async function executionRoutes(app: FastifyInstance) {
  // List executions
  app.get('/', async (req: FastifyRequest) => {
    const { page = '1', pageSize = '50', workflowId } = req.query as { page?: string; pageSize?: string; workflowId?: string };
    const p = parseInt(page, 10);
    const ps = parseInt(pageSize, 10);

    const where = workflowId ? { workflowId } : {};
    const [total, rows] = await Promise.all([
      prisma.execution.count({ where }),
      prisma.execution.findMany({
        where,
        orderBy: { startedAt: 'desc' },
        skip: (p - 1) * ps,
        take: ps,
      }),
    ]);

    return { data: rows.map(parseExecution), total, page: p, pageSize: ps };
  });

  // Get single execution
  app.get('/:id', async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    const row = await prisma.execution.findUnique({ where: { id } });
    if (!row) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Execution not found' } });
    }
    return { data: parseExecution(row) };
  });

  // Delete execution
  app.delete('/:id', async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    try {
      await prisma.execution.delete({ where: { id } });
      return { success: true };
    } catch {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Execution not found' } });
    }
  });
}
