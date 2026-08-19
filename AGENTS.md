<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# === MONGO DB CONNECTION PROMPT======

Act as a Senior Next.js Backend Architect. Create a TypeScript database connection utility file located at `lib/db/mongodb.ts` using Mongoose.

### Primary Objective

Implement a robust, cached Mongoose connection utility optimized for Next.js (App Router/Serverless environment) that reuses existing database connections across serverless functions and development HMR cycles.

### Technical Requirements

1. Environment Guard: Check for `process.env.MONGODB_URI`. If missing, throw a descriptive error specifying `.env.local`.
2. TypeScript Interfaces & Declarations:
   - Define a `MongooseCache` interface with properties: `conn` (typeof mongoose | null) and `promise` (Promise<typeof mongoose> | null).
   - Augment the NodeJS global scope (`declare global { var mongooseCache: MongooseCache | undefined; }`) to persist the cache across hot-reloads.
3. Singleton Caching:
   - Initialize a module-level `cached` variable that falls back to `global.mongooseCache` or a default `{ conn: null, promise: null }` object.
   - Assign `global.mongooseCache = cached` to guarantee global binding.
4. Exported Function (`connectToDatabase`):
   - Export an async function `connectToDatabase()`.
   - If `cached.conn` exists, immediately return it.
   - If `cached.promise` is null, assign `mongoose.connect(MONGODB_URI)` to `cached.promise` (this prevents race conditions during concurrent requests).
   - Await `cached.promise`, store the resolved connection in `cached.conn`, and return it.

### Code Style Constraints

- Strict TypeScript typing without `any`.
- Clean ES Module syntax (`import mongoose from "mongoose"`).
- Concise, production-ready code with no extra explanatory fluff outside code comments.

<!-- HEALTH CHECKER FOR MONGOOSE -->

## HEALTH CHECKER MONGOOSE

Act as a Senior Next.js Backend Architect. Create a health check API route handler located at `app/api/health/route.ts`.

### Primary Objective

Implement a lightweight GET route handler for Next.js App Router that verifies database connectivity via our Mongoose utility and returns structured JSON responses for monitoring/uptime tools.

### Technical Requirements

1. Imports:
   - Import `NextResponse` from `"next/server"`.
   - Import `connectToDatabase` from `"@/lib/db/mongodb"`.
2. Exported Handler:
   - Export an `async function GET()`.
3. Connectivity Check & Response Logic:
   - Wrap the execution in a `try/catch` block.
   - Call `await connectToDatabase()` to test the MongoDB connection.
   - On success: Return `NextResponse.json` with payload `{ status: "ok", database: "connected" }` (default HTTP 200).
   - On failure: Log `"Database connection failed:"` alongside the error to `console.error`. Return `NextResponse.json` with payload `{ status: "error", database: "disconnected" }` and explicitly set the HTTP status to `500`.

### Code Style Constraints

- Use Next.js App Router route handler conventions (`export async function GET()`).
- Strict TypeScript typing with no unused variables.
- Keep the implementation clean and free of unnecessary external dependencies.
