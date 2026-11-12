# FlowForge

> 100% open-source, MIT-licensed workflow automation platform. Self-hosted alternative to n8n — with all enterprise features included, no paywall, no tiers.

## Quick Start

```bash
# Clone
git clone https://github.com/cmcintosh/flowforge.git
cd flowforge

# Install dependencies
pnpm install

# Set up database
pnpm db:push

# Start development server
pnpm dev
```

## Docker

```bash
docker compose up -d
# Open http://localhost:3000
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Fastify, Prisma, SQLite |
| Frontend | React 19, React Flow, TailwindCSS |
| Build | Vite, TypeScript, pnpm workspaces |
| License | MIT |

## Project Structure

```
flowforge/
├── packages/
│   ├── backend/      # Fastify API server + execution engine
│   ├── frontend/     # React + React Flow workflow builder
│   ├── shared/       # Shared TypeScript types and utilities
│   └── node-sdk/     # SDK for building custom nodes
├── docker/           # Dockerfile and docker-compose.yml
└── docs/             # Documentation
```

## License

MIT — see [LICENSE](./LICENSE)
