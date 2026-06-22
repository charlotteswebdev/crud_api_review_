# CRUD API

Simple TypeScript + Express + MySQL CRUD API.

## Prerequisites

- Node.js
- npm
- MySQL running locally

## Setup

1. Install dependencies:

   npm install

2. Initialize the database schema:

   mysql -u root < db/schema.sql

   If your MySQL user has a password:

   mysql -u root -p < db/schema.sql

3. Start the API in dev mode:

   npm run dev

The server runs on `http://localhost:3000`.

## API Route Groups

- `/users`
- `/projects`
- `/tasks`
- `/comments`
