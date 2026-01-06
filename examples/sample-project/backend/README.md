# TaskFlow Backend API

REST API backend for TaskFlow SaaS application built with Node.js, Express, TypeScript, Prisma, and PostgreSQL.

## Features

- RESTful API with Express.js
- TypeScript for type safety
- PostgreSQL database with Prisma ORM
- JWT-based authentication
- Role-based authorization (user, admin)
- Request validation with Zod
- Rate limiting
- Structured logging with Winston
- Security headers with Helmet
- CORS configuration
- Compression middleware
- Error handling middleware
- Pagination and filtering support
- Search functionality

## Prerequisites

- Node.js 18+
- PostgreSQL 15+
- npm or yarn

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Update the `.env` file with your database credentials and JWT secret.

4. Generate Prisma client:
```bash
npm run prisma:generate
```

5. Run database migrations:
```bash
npm run prisma:migrate
```

## Development

Start the development server with hot reload:
```bash
npm run dev
```

The server will start on `http://localhost:3000`

## Database Commands

- Generate Prisma client: `npm run prisma:generate`
- Run migrations: `npm run prisma:migrate`
- Open Prisma Studio: `npm run prisma:studio`

## Build

Build for production:
```bash
npm run build
```

Start production server:
```bash
npm start
```

## Testing

Run tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

## API Documentation

See [API.md](./API.md) for detailed API documentation.

## Project Structure

```
backend/
├── prisma/
│   └── schema.prisma       # Database schema
├── src/
│   ├── middleware/         # Express middleware
│   │   ├── auth.ts        # Authentication & authorization
│   │   ├── errorHandler.ts # Error handling
│   │   ├── rateLimiter.ts # Rate limiting
│   │   └── validate.ts    # Request validation
│   ├── routes/            # API routes
│   │   ├── auth.ts        # Auth endpoints
│   │   ├── tasks.ts       # Task CRUD
│   │   └── users.ts       # User management
│   ├── utils/             # Utilities
│   │   ├── jwt.ts         # JWT utilities
│   │   ├── logger.ts      # Winston logger
│   │   ├── password.ts    # Password hashing
│   │   └── validation.ts  # Zod schemas
│   └── server.ts          # Express app setup
├── .env.example           # Environment variables template
├── package.json
├── tsconfig.json
└── README.md
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | - |
| `JWT_SECRET` | Secret key for JWT signing | - |
| `JWT_EXPIRES_IN` | JWT token expiration | `7d` |
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment (development/production) | `development` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:5173` |

## Security Features

- Helmet.js for security headers
- bcrypt for password hashing
- JWT for stateless authentication
- Rate limiting on all endpoints
- Stricter rate limiting on auth endpoints
- Input validation with Zod
- Role-based access control
- SQL injection prevention via Prisma

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users/me` - Get current user
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get user by ID
- `DELETE /api/users/:id` - Delete user (admin only)

### Tasks
- `GET /api/tasks` - List tasks (with pagination & filters)
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create new task
- `PATCH /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Health
- `GET /health` - Health check endpoint

## License

ISC
