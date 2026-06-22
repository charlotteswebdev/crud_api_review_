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
   DB_NAME=dev_db
   TEST_DB_NAME=test_db
   PORT=3000
   NODE_ENV=development
   ```

   **Note:** 
   - `.env` is git-ignored and never committed. Each developer maintains their own local copy.
   - `DB_NAME` is used for development
   - `TEST_DB_NAME` is used for running tests (isolated test database)

3. Initialize the database:

   **Option 1: Auto-seed development database (recommended)**
   
   ```bash
   npm run seed:dev
   ```
   
   This creates the `dev_db` database, initializes the schema, and populates it with sample data.

   **Option 2: Manual schema initialization**
   
   ```bash
   mysql -u root < db/schema.sql
   ```
   
   If your MySQL user has a password:
   
   ```bash
   mysql -u root -p < db/schema.sql
   ```

## Running the API

### Development Mode (with hot reload)

```bash
npm run dev
```

- Watches source files for changes and auto-restarts the server
- Use this while developing
- Server runs on `http://localhost:3000`

### Seeding Development Data

To repopulate the development database with fresh sample data:

```bash
npm run seed:dev
```

This command:
1. Creates the `dev_db` database (if it doesn't exist)
2. Initializes the schema (users, projects, tasks, comments tables)
3. Populates the database with sample data:
   - 4 users
   - 3 projects
   - 8 tasks
   - 7 comments

Useful for testing API endpoints and viewing data in development.

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
