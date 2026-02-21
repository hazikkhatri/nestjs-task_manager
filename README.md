# Task Manager API

A production-ready REST API built with **NestJS**, **TypeORM**, and **PostgreSQL**. Admins can create users and assign them tasks. Users can view and update the status of their own tasks.

---

## Tech Stack

- **NestJS** — framework
- **TypeORM** — ORM
- **PostgreSQL** — database
- **Passport + JWT** — authentication
- **bcrypt** — password hashing
- **class-validator** — request validation

---

## Project Structure

```
src/
├── auth/
│   ├── decorators/         # @CurrentUser(), @Roles()
│   ├── dto/                # RegisterDto, LoginDto
│   ├── guards/             # JwtAuthGuard, RolesGuard
│   ├── strategies/         # JwtStrategy
│   ├── auth.controller.ts
│   ├── auth.module.ts
│   └── auth.service.ts
├── users/
│   ├── dto/                # CreateUserDto, UpdateUserDto
│   ├── entities/           # User entity
│   ├── users.controller.ts
│   ├── users.module.ts
│   └── users.service.ts
├── tasks/
│   ├── dto/                # CreateTaskDto, UpdateTaskDto
│   ├── entities/           # Task entity
│   ├── tasks.controller.ts
│   ├── tasks.module.ts
│   └── tasks.service.ts
├── app.module.ts
└── main.ts
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- PostgreSQL running locally

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd task-manager
npm install
```

### 2. Configure Environment

Create a `.env` file in the root:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=your_db_password
DB_NAME=task_manager

JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d
```

### 3. Run the App

```bash
# development (watch mode)
npm run start:dev

# production
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000/api`

> Tables are auto-created on startup via `synchronize: true` (TypeORM). Disable this in production and use migrations instead.

---

## API Reference

All routes are prefixed with `/api`.

### Auth

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register a new account |
| POST | `/api/auth/login` | Public | Login and get JWT token |

**Register** `POST /api/auth/register`
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123",
  "role": "admin"   // optional, defaults to "user"
}
```

**Login** `POST /api/auth/login`
```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

**Response (both)**
```json
{
  "access_token": "eyJhbGci...",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "admin"
  }
}
```

---

### Users (Admin only)

All `/api/users` routes require a valid JWT token with `role: admin`.

Add header to every request:
```
Authorization: Bearer <your_access_token>
```

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users` | Create a new user |
| GET | `/api/users` | Get all users |
| GET | `/api/users/:id` | Get a single user |
| PATCH | `/api/users/:id` | Update a user |
| DELETE | `/api/users/:id` | Delete a user |

**Create User** `POST /api/users`
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "secret123",
  "role": "user"
}
```

---

### Tasks

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/tasks` | Admin only | Create and assign a task |
| GET | `/api/tasks` | Admin + User | Admins see all, users see their own |
| GET | `/api/tasks/:id` | Admin + User | Get a single task |
| PATCH | `/api/tasks/:id` | Admin + User | Update task (users can update status only) |
| DELETE | `/api/tasks/:id` | Admin only | Delete a task |

**Create Task** `POST /api/tasks` *(Admin only)*
```json
{
  "title": "Fix login bug",
  "description": "The login page crashes on mobile",
  "deadline": "2025-03-01T00:00:00.000Z",
  "assignedToId": "user-uuid-here"
}
```

**Update Task** `PATCH /api/tasks/:id`
```json
{
  "status": "in_progress"   // users can update this
}
```

Task statuses: `pending` | `in_progress` | `done`

---

## Roles & Permissions

| Action | Admin | User |
|--------|-------|------|
| Register / Login | ✅ | ✅ |
| Create users | ✅ | ❌ |
| Manage all users | ✅ | ❌ |
| Create & assign tasks | ✅ | ❌ |
| View all tasks | ✅ | ❌ |
| View own tasks | ✅ | ✅ |
| Update any task | ✅ | ❌ |
| Update own task status | ✅ | ✅ |
| Delete tasks | ✅ | ❌ |

---

## Scripts

```bash
npm run start:dev     # dev with hot reload
npm run start:prod    # production
npm run build         # compile TypeScript
npm run lint          # lint & fix
npm run test          # unit tests
npm run test:e2e      # end-to-end tests
```