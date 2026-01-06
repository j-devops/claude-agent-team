# TaskFlow SaaS - Quick Start Guide

## Prerequisites

- Node.js 18+
- PostgreSQL 15+
- npm or yarn

## Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update `.env` with your PostgreSQL credentials:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/taskflow?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
```

5. Generate Prisma client:
```bash
npm run prisma:generate
```

6. Run database migrations:
```bash
npm run prisma:migrate
```

7. Start the development server:
```bash
npm run dev
```

The backend API will be running at `http://localhost:3000`

## Testing the API

### Health Check
```bash
curl http://localhost:3000/health
```

### Register a User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Save the `token` from the response for authenticated requests.

### Create a Task
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "My First Task",
    "description": "This is a test task",
    "assigneeId": "USER_ID_FROM_LOGIN"
  }'
```

### List Tasks
```bash
curl http://localhost:3000/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### List Tasks with Filters
```bash
curl "http://localhost:3000/api/tasks?status=todo&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## API Documentation

Full API documentation is available in [backend/API.md](backend/API.md)

## Project Structure

- `/shared/types/` - Shared TypeScript types used by both frontend and backend
- `/backend/` - Express.js REST API
- `/frontend/` - React frontend (to be implemented)

## Development Tips

1. Use Prisma Studio to view your database:
```bash
cd backend
npm run prisma:studio
```

2. Run tests:
```bash
cd backend
npm test
```

3. Check logs for debugging - the backend uses Winston for structured logging

4. All API endpoints return consistent error responses with error codes

5. Rate limiting is in place:
   - General endpoints: 100 requests per 15 minutes
   - Auth endpoints: 5 requests per 15 minutes

## Next Steps

1. Frontend team can start building the React UI using the types from `/shared/types/`
2. DevOps can containerize the application with Docker
3. QA team can write integration and E2E tests

For detailed task breakdown, see [WORKPLAN.md](WORKPLAN.md)
