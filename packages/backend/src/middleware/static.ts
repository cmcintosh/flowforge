import type { FastifyInstance } from 'fastify';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function serveFrontend(app: FastifyInstance) {
  const frontendPath = path.resolve(__dirname, '../../frontend/dist');

  try {
    await app.register(fastifyStatic, {
      root: frontendPath,
      prefix: '/',
      decorateReply: false,
    });

    // SPA fallback: serve index.html for non-API routes
    app.setNotFoundHandler((req, reply) => {
      if (req.url.startsWith('/api/')) {
        reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Endpoint not found' } });
      } else {
        reply.sendFile('index.html');
      }
    });
  } catch {
    app.log.warn('Frontend dist not found — running API-only mode');
  }
}
