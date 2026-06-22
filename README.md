# CRUD API

Simple TypeScript + Express + MySQL CRUD API.

## Prerequisites

- Node.js
- npm
- MySQL running locally

## Setup

1. Install dependencies:

   npm install

2. Configure environment variables:

   Copy `.env.example` to `.env` and fill in your local values:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your MySQL credentials:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=test_db
   PORT=3000
   ```

   **Note:** `.env` is git-ignored and never committed. Each developer maintains their own local copy.

3. Initialize the database schema:

   mysql -u root < db/schema.sql

   If your MySQL user has a password:

   mysql -u root -p < db/schema.sql

## Running the API

### Development Mode (with hot reload)

```bash
npm run dev
```

- Watches source files for changes and auto-restarts the server
- Use this while developing
- Server runs on `http://localhost:3000`

### Production Mode

```bash
npm run build
npm start
```

- `npm run build` compiles TypeScript to `dist/`
- `npm start` runs the compiled JavaScript server
- Use this for deployment

The server runs on `http://localhost:3000` (or your `PORT` env var).

## Testing

Tests are in the `tests/` directory and use Jest with TypeScript.

### Unit Tests

Unit tests mock the database and test controller logic in isolation.

```bash
npm test                # Run unit tests once
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Run tests and generate coverage report
```

**Location:** `tests/controllers/` and `tests/middleware/`

### Integration Tests

Integration tests hit real API endpoints with test data in the database.

```bash
npm run test:integration  # Run integration tests
npm run test:all          # Run all unit and integration tests
```

**Location:** `tests/integration/`

**How they work:**
1. `tests/fixtures/seed.ts` populates the database with test data before tests run
2. Tests use `supertest` to make HTTP requests to the actual Express app
3. Responses are verified (status codes, response bodies, etc.)
4. Database is cleaned up after tests complete

**Test coverage:** Users and Tasks endpoints (GET, POST, PUT, DELETE operations)

## API Route Groups

- `/users`
- `/projects`
- `/tasks`
- `/comments`
