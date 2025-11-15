# Free Kahoot – Reference Implementation

This repository hosts a production-focused Next.js application that fulfills the PRDs for an AI-assisted, real-time quiz
platform. It includes user management, plan enforcement, quiz authoring, AI quiz generation, and real-time game session
APIs. The stack targets Vercel deployment with PostgreSQL (Prisma) and Azure OpenAI.

## Key Capabilities

- **Authentication & Plans** – Email/password auth with signed JWT cookies, plan seeding helpers, and quota tracking.
- **Quiz Service** – Prisma models for quiz/question/option entities with validation and duplication helpers.
- **AI Workflows** – AIJob orchestration, Azure OpenAI schema-enforced responses, and dev-mode fallbacks.
- **Game Service** – Game + player session models, state transitions, player joins, and scoring utilities.
- **Deployment Docs** – Step-by-step Vercel instructions located at `docs/deployment-vercel.md` (also rendered at
  `/docs/deployment-vercel`).

## Getting Started

```bash
npm install
cp .env.example .env
# configure secrets, then
npx prisma migrate dev
npm run dev
```

### Testing

Business logic is covered by [Vitest](https://vitest.dev/). Run:

```bash
npm test
```

Tests focus on plan limits, quiz validation rules, and the game state machine.

## Project Structure

```
app/                 # Next.js app router pages + API routes
prisma/schema.prisma # Database models
src/lib              # Shared helpers (Prisma client, auth, env parsing)
src/server/services  # Domain-specific services (plan, quiz, AI, game)
docs/                # Deployment and ops references
```

## Next Steps

- Wire a UI for quiz editing/hosting using the provided APIs.
- Connect to a managed WebSocket provider to broadcast live events at scale.
- Expand AI ingestion by adding PDF parsing and URL extraction utilities feeding into `processAIJob`.

The repo is intentionally modular so each service can evolve independently while sharing Prisma models.
