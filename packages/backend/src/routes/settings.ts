import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function settingsRoutes(app: FastifyInstance) {
  // Get settings
  app.get('/', async () => {
    let settings = await prisma.settings.findUnique({ where: { id: 1 } });
    if (!settings) {
      settings = await prisma.settings.create({ data: { id: 1 } });
    }
    return { data: settings };
  });

  // Update settings
  app.put('/', async (req: FastifyRequest, reply: FastifyReply) => {
    const updates = req.body as Partial<{
      instanceName: string;
      executionTimeout: number;
      saveExecutionProgress: boolean;
      saveManualExecutions: boolean;
      maxExecutionDataSize: number;
    }>;

    let settings = await prisma.settings.findUnique({ where: { id: 1 } });
    if (!settings) {
      settings = await prisma.settings.create({ data: { id: 1 } });
    }

    const updated = await prisma.settings.update({
      where: { id: 1 },
      data: updates,
    });

    return { data: updated };
  });
}
