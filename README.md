# Voting Backend

A production-ready REST API for creating and managing realtime polls with authentication, built with TypeScript, Express 5, Prisma (PostgreSQL), Socket.IO, Zod, and JWT. Includes robust validation, error handling, and cookie-based auth.

## Features

- User authentication (register, login, logout) using JWT stored in HTTP-only cookies
- Create, update, delete polls and poll options
- Vote on polls, with one active vote per user per poll (update vote allowed)
- Realtime updates via Socket.IO (rooms per poll)
- Strong validation using Zod
- Centralized error handling (Prisma, JWT, Zod, custom errors)
- Type-safe data access with Prisma and PostgreSQL

## Tech Stack

- Node.js, TypeScript
- Express 5 (`src/app.ts`, `src/server.ts`)
- Prisma ORM + PostgreSQL (`prisma/schema.prisma`)
- Socket.IO for realtime (`src/app.ts`)
- Zod for validation (`src/validations/`)
- Argon2 for password hashing
- JWT for authentication (`src/utils/jwt.ts`, cookie storage)
- CORS + cookie-parser

## Project Structure

```
/ (project root)
├─ prisma/
│  ├─ migrations/
│  └─ schema.prisma
├─ src/
│  ├─ config/
│  │  └─ index.ts
│  ├─ controller/
│  │  ├─ auth.controller.ts
│  │  └─ poll.controller.ts
│  ├─ middleware/
│  │  ├─ validate.ts
│  │  └─ verifyToken.ts
│  ├─ routes/
│  │  ├─ auth.routes.ts
│  │  └─ poll.routes.ts
│  ├─ utils/
│  │  ├─ index.ts  (AppError, AppResponse, errorHandler)
│  │  ├─ prisma.ts
│  │  └─ jwt.ts
│  ├─ validations/
│  │  ├─ auth.validation.ts
│  │  └─ poll.validation.ts
│  ├─ app.ts       (Express app + Socket.IO server)
│  └─ server.ts    (Bootstraps HTTP server)
├─ package.json
├─ tsconfig.json
└─ README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Installation

1. Install dependencies:

```
npm install
```

2. Create a `.env` file in the project root:

```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB_NAME?schema=public"
JWT_SECRET="your-strong-secret"
PORT=7000
NODE_ENV=development
```

3. Set up the database with Prisma:

## Generate Prisma client

```
npx prisma generate
```

## Apply migrations

```
npx prisma migrate deploy
```

## or during development

```
npx prisma migrate dev
```

4. Run the server:

- Development (watch mode):

```
npm run dev
```

- Production build and start:

```
npm run build
npm start
```

By default the server listens on `http://localhost:7000` (configurable via `PORT`).

## Environment Variables

Defined in `src/config/index.ts` and consumed across the app:

- `DATABASE_URL` (required): PostgreSQL connection string
- `JWT_SECRET` (required): Secret used to sign JWTs
- `PORT` (optional, default 7000): Server port
- `NODE_ENV` (optional): `development` or `production`

## Database Schema (Prisma)

See `prisma/schema.prisma`.

- `User`: id, name, email (unique), passwordHash
- `Poll`: id, question, isPublished, timestamps, userId
- `PollOption`: id, text, pollId
- `Vote`: id, userId, pollOptionId, createdAt

Relations:

- User 1—N Poll
- Poll 1—N PollOption
- PollOption 1—N Vote
- User 1—N Vote

## API Reference

Base URL prefix: `/api`

### Auth Routes (`src/routes/auth.routes.ts`)

- POST `/api/auth/register`

  - Body: `{ name: string, email: string, password: string }`
  - Returns: created user (without password)

- POST `/api/auth/login`

  - Body: `{ email: string, password: string }`
  - Sets HTTP-only cookie `token`

- POST `/api/auth/logout`

  - Clears `token` cookie

- GET `/api/auth/me`
  - Auth required (cookie)
  - Returns current user

### Poll Routes (`src/routes/poll.routes.ts`)

- POST `/api/polls/` (auth required)

  - Body: `{ question: string, options: string[], isPublished?: boolean }`
  - Creates a poll with initial options

- GET `/api/polls/`

  - Returns published polls with their options

- GET `/api/polls/:pollId`

  - Returns vote counts and total for a poll: `{ poll : Poll, votes: Record<optionText, number>, total: number }`

- PUT `/api/polls/:pollId` (auth required)

  - Body: `{ question: string, isPublished?: boolean }`
  - Updates question/published flag (owner only)

- PUT `/api/polls/options/:pollId` (auth required)

  - Body (update existing): `{ pollOptionId: string, text: string }`
  - Body (add new): `{ text: string }`

- POST `/api/polls/vote/:pollId` (auth required)

  - Body: `{ pollOptionId: string }`
  - Creates or updates the user’s vote in that poll

- DELETE `/api/polls/:pollId` (auth required)
  - Deletes a poll and its related options and votes (owner only)

Validation is enforced via Zod using the `validate` middleware.

## Authentication

- JWT is generated on login and stored in an HTTP-only cookie `token`.
- In production, cookies are set with `secure: true` and `sameSite: 'none'`.
- `verifyToken` middleware extracts and verifies JWT, setting `req.userId` for downstream handlers.

## Realtime Updates (Socket.IO)

- Socket server is initialized in `src/app.ts` alongside Express.
- Clients should join a room for a specific poll:

```
socket.emit('joinPoll', pollId);
```

- When a vote is created/updated, the server emits to that poll’s room:

```
io.to(`poll-${pollId}`).emit('pollUpdated');
```

Use this event on the client to refetch the poll results and update the UI.

## Error Handling

Centralized error handling in `src/utils/index.ts` via `errorHandler` covers:

- Zod validation errors
- Prisma known errors (e.g., unique constraint, record not found)
- Prisma validation/initialization/panic errors
- JWT errors (invalid, expired, not active)
- Custom `AppError` and native errors

Handlers return a consistent shape: `{ success, message, [content] }` using `AppResponse`.

## NPM Scripts

From `package.json`:

- `npm run dev` — Start in dev with nodemon and ts-node
- `npm run build` — Compile TypeScript to `dist/`
- `npm start` — Run built server (`dist/server.js`)

## Development Notes

- Express app and Socket.IO share the same HTTP server (`src/app.ts`, exported as `server`).
- Controllers throw `AppError` for clean error propagation to `errorHandler`.
- Prisma client is configured in `src/utils/prisma.ts` and types are generated under `src/generated/prisma/`.

## Security

- Passwords are hashed with Argon2
- JWT stored in HTTP-only cookie to mitigate XSS
- Use HTTPS in production to enforce `secure` cookies
- Keep `JWT_SECRET` safe and rotate as needed

## Acknowledgements

- Express, Prisma, Zod, Socket.IO, Argon2, jsonwebtoken
