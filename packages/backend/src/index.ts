import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import websocket from '@fastify/websocket';
import { PrismaClient } from '@prisma/client';
import { authRoutes } from './routes/auth.js';
import { workflowRoutes } from './routes/workflows.js';
import { credentialRoutes } from './routes/credentials.js';
import { executionRoutes } from './routes/executions.js';
import { settingsRoutes } from './routes/settings.js';
import { webhookRoutes } from './routes/webhooks.js';
import { healthRoutes } from './routes/health.js';
import { authMiddleware } from './middleware/auth.js';
import { ExecutionEngine } from './engine/engine.js';
import { CredentialVault } from './credentials/vault.js';

const prisma = new PrismaClient();
const vault = new CredentialVault(process.env.FLOWFORGE_ENCRYPTION_KEY);
const engine = new ExecutionEngine(prisma, vault);

const app = Fastify({ logger: true });

async function start() {
  await app.register(cors, {
    origin: process.env.FLOWFORGE_FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });
  await app.register(cookie);
  await app.register(websocket);

  // Public routes
  await app.register(healthRoutes);
  await app.register(webhookRoutes, { prefix: '/api/webhooks' });

  // Auth routes (public)
  await app.register(authRoutes, { prefix: '/api/auth' });

  // Protected routes
  app.addHook('preHandler', authMiddleware);
  await app.register(workflowRoutes, { prefix: '/api/workflows' });
  await app.register(credentialRoutes, { prefix: '/api/credentials' });
  await app.register(executionRoutes, { prefix: '/api/executions' });
  await app.register(settingsRoutes, { prefix: '/api/settings' });

  const port = parseInt(process.env.FLOWFORGE_PORT || '3000', 10);
  const host = process.env.FLOWFORGE_HOST || '0.0.0.0';

  await app.listen({ port, host });
  app.log.info(`FlowForge API running on ${host}:${port}`);
}

start().catch((err) => {
  console.error('Failed to start FlowForge:', err);
  process.exit(1);
});

export { app, prisma, engine, vault };
