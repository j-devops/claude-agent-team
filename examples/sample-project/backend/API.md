# TaskFlow API Documentation

Base URL: `http://localhost:3000/api`

## Authentication

All endpoints except `/auth/register` and `/auth/login` require authentication via JWT token.

Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Authentication

#### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:** `201 Created`
```json
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt-token"
  }
}
```

#### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt-token"
  }
}
```

### Users

#### Get Current User
```http
GET /users/me
```

**Response:** `200 OK`
```json
{
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### List All Users
```http
GET /users
```

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Get User by ID
```http
GET /users/:id
```

**Response:** `200 OK`
```json
{
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Delete User (Admin Only)
```http
DELETE /users/:id
```

**Response:** `204 No Content`

### Tasks

#### List Tasks (with pagination and filters)
```http
GET /tasks?page=1&limit=10&status=todo&assigneeId=uuid&search=keyword
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `status` (optional): Filter by status (`todo`, `in_progress`, `done`)
- `assigneeId` (optional): Filter by assignee UUID
- `search` (optional): Search in title and description

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Task Title",
      "description": "Task description",
      "status": "todo",
      "assigneeId": "uuid",
      "assignee": {
        "id": "uuid",
        "name": "John Doe",
        "email": "user@example.com"
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

#### Get Task by ID
```http
GET /tasks/:id
```

**Response:** `200 OK`
```json
{
  "data": {
    "id": "uuid",
    "title": "Task Title",
    "description": "Task description",
    "status": "todo",
    "assigneeId": "uuid",
    "assignee": {
      "id": "uuid",
      "name": "John Doe",
      "email": "user@example.com"
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Create Task
```http
POST /tasks
```

**Request Body:**
```json
{
  "title": "Task Title",
  "description": "Task description",
  "assigneeId": "uuid"
}
```

**Response:** `201 Created`
```json
{
  "data": {
    "id": "uuid",
    "title": "Task Title",
    "description": "Task description",
    "status": "todo",
    "assigneeId": "uuid",
    "assignee": {
      "id": "uuid",
      "name": "John Doe",
      "email": "user@example.com"
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Update Task
```http
PATCH /tasks/:id
```

**Request Body:** (all fields optional)
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "status": "in_progress",
  "assigneeId": "uuid"
}
```

**Response:** `200 OK`
```json
{
  "data": {
    "id": "uuid",
    "title": "Updated Title",
    "description": "Updated description",
    "status": "in_progress",
    "assigneeId": "uuid",
    "assignee": {
      "id": "uuid",
      "name": "John Doe",
      "email": "user@example.com"
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Delete Task
```http
DELETE /tasks/:id
```

**Response:** `204 No Content`

### Health Check

#### Health Check
```http
GET /health
```

**Response:** `200 OK`
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456
}
```

## Error Responses

All error responses follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

### Common Error Codes

- `VALIDATION_ERROR` - Invalid request data (400)
- `NOT_AUTHENTICATED` - No token provided (401)
- `INVALID_TOKEN` - Invalid or expired token (401)
- `INVALID_CREDENTIALS` - Wrong email or password (401)
- `FORBIDDEN` - Insufficient permissions (403)
- `NOT_FOUND` - Resource not found (404)
- `EMAIL_EXISTS` - Email already registered (409)
- `RATE_LIMIT_EXCEEDED` - Too many requests (429)
- `INTERNAL_ERROR` - Server error (500)

## Rate Limits

- General endpoints: 100 requests per 15 minutes per IP
- Auth endpoints: 5 requests per 15 minutes per IP

## Status Values

Tasks can have one of these status values:
- `todo` - Not started
- `in_progress` - Work in progress
- `done` - Completed

## Role Values

Users can have one of these roles:
- `user` - Regular user
- `admin` - Administrator with elevated permissions
