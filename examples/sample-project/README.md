# TaskFlow SaaS

A modern task management SaaS application with real-time collaboration features.

## Overview

TaskFlow is a full-stack TypeScript application built with:
- **Frontend**: React 18, Vite, Tailwind CSS, Zustand
- **Backend**: Node.js, Express, PostgreSQL, Prisma
- **Infrastructure**: Docker, Docker Compose, GitHub Actions

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Git

### Running Locally

```bash
# Clone the repository
git clone https://github.com/your-org/taskflow-saas.git
cd taskflow-saas

# Create environment file
cp .env.example .env

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Access the application
# Frontend: http://localhost:5173
# Backend: http://localhost:3000
# Health: http://localhost:3000/health
```

That's it! The application is now running with:
- Frontend on port 5173
- Backend API on port 3000
- PostgreSQL database on port 5432
- Redis cache on port 6379

## Project Structure

```
taskflow-saas/
├── .github/
│   └── workflows/          # CI/CD pipelines
├── backend/
│   ├── src/                # Backend source code
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Prisma models
│   │   ├── health.ts       # Health check endpoints
│   │   ├── monitoring.ts   # Metrics and logging
│   │   └── server.ts       # Main server file
│   ├── prisma/             # Database schema and migrations
│   ├── Dockerfile          # Backend container
│   └── package.json
├── frontend/
│   ├── src/                # Frontend source code
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── stores/         # Zustand stores
│   │   ├── api/            # API client
│   │   └── App.tsx
│   ├── public/             # Static assets
│   ├── Dockerfile          # Frontend container
│   ├── nginx.conf          # Nginx configuration
│   └── package.json
├── shared/
│   └── types/              # Shared TypeScript types
├── docker-compose.yml      # Local development setup
├── DEPLOYMENT.md           # Deployment guide
├── MONITORING.md           # Monitoring guide
├── SECRETS.md              # Secrets management guide
└── README.md               # This file
```

## Development

### Backend Development

```bash
cd backend

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Start development server
npm run dev

# Run tests
npm test

# Lint
npm run lint

# Type check
npm run type-check
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Run E2E tests
npm run test:e2e

# Build for production
npm run build
```

### Database Management

```bash
# Access database
docker-compose exec postgres psql -U taskflow

# Run migrations
docker-compose exec backend npx prisma migrate deploy

# Create a new migration
cd backend
npx prisma migrate dev --name your_migration_name

# Reset database (CAUTION: deletes all data)
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio
```

## Testing

### Unit Tests

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test

# With coverage
npm test -- --coverage
```

### E2E Tests

```bash
cd frontend
npm run test:e2e
```

### Integration Tests

```bash
# Start test environment
docker-compose -f docker-compose.test.yml up -d

# Run integration tests
npm run test:integration
```

## CI/CD

### GitHub Actions Workflows

1. **Backend CI** (`.github/workflows/backend-ci.yml`)
   - Triggered on push/PR to backend files
   - Runs linting, type checking, tests
   - Builds Docker image

2. **Frontend CI** (`.github/workflows/frontend-ci.yml`)
   - Triggered on push/PR to frontend files
   - Runs linting, type checking, tests, E2E tests
   - Builds Docker image

3. **Deployment** (`.github/workflows/deploy.yml`)
   - Triggered on tag creation or manual dispatch
   - Builds and pushes Docker images
   - Deploys to staging/production
   - Runs smoke tests

### Environment Setup

Configure these secrets in GitHub repository settings:

```
POSTGRES_PASSWORD
JWT_SECRET
VITE_API_URL
CORS_ORIGIN
SENTRY_DSN (optional)
NEW_RELIC_LICENSE_KEY (optional)
```

## Deployment

### Staging

Push to `develop` branch:
```bash
git push origin develop
```

### Production

Create a version tag:
```bash
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## Monitoring

### Health Checks

- Frontend: http://localhost:8080/health
- Backend: http://localhost:3000/health
- Metrics: http://localhost:3000/metrics

### Logs

```bash
# View all logs
docker-compose logs -f

# View specific service
docker-compose logs -f backend

# View last 100 lines
docker-compose logs --tail=100 backend
```

For monitoring setup, see [MONITORING.md](./MONITORING.md).

## Architecture

### Tech Stack

**Frontend:**
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Zustand for state management
- React Router for navigation
- TanStack Query for API state

**Backend:**
- Node.js with Express
- TypeScript for type safety
- Prisma ORM
- PostgreSQL database
- JWT authentication
- Zod for validation

**DevOps:**
- Docker for containerization
- Docker Compose for local dev
- GitHub Actions for CI/CD
- Nginx for frontend serving
- Redis for caching

### API Endpoints

```
POST   /api/auth/register    - Register new user
POST   /api/auth/login       - Login user
POST   /api/auth/logout      - Logout user
GET    /api/tasks            - Get all tasks
POST   /api/tasks            - Create task
GET    /api/tasks/:id        - Get task by ID
PUT    /api/tasks/:id        - Update task
DELETE /api/tasks/:id        - Delete task
GET    /api/users/me         - Get current user
GET    /health               - Health check
GET    /health/ready         - Readiness check
GET    /health/live          - Liveness check
GET    /metrics              - Application metrics
```

## Security

- All passwords hashed with bcrypt
- JWT tokens for authentication
- CORS configured for allowed origins
- Helmet.js for security headers
- Rate limiting on API endpoints
- Input validation with Zod
- SQL injection protection via Prisma
- XSS protection in frontend

## Performance

- Redis caching for frequent queries
- Database query optimization
- Lazy loading for frontend components
- Image optimization
- Gzip compression
- CDN for static assets (production)

## Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Database Connection Issues

```bash
# Check database status
docker-compose ps postgres

# Restart database
docker-compose restart postgres

# View database logs
docker-compose logs postgres
```

### Cannot Connect to Backend from Frontend

Check CORS settings in `.env`:
```
CORS_ORIGIN=http://localhost:5173
```

### Docker Issues

```bash
# Remove all containers and volumes
docker-compose down -v

# Rebuild from scratch
docker-compose build --no-cache
docker-compose up -d
```

## Contributing

This project follows agent-based development. See [CLAUDE.md](./CLAUDE.md) for the agent coordination guide.

### Code Style

- Use TypeScript strict mode
- Follow Prettier formatting (2 spaces)
- Use ESLint rules
- Write tests for new features
- Use conventional commits

### Commit Messages

```
feat: Add user authentication
fix: Resolve database connection issue
docs: Update deployment guide
test: Add tests for task API
chore: Update dependencies
```

## Documentation

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide
- [MONITORING.md](./MONITORING.md) - Monitoring and alerting
- [SECRETS.md](./SECRETS.md) - Secrets management
- [CLAUDE.md](./CLAUDE.md) - Agent coordination guide
- [WORKPLAN.md](./WORKPLAN.md) - Project task breakdown

## License

MIT

## Support

For issues and questions:
- Create an issue on GitHub
- Contact: support@taskflow.example.com
- Documentation: https://docs.taskflow.example.com
