# EduCore LMS Backend

Backend for the EduCore LMS platform — manages Users, Roles, Courses, Assignments, and Submissions.

## Tech Stack
- Node.js + Express
- PostgreSQL
- JWT authentication
- bcryptjs for password hashing

## Setup (Day 1–4)

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in your real database credentials and a JWT secret:
   ```bash
   cp .env.example .env
   ```
3. Create the database and load the schema:
   ```bash
   createdb educore_lms
   psql -d educore_lms -f models/schema.sql
   ```
4. Start the server:
   ```bash
   npm run dev
   ```
   Server runs at `http://localhost:5000`.

## Database Schema

Tables: `users`, `roles`, `courses`, `assignments`, `submissions`, `certificates`, `notifications`.
Full definitions are in `models/schema.sql`. Default roles seeded: Student, Instructor, Team Lead, Admin.

## API Documentation (Day 5–6)

### Auth

**POST /api/auth/register**
Registers a new user (default role: Student).
```json
{
  "full_name": "Ayesha Khan",
  "email": "ayesha@example.com",
  "password": "secret123"
}
```
Response `201`:
```json
{ "success": true, "user": { "id": 1, "full_name": "Ayesha Khan", "email": "ayesha@example.com", "role_id": 1 } }
```

**POST /api/auth/login**
```json
{ "email": "ayesha@example.com", "password": "secret123" }
```
Response `200`:
```json
{ "success": true, "token": "<JWT>", "user": { "id": 1, "full_name": "Ayesha Khan", "email": "ayesha@example.com", "role": "Student" } }
```

Use the token for protected routes:
```
Authorization: Bearer <JWT>
```

### Roles

**GET /api/roles** — (any logged-in user) list all roles.

**GET /api/roles/users** — (Admin / Team Lead only) list all users with their roles.

**PUT /api/roles/assign** — (Admin / Team Lead only) change a user's role.
```json
{ "user_id": 3, "role_id": 2 }
```

## Bonus: Input Validation
`middleware/validate.js` rejects malformed registration/login requests (missing/invalid email, short password, etc.) with a clear `400` error listing every problem found.

## Testing with Postman
Import the routes above into a Postman collection, or test with curl:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Test User","email":"test@example.com","password":"secret123"}'
```

## Project Structure
```
educore-lms-backend/
├── config/db.js          # PostgreSQL connection
├── controllers/          # Business logic
├── middleware/           # JWT auth, role authorization, validation
├── models/schema.sql     # Database schema
├── routes/                # Route definitions
├── server.js              # App entry point
└── .env.example
```


## Day 6 & 7 - Role Management API and Documentation

Added role-based access control APIs for Student, Instructor, Team Lead, and Admin roles. Includes Postman collection for API documentation (see /docs folder).

