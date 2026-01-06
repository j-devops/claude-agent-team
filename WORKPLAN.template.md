# WORKPLAN.md Template

> Copy this to your project and customize. Agents will read their sections.

## Project Overview

**Name**: [Your Project Name]
**Description**: [What it does]

**Tech Stack**:
- Frontend: [React/Vue/Svelte], [TypeScript], [Tailwind/etc]
- Backend: [Node/Python/Go], [Express/FastAPI/etc]
- Database: [PostgreSQL/MongoDB/etc]
- Infrastructure: [Docker/K8s/etc]

---

## Shared Contracts

> Define interfaces BEFORE agents start coding. This prevents mismatches.

Location: `shared/types/` or `docs/contracts/`

```typescript
// Example: shared/types/index.ts
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: Date;
}

export interface ApiResponse<T> {
  data: T;
  error?: { code: string; message: string };
}
```

---

# Phase 1: Development (Parallel)

> Development agents work simultaneously on their domains.
> Each agent marks themselves COMPLETE in PROGRESS.md when done.

## @backend-architect Tasks

### Setup
- [ ] Initialize [Express/FastAPI/etc] + TypeScript project
- [ ] Configure database connection (PostgreSQL/MongoDB)
- [ ] Set up middleware (CORS, auth, validation, error handling)
- [ ] Create health check endpoint

### Core API
- [ ] Implement authentication endpoints (register, login, logout)
- [ ] Implement [Resource 1] CRUD endpoints
- [ ] Implement [Resource 2] CRUD endpoints
- [ ] Add request validation with Zod/Joi
- [ ] Add authorization middleware

### Completion Checklist
- [ ] All endpoints implemented and tested
- [ ] Unit tests written and passing
- [ ] Database schema/migrations created
- [ ] Dependencies listed in package.json/requirements.txt
- [ ] .env.example created with all required variables
- [ ] Health check endpoint responds
- [ ] README or PROGRESS.md documents setup steps
- [ ] **Mark complete in PROGRESS.md**

---

## @frontend-architect Tasks

### Setup
- [ ] Initialize [Vite/Next.js/etc] + React + TypeScript project
- [ ] Configure Tailwind CSS and design system
- [ ] Set up React Router and route structure
- [ ] Create base layout component with navigation
- [ ] Configure state management (Zustand/Redux/etc)

### Core Features
- [ ] Create login/signup pages
- [ ] Build [Feature 1] UI components
- [ ] Build [Feature 2] UI components
- [ ] Implement API client with error handling
- [ ] Add loading and error states

### Polish
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Accessibility review (ARIA, keyboard nav, screen readers)
- [ ] Error boundaries
- [ ] Keyboard shortcuts (if applicable)

### Completion Checklist
- [ ] All components implemented and render without errors
- [ ] Unit tests written and passing
- [ ] Dependencies listed in package.json
- [ ] .env.example created with API URL configuration
- [ ] README or PROGRESS.md documents setup steps
- [ ] **Mark complete in PROGRESS.md**

---

## @devops-engineer Tasks

### Local Development Infrastructure
- [ ] Create Dockerfile for backend
- [ ] Create Dockerfile for frontend
- [ ] Create docker-compose.yml with all services (app, db, redis, etc.)
- [ ] Add health checks to docker-compose
- [ ] Create .env.development with sensible defaults

### CI/CD
- [ ] Create GitHub Actions workflow for backend (lint, test, build)
- [ ] Create GitHub Actions workflow for frontend (lint, test, build)
- [ ] Add type checking steps
- [ ] Configure deployment workflow (if deploying now)

### Documentation
- [ ] Document how to run with Docker Compose
- [ ] Document environment variables
- [ ] Create DEPLOYMENT.md (if deploying)

### Completion Checklist
- [ ] docker-compose.yml works and starts all services
- [ ] CI/CD workflows configured
- [ ] Documentation complete
- [ ] **Mark complete in PROGRESS.md**

---

## @test-architect Tasks

### Frontend Unit Tests
- [ ] Component tests with React Testing Library
- [ ] Custom hook tests
- [ ] Store/state management tests
- [ ] Utility function tests

### Backend Unit Tests
- [ ] Service layer tests
- [ ] API route handler tests
- [ ] Middleware tests
- [ ] Utility function tests

### Test Configuration
- [ ] Set up Vitest/Jest configuration
- [ ] Configure code coverage
- [ ] Add test scripts to package.json

### Completion Checklist
- [ ] All unit tests written and passing
- [ ] Coverage > 80% for critical paths
- [ ] Test documentation in README
- [ ] **Mark complete in PROGRESS.md**

---

## @qa-engineer Tasks

### Test Strategy
- [ ] Identify critical user flows
- [ ] List edge cases and error scenarios
- [ ] Create TEST_PLAN.md

### E2E Test Suite
- [ ] Set up Playwright/Cypress
- [ ] Write authentication flow tests
- [ ] Write happy path tests for main features
- [ ] Write error scenario tests
- [ ] Write accessibility tests (if applicable)

