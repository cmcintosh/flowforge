import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { v4 as uuid } from 'uuid';
import { CredentialVault } from '../credentials/vault.js';

const prisma = new PrismaClient();
const vault = new CredentialVault(process.env.FLOWFORGE_ENCRYPTION_KEY);

export async function credentialRoutes(app: FastifyInstance) {
  // List credentials (without decrypted data)
  app.get('/', async () => {
    const rows = await prisma.credential.findMany({
      orderBy: { updatedAt: 'desc' },
    });
    return {
      data: rows.map((r) => ({
        id: r.id,
        name: r.name,
        type: r.type,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      })),
    };
  });

  // Get single credential (decrypted)
  app.get('/:id', async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    const row = await prisma.credential.findUnique({ where: { id } });
    if (!row) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Credential not found' } });
    }
    const decrypted = vault.decrypt(row.data);
    return {
      data: {
        id: row.id,
        name: row.name,
        type: row.type,
        data: decrypted,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
      },
    };
  });

  // Create credential
  app.post('/', async (req: FastifyRequest) => {
    const { name, type, data } = req.body as { name: string; type: string; data: Record<string, unknown> };
    const encrypted = vault.encrypt(JSON.stringify(data));
    const row = await prisma.credential.create({
      data: { id: uuid(), name, type, data: encrypted },
    });
    return {
      data: {
        id: row.id,
        name: row.name,
        type: row.type,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
      },
    };
  });

  // Update credential
  app.put('/:id', async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    const { name, type, data } = req.body as { name?: string; type?: string; data?: Record<string, unknown> };

    const existing = await prisma.credential.findUnique({ where: { id } });
    if (!existing) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Credential not found' } });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (type !== undefined) updateData.type = type;
    if (data !== undefined) updateData.data = vault.encrypt(JSON.stringify(data));

    const row = await prisma.credential.update({ where: { id }, data: updateData });
    return {
      data: {
        id: row.id,
        name: row.name,
        type: row.type,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
      },
    };
  });

  // Delete credential
  app.delete('/:id', async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    try {
      await prisma.credential.delete({ where: { id } });
      return { success: true };
    } catch {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Credential not found' } });
    }
  });
}
