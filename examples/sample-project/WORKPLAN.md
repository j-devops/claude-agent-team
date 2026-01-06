# WORKPLAN - Sample SaaS Application

## Project Overview

**Name**: TaskFlow SaaS
**Description**: A modern task management SaaS application with real-time collaboration features

**Tech Stack**:
- Frontend: React 18, TypeScript, Tailwind CSS, Zustand
- Backend: Node.js, Express, TypeScript, PostgreSQL, Prisma
- Infrastructure: Docker, Docker Compose, GitHub Actions
- Testing: Vitest, Playwright

---

## Shared Contracts

Location: `shared/types/`

```typescript
// shared/types/index.ts
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
  assigneeId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T> {
  data: T;
  error?: { code: string; message: string };
}
```

---

## @frontend-architect Tasks

> Build the React frontend application

### Phase 1: Setup
- [ ] Initialize Vite + React + TypeScript project
- [ ] Configure Tailwind CSS
- [ ] Set up React Router
- [ ] Create base layout component with navigation
- [ ] Set up Zustand store structure

### Phase 2: Core Features
- [ ] Create login/signup pages
- [ ] Build task dashboard component
- [ ] Create task creation modal
- [ ] Implement task list with filtering
- [ ] Add task detail view
- [ ] Build user profile page

### Phase 3: Polish
- [ ] Add loading states throughout
- [ ] Implement error boundaries
- [ ] Make responsive for mobile
- [ ] Add keyboard shortcuts
- [ ] Accessibility audit (WCAG AA)

---

## @backend-architect Tasks

> Build the REST API backend

### Phase 1: Setup
- [ ] Initialize Node.js + Express + TypeScript project
- [ ] Set up Prisma with PostgreSQL
- [ ] Create database schema for users and tasks
- [ ] Configure middleware (CORS, helmet, compression)
- [ ] Set up JWT authentication

### Phase 2: Core API
- [ ] Implement auth endpoints (register, login, logout)
- [ ] Create CRUD endpoints for tasks
- [ ] Add user management endpoints
- [ ] Implement authorization middleware
- [ ] Add request validation with Zod

### Phase 3: Enhancement
- [ ] Add pagination to list endpoints
- [ ] Implement search and filtering
- [ ] Add rate limiting
- [ ] Set up structured logging
- [ ] Create API documentation

---

## @devops-engineer Tasks

> Set up development and deployment infrastructure

### Phase 1: Local Development
- [ ] Create Dockerfile for backend
- [ ] Create Dockerfile for frontend
- [ ] Create docker-compose.yml for local dev
- [ ] Add health check endpoints

### Phase 2: CI/CD
- [ ] Create GitHub Actions workflow for backend tests
- [ ] Create GitHub Actions workflow for frontend tests
- [ ] Add linting and type-checking steps
- [ ] Set up build and deployment pipeline

### Phase 3: Production Ready
- [ ] Configure environment-based configs
- [ ] Set up secrets management
- [ ] Add monitoring and alerting
- [ ] Create deployment documentation

---

## @test-architect Tasks

> Write comprehensive unit tests

### Frontend Tests
- [ ] Test React components with Vitest
- [ ] Test custom hooks
- [ ] Test Zustand stores
- [ ] Achieve 80%+ code coverage

### Backend Tests
- [ ] Test API routes
- [ ] Test authentication middleware
- [ ] Test database models
- [ ] Test validation logic
- [ ] Achieve 80%+ code coverage

---

## @code-nitpicker-9000 Tasks

> Code quality and best practices review

### Review Checklist
- [ ] Review frontend code for React best practices
- [ ] Check TypeScript types are strict and accurate
- [ ] Verify no console.log statements in production code
- [ ] Ensure proper error handling throughout
- [ ] Check for security vulnerabilities
- [ ] Verify consistent code style
- [ ] Review for performance issues

---

## @frontend-qa-enforcer Tasks

> End-to-end testing and QA

### E2E Test Coverage
- [ ] Set up Playwright
- [ ] Write authentication flow tests
- [ ] Test task creation workflow
- [ ] Test task editing and deletion
- [ ] Test filtering and search
- [ ] Test error scenarios
- [ ] Cross-browser testing (Chrome, Firefox, Safari)

### Manual QA
- [ ] Create test plan document
- [ ] Test on different screen sizes
- [ ] Verify accessibility with screen reader
- [ ] Performance testing

---

## Integration Checkpoints

After each phase, verify:

1. [ ] All code compiles without errors
2. [ ] Unit tests pass
3. [ ] E2E tests pass
4. [ ] No linting errors
5. [ ] Types are consistent across frontend and backend
6. [ ] API contracts match between client and server

---

## Notes

- All shared types go in `shared/types/`
- Frontend imports backend types from shared folder
- Use conventional commits for git messages
- When blocked, document in a `BLOCKERS.md` file
- Daily standup: Each agent reports progress in `PROGRESS.md`
