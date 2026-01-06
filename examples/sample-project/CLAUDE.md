# Project: TaskFlow SaaS

This is the CLAUDE.md for the TaskFlow SaaS sample project.

## Architecture

This is a full-stack TypeScript application:

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Node.js + Express + Prisma + PostgreSQL
- **Monorepo structure**: Frontend and backend in the same repo

## Directory Structure

```
taskflow-saas/
├── WORKPLAN.md              # Task breakdown (you're reading this)
├── CLAUDE.md                # Project context (this file)
├── shared/
│   └── types/               # Shared TypeScript types
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── stores/          # Zustand stores
│   │   ├── api/             # API client
│   │   └── App.tsx
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Prisma models
│   │   └── server.ts
│   └── package.json
└── docker-compose.yml
```

## Coordination Rules

1. **Shared Types First**: Define all shared interfaces in `shared/types/` before implementing features
2. **API-First**: Backend defines API contracts, frontend consumes them
3. **Domain Isolation**:
   - Frontend agents only modify `frontend/`
   - Backend agents only modify `backend/`
   - DevOps modifies root-level config files
4. **Import Shared Types**: Never duplicate type definitions. Always import from `shared/types/`

## Agent Workflow

When starting work:
1. Read this file and WORKPLAN.md
2. Check `shared/types/` for existing interfaces
3. Work on your assigned section in WORKPLAN.md
4. Update your progress in comments or a PROGRESS.md file

## Tech Stack Details

### Frontend
- **Framework**: React 18 with hooks
- **Routing**: React Router v6
- **State**: Zustand for global state, TanStack Query for server state
- **Styling**: Tailwind CSS with custom design system
- **Forms**: React Hook Form + Zod validation
- **Testing**: Vitest + Testing Library + Playwright

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL 15+
- **ORM**: Prisma
- **Auth**: JWT tokens
- **Validation**: Zod schemas
- **Testing**: Vitest + Supertest

### DevOps
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Deployment**: (TBD - could be Vercel, Railway, or self-hosted)

## Code Standards

- **Language**: TypeScript strict mode everywhere
- **Formatting**: Prettier with 2-space indentation
- **Linting**: ESLint with strict rules
- **Commits**: Conventional commits format
- **Branches**: Feature branches, PRs required

## Getting Started

Each agent should:
1. Check if their domain directory exists, create if not
2. Initialize project structure per their section
3. Set up tooling (package.json, tsconfig, etc.)
4. Start implementing features from WORKPLAN.md
