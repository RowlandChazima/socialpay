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

<!-- THE USER MODELS -->

Act as a Senior Next.js Backend Architect. Create a TypeScript Mongoose model file located at `lib/db/models/User.ts`.

### Primary Objective

Implement a strictly typed Mongoose User schema and model that prevents model re-compilation errors during Next.js Hot Module Reloads (HMR) and enforces string sanitization at the database layer.

### Technical Requirements

1. Imports:
   - Import `mongoose`, `{ Schema, Document, Model }` from `"mongoose"`.
2. Exported Types & Interfaces:
   - Export type `UserRole`: String union `"SELLER" | "CUSTOMER" | "ADMIN"`.
   - Export interface `IUser` extending `Document`:
     - `name`: string
     - `email`: string
     - `phone`: string
     - `passwordHash`: string
     - `role`: `UserRole`
     - `createdAt`: Date
     - `updatedAt`: Date
3. Schema Definition (`UserSchema = new Schema<IUser>`):
   - `name`: String type, `required: true`, `trim: true`.
   - `email`: String type, `required: true`, `unique: true`, `lowercase: true`, `trim: true`.
   - `phone`: String type, `required: true`, `trim: true`.
   - `passwordHash`: String type, `required: true`.
   - `role`: String type, `enum: ["SELLER", "CUSTOMER", "ADMIN"]`, `default: "SELLER"`.
   - Enable automatic timestamps (`{ timestamps: true }`).
4. Exported Model (`User`):
   - Export `User` typed as `Model<IUser>`.
   - Use the Next.js model reuse pattern: `mongoose.models.User || mongoose.model<IUser>("User", UserSchema)`.

### Code Style Constraints

- Strict TypeScript typing without `any`.
- Output only production code for the target path.

<!-- AUTHENTICATION PROMPTS -->

<!-- ==REGISTRATION ENDPOINT==== -->

Act as a Senior Next.js Backend Architect. Create an authentication registration API route handler located at `app/api/auth/register/route.ts`.

### Primary Objective

Implement a secure user registration POST endpoint for Next.js App Router using Mongoose, bcryptjs for password hashing, and clean HTTP error responses.

### Technical Requirements

1. Imports:
   - Import `NextResponse` from `"next/server"`.
   - Import `bcrypt` from `"bcryptjs"`.
   - Import `connectToDatabase` from `"@/lib/db/mongodb"`.
   - Import `User` from `"@/lib/db/models/User"`.
2. Exported Handler:
   - Export an `async function POST(request: Request)`.
3. Validation & Business Logic:
   - Parse JSON request body to extract `name`, `email`, `phone`, and `password`.
   - Validate presence of all 4 fields. If any are missing, return `NextResponse.json` with `{ error: "All fields are required" }` and status `400`.
   - Call `await connectToDatabase()`.
   - Check if a user already exists with `User.findOne({ email })`. If found, return `{ error: "A user with this email already exists" }` with status `409`.
4. Password Hashing & Record Creation:
   - Hash `password` using `await bcrypt.hash(password, 12)`.
   - Create a user using `User.create(...)` passing `name`, `email`, `phone`, `passwordHash`, and set explicit `role: "SELLER"`.
5. Success & Error Handling:
   - Return status `201` with message `"User created successfully"` and a sanitized user payload containing `id` (`user._id`), `name`, `email`, and `role`.
   - Wrap the whole flow in a try/catch block. Log caught errors as `"Registration error:"` using `console.error`, and return status `500` with `{ error: "Something went wrong" }`.

### Code Style Constraints

- Strict TypeScript typing with no `any`.
- Do not expose sensitive data (e.g., `passwordHash`) in the success response payload.
- Follow Next.js 16 App Router conventions.
