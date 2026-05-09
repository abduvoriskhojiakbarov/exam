# Advanced LMS Backend

NestJS backend for an Online Learning Management System with JWT authentication, role based access, courses, modules, lessons, enrollments, assignments and results.

## Tech Stack

- NestJS + TypeScript
- PostgreSQL
- TypeORM
- JWT access token and refresh token cookie
- Docker + Docker Compose
- Swagger documentation
- class-validator validation
- Global exception filter, standard response wrapper and logging middleware

## Roles

- `ADMIN`: manages all users/courses and views all results
- `TEACHER`: creates courses, modules, lessons and grades assignments for own courses
- `STUDENT`: enrolls in courses, views enrolled content, submits assignments and views own results

## Setup

```bash
cp .env.example .env
npm install
npm run start:dev
```

API runs on:

```text
http://localhost:3000/api
```

Swagger docs:

```text
http://localhost:3000/docs
```

## Docker

```bash
cp .env.example .env
docker compose up --build
```

## Main Routes

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`

### Users and Courses

- `GET /api/users`
- `GET /api/users/:id`
- `PATCH /api/users/:id`
- `DELETE /api/users/:id`
- `GET /api/courses`
- `GET /api/courses/:id`
- `POST /api/courses`
- `PUT /api/courses/:id`
- `DELETE /api/courses/:id`

### Modules and Lessons

- `GET /api/courses/:courseId/modules`
- `POST /api/courses/:courseId/modules`
- `GET /api/modules/:moduleId/lessons`
- `POST /api/modules/:moduleId/lessons`

### Enrollments

- `POST /api/courses/:id/enroll`
- `GET /api/my-courses`

### Assignments and Results

- `POST /api/modules/:moduleId/assignments`
- `GET /api/assignments/my`
- `PATCH /api/assignments/:id/grade`
- `GET /api/results`
- `GET /api/results/me`

## Git Workflow Example

```bash
git checkout -b develop
git checkout -b feature/auth
git commit -m "feat(auth): add jwt authentication"
git checkout -b feature/courses
git commit -m "feat(courses): create courses module"
```

## Postman

Import `postman/lms-backend.postman_collection.json`. Set:

- `baseUrl`: `http://localhost:3000/api`
- `accessToken`: value returned by login/register
- `courseId`, `moduleId`, `assignmentId`: created resource ids
