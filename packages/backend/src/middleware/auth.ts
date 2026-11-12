import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.FLOWFORGE_JWT_SECRET || 'flowforge-dev-secret-change-me';
const JWT_EXPIRY = '7d';

export async function authMiddleware(req: FastifyRequest, reply: FastifyReply) {
  // Skip auth for health and webhook routes (they're registered before this hook)
  const url = req.url;
  if (url.startsWith('/api/health') || url.startsWith('/api/webhooks') || url.startsWith('/api/auth')) {
    return;
  }

  const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;
  if (!token) {
    return reply.status(401).send({ error: { code: 'UNAUTHORIZED', message: 'No token provided' } });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    (req as any).user = payload;
  } catch {
    return reply.status(401).send({ error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' } });
  }
}

export function signToken(payload: { id: string; email: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}
