import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { signToken } from '../middleware/auth.js';

const prisma = new PrismaClient();

export async function authRoutes(app: FastifyInstance) {
  // Login
  app.post('/login', async (req: FastifyRequest, reply: FastifyReply) => {
    const { email, password } = req.body as { email: string; password: string };

    if (!email || !password) {
      return reply.status(400).send({ error: { code: 'BAD_REQUEST', message: 'Email and password required' } });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return reply.status(401).send({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return reply.status(401).send({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } });
    }

    const token = signToken({ id: user.id, email: user.email });

    reply.setCookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,  // 7 days
    });

    return {
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      token,
    };
  });

  // Logout
  app.post('/logout', async (_req, reply) => {
    reply.clearCookie('token');
    return { success: true };
  });

  // Get current user
  app.get('/me', async (req: FastifyRequest, reply: FastifyReply) => {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;
    if (!token) {
      return reply.status(401).send({ error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
    }

    try {
      const jwt = await import('jsonwebtoken');
      const payload = jwt.verify(token, process.env.FLOWFORGE_JWT_SECRET || 'flowforge-dev-secret-change-me') as { id: string };
      const user = await prisma.user.findUnique({ where: { id: payload.id } });
      if (!user) {
        return reply.status(401).send({ error: { code: 'UNAUTHORIZED', message: 'User not found' } });
      }
      return {
        data: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      };
    } catch {
      return reply.status(401).send({ error: { code: 'INVALID_TOKEN', message: 'Invalid token' } });
    }
  });

  // Setup — create initial admin user if none exists
  app.post('/setup', async (req: FastifyRequest, reply: FastifyReply) => {
    const userCount = await prisma.user.count();
    if (userCount > 0) {
      return reply.status(400).send({ error: { code: 'ALREADY_SETUP', message: 'Admin user already exists' } });
    }

    const { email, password, firstName, lastName } = req.body as {
      email: string; password: string; firstName: string; lastName: string;
    };

    if (!email || !password) {
      return reply.status(400).send({ error: { code: 'BAD_REQUEST', message: 'Email and password required' } });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashed, firstName: firstName || 'Admin', lastName: lastName || 'User' },
    });

    const token = signToken({ id: user.id, email: user.email });

    return {
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      token,
    };
  });
}
