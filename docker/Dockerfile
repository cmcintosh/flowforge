# Build stage
FROM node:20-slim AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9.15.0

# Copy workspace config
COPY package.json pnpm-workspace.yaml tsconfig.base.json tsconfig.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/backend/package.json packages/backend/
COPY packages/frontend/package.json packages/frontend/

# Install dependencies
RUN pnpm install --frozen-lockfile || pnpm install

# Copy source
COPY packages/ packages/

# Build shared first, then backend and frontend
RUN pnpm --filter @flowforge/shared build
RUN pnpm --filter @flowforge/backend build
RUN pnpm --filter @flowforge/frontend build

# Production stage
FROM node:20-slim AS production

WORKDIR /app

RUN npm install -g pnpm@9.15.0

# Copy only what we need
COPY package.json pnpm-workspace.yaml ./
COPY packages/shared/package.json packages/shared/
COPY packages/backend/package.json packages/backend/
COPY packages/frontend/package.json packages/frontend/

# Install production deps only
RUN pnpm install --prod || pnpm install

# Copy built artifacts
COPY --from=builder /app/packages/shared/dist packages/shared/dist
COPY --from=builder /app/packages/backend/dist packages/backend/dist
COPY --from=builder /app/packages/backend/prisma packages/backend/prisma
COPY --from=builder /app/packages/frontend/dist packages/frontend/dist

# Generate Prisma client
RUN pnpm --filter @flowforge/backend db:generate

# Create data directory
RUN mkdir -p /app/data

ENV FLOWFORGE_PORT=3000
ENV FLOWFORGE_HOST=0.0.0.0
ENV DATABASE_URL="file:/app/data/flowforge.db"

EXPOSE 3000

# Start command: push DB schema, serve frontend + API
CMD ["sh", "-c", "pnpm --filter @flowforge/backend db:push && node packages/backend/dist/index.js"]