### Test Fixtures
- [ ] Create test data fixtures
- [ ] Create helper utilities for common operations

### Completion Checklist
- [ ] E2E tests written (not necessarily run yet)
- [ ] Test fixtures created
- [ ] TEST_PLAN.md created
- [ ] **Mark complete in PROGRESS.md**

---

# Phase 2: Integration & Verification (Sequential)

> This phase starts AFTER Phase 1 is complete.
> @delivery-lead polls PROGRESS.md and starts when all Phase 1 agents report COMPLETE.

## @delivery-lead Tasks

### Prerequisites Check
- [ ] Poll PROGRESS.md every 30 seconds
- [ ] Verify all Phase 1 agents marked COMPLETE
- [ ] Read setup instructions from each agent's documentation

### Dependency Installation
- [ ] Install backend dependencies (`cd backend && npm install`)
- [ ] Install frontend dependencies (`cd frontend && npm install`)
- [ ] Install E2E test dependencies (`cd e2e-tests && npm install`)
- [ ] Verify no installation errors

### Infrastructure Setup
- [ ] Start database (via Docker Compose or local)
- [ ] Run database migrations
- [ ] Seed initial data (if applicable)
- [ ] Set up environment variables from .env.example

### Service Startup
- [ ] Start backend service
- [ ] Verify backend health check endpoint responds
- [ ] Start frontend dev server
- [ ] Verify frontend loads in browser

### Integration Verification
- [ ] Test frontend can reach backend API
- [ ] Test authentication flow end-to-end
- [ ] Test at least one CRUD operation end-to-end
- [ ] Check browser console for errors

### Test Execution
- [ ] Run backend unit tests
- [ ] Run frontend unit tests
- [ ] Run E2E tests (if written by @qa-engineer)
- [ ] Document any test failures

### Deliverables
- [ ] Create INTEGRATION_REPORT.md with:
  - What services are running and on what ports
  - How to access and test the feature
  - Test results summary
  - Any issues found
- [ ] Update PROGRESS.md with integration status
- [ ] If issues found, create INTEGRATION_FAILURES.md

### Completion Checklist
- [ ] All services running without errors
- [ ] Basic manual testing shows feature works
- [ ] Tests passing (or failures documented)
- [ ] User can follow INTEGRATION_REPORT.md to test the feature
- [ ] **Mark complete in PROGRESS.md**

---

## @security-auditor Tasks

> Only run if feature involves: auth, payments, data handling, or user uploads.

### Security Review
- [ ] Review authentication implementation
- [ ] Check for SQL injection vulnerabilities
- [ ] Check for XSS vulnerabilities
- [ ] Verify secrets are not in code
- [ ] Check authorization on protected endpoints
- [ ] Review CORS configuration
- [ ] Check rate limiting on sensitive endpoints
- [ ] Verify input validation

### Deliverables
- [ ] Create SECURITY_REVIEW.md with findings
- [ ] Update PROGRESS.md with review status

---

# Integration Checkpoints

Before marking Phase 2 complete:

- [ ] All Phase 1 agents marked COMPLETE
- [ ] All dependencies installed successfully
- [ ] All services start without errors
- [ ] Services can communicate with each other
- [ ] Basic manual testing confirms feature works
- [ ] Unit tests pass
- [ ] E2E tests pass (or failures are documented)
- [ ] Security review complete (if applicable)
- [ ] INTEGRATION_REPORT.md created
- [ ] User can test the feature by following documentation

---

# Definition of Done

A feature is only DONE when:

1. ✅ Code is written and compiles
2. ✅ Unit tests pass
3. ✅ Services can be started and are healthy
4. ✅ Feature works end-to-end (not just code exists)
5. ✅ E2E tests pass (or manual testing confirms)
6. ✅ Documentation allows user to test it themselves

**Code written ≠ Feature done. Feature working end-to-end = Done.**

---

# File-Based Coordination

Agents communicate via PROGRESS.md:

```markdown
# Development Progress

## Phase 1: Development
- [x] @backend-architect - COMPLETE (2024-01-06 14:23)
- [x] @frontend-architect - COMPLETE (2024-01-06 14:25)
- [x] @devops-engineer - COMPLETE (2024-01-06 14:28)
- [x] @test-architect - COMPLETE (2024-01-06 14:30)
- [x] @qa-engineer - COMPLETE (2024-01-06 14:35)

## Phase 2: Integration
- [x] @delivery-lead - COMPLETE (2024-01-06 14:50)
  - All services running
  - E2E tests passing
  - Feature verified working
- [x] @security-auditor - COMPLETE (2024-01-06 15:00)

## Blockers
None - all clear!
```

---

# Notes

- **Shared types** go in `shared/types/` or `docs/contracts/`
- **Import, don't duplicate** - frontend imports from shared, backend exports to shared
- **Document blockers** in PROGRESS.md under "Blockers" section
- **Don't silently wait** - if blocked, document it so others can help
- **Integration is not optional** - Phase 2 must complete for feature to be "done"
