# Round 2 Backend Code-Pairing Preparation Guide

This guide is written for a Round 2 interview where the interviewer asks you to explain your backend project deeply, file by file, and then asks production-level scenario questions.

Use this structure:

1. Start with a 60-second project overview.
2. Explain the backend flow from request entry to database write.
3. Explain important files line by line for the core backend.
4. Defend production concerns: security, scale, uniqueness, background jobs, indexes, testing, failures.
5. Be ready for URL Shortener-style questions because the feedback mentioned that exact task.

---

## 1. Opening Pitch

Say this:

> I built a Service Monitoring and Incident Management Platform. The backend is a Node.js and Express API using MongoDB through Mongoose. It supports authentication, workspaces, service registration, health checks, alerting, incidents, audit logs, real-time Socket.IO updates, scheduled background jobs, encrypted API keys, and AI-assisted summaries. The backend is structured into routes, middleware, services, models, jobs, config, and utilities so business logic is separated from HTTP handling.

Then add:

> In production terms, the important parts are multi-tenant isolation using workspace IDs, bounded concurrency in background monitoring jobs, TTL indexes for old check data, JWT access/refresh token rotation, CORS protection, rate limiting, NoSQL sanitization, AES-256-GCM encryption, and test coverage for critical flows like cascading cleanup.

---

## 2. Backend Request Flow

Explain every request like this:

1. Request enters `server/src/index.js`.
2. `index.js` creates the HTTP server and Socket.IO server.
3. Express app is created by `server/src/app.js`.
4. `app.js` applies security middleware: Helmet, CORS, JSON parser, cookies, NoSQL sanitization, rate limit.
5. All API routes are mounted under `/api`.
6. The route validates the body using Zod.
7. Auth middleware verifies the JWT token and attaches `req.auth`.
8. Route calls service/model logic.
9. Mongoose performs database operations.
10. Real-time events are emitted if needed.
11. Response is returned as JSON.
12. Errors are passed to the centralized error handler.

Good sentence:

> I intentionally kept controllers thin. Routes handle HTTP details and validation; services handle business rules; models define data shape and indexes; jobs handle scheduled background work.

---

## 3. Core File-by-File Explanation

### `server/src/index.js`

Purpose: Main backend entry point.

Line-by-line explanation:

- `createServer` imports Node's HTTP server wrapper so Express and Socket.IO can share the same server.
- `Server` from `socket.io` creates the real-time layer.
- `env`, `logger`, `connectDb`, and `createApp` bring in config, logging, DB connection, and Express setup.
- `registerMonitoringJob` and `registerCleanupJob` start scheduled background jobs.
- `setRealtimeServer` stores the Socket.IO instance so services can emit events without importing `io` directly everywhere.
- `recoverPendingEscalations` restores pending escalation timers after server restart.
- `verifyAccessToken` is used to authenticate Socket.IO clients.
- `allowedOrigins` contains the configured frontend and local dev origins.
- `const app = createApp()` builds the Express app.
- `const httpServer = createServer(app)` wraps Express in an HTTP server.
- `const io = new Server(httpServer, { cors: ... })` attaches Socket.IO and applies the same origin policy.
- On socket connection, the backend logs the socket ID.
- It reads the JWT from `socket.handshake.auth` or query params.
- It verifies the token and extracts `workspaceIds`.
- For every workspace ID, it joins a room named `workspace:{id}`.
- This prevents real-time data leakage across tenants.
- If token verification fails, the socket remains connected but joins no private workspace room.
- `socket.emit("server:ready")` confirms the connection to the frontend.
- `await connectDb()` connects MongoDB before accepting traffic.
- `setRealtimeServer(io)` makes real-time emitting available to services.
- Monitoring and cleanup jobs are registered after DB connection.
- `host = "0.0.0.0"` allows deployment platforms like Render to reach the server.
- `httpServer.listen(...)` starts the API.

Production questions:

- Why use the same HTTP server for Express and Socket.IO?
  - Because Socket.IO needs to upgrade HTTP connections to WebSocket-like transport on the same server.
- What if JWT is invalid on socket connection?
  - The socket does not join workspace rooms, so it cannot receive tenant-specific events.
- What happens if DB connection fails?
  - The app should fail startup instead of accepting requests that cannot be fulfilled.

---

### `server/src/app.js`

Purpose: Express application factory.

Line-by-line explanation:

- Imports Express and security middleware.
- Imports route registry from `routes/index.js`.
- Imports centralized error handling.
- Imports `env` and origin utility.
- `allowedOrigins` combines production frontend and local development URLs.
- `createApp()` returns a configured Express instance. This makes testing easier because tests can import the app without starting a network listener.
- `helmet()` sets safe HTTP headers.
- `cors()` allows browser requests only from approved origins.
- `credentials: true` allows cookies like refresh tokens.
- `express.json({ limit: "1mb" })` protects the API from oversized JSON bodies.
- `express.urlencoded()` parses form-like payloads.
- `cookieParser()` reads cookies for refresh token flows.
- `mongoSanitize()` blocks Mongo operator injection like `$ne` or `$gt` inside request data.
- `rateLimit()` limits requests per IP to reduce brute-force and abuse.
- Request logger logs method and path.
- `/health` returns uptime, Mongo state, environment, and timestamp.
- `app.use("/api", routes)` mounts API routes.
- `app.use(errorHandler)` catches thrown errors from async routes.
- Returns `app`.

Production questions:

- Why use `createApp()` instead of starting server directly?
  - It improves testability and separates app configuration from runtime startup.
- Why rate limit globally?
  - It reduces abuse, brute force attempts, and accidental request floods.
- Why sanitize Mongo payloads?
  - To prevent NoSQL injection through user-controlled JSON.

---

### `server/src/config/env.js`

Purpose: Centralized environment loading and validation.

Line-by-line explanation:

- Loads `.env` using `dotenv`.
- Searches for `.env` in current, parent, and grandparent folders so running from root or `server` still works.
- Reads `NODE_ENV` and determines production mode.
- Builds an `errors` array instead of failing on the first missing variable.
- Requires `MONGO_URI` or `MONGODB_URI`.
- Requires `ENCRYPTION_KEY` to decode to exactly 32 bytes because AES-256 requires a 256-bit key.
- In production, requires secure JWT secrets.
- If errors exist, prints them and exits immediately.
- Exports normalized env values like `port`, `clientOrigin`, JWT TTLs, Gemini key, email/webhook config, encryption key, and internal target policy.

Production questions:

- Why fail fast?
  - A misconfigured backend should not run partially and produce unpredictable behavior.
- Why validate encryption key size?
  - AES-256-GCM requires a 32-byte key; wrong length will break encryption/decryption.

---

### `server/src/config/db.js`

Purpose: MongoDB connection setup.

How to explain:

- It imports Mongoose and env.
- It checks if `mongoUri` exists.
- It connects using `mongoose.connect`.
- It logs successful connection.
- It throws/logs failure so startup can fail cleanly.

Production questions:

- Should DB connect before server starts?
  - Yes. For this app, DB is core functionality, so accepting requests without DB is not useful.
- What about retries?
  - In a larger deployment, use connection retry/backoff and platform-level restart policy.

---

### `server/src/models/Service.js`

Purpose: Stores each monitored service/API.

Line-by-line explanation:

- Imports Mongoose.
- Defines `serviceSchema`.
- `workspaceId` is required and indexed for multi-tenant queries.
- `teamId` and `ownerId` map ownership.
- `name` and `url` define the monitored target.
- `environment` restricts values to `dev`, `staging`, or `prod`.
- `tags` allow filtering/searching.
- `maintenanceMode` lets checks skip alerting during planned work.
- `expectedKeyword` lets the check verify response content, not only status code.
- `customHeaders` and `apiKey` support authenticated endpoint checks.
- `checkIntervalMinutes` controls per-service polling frequency.
- `failureCount`, `lastStatusCode`, `lastResponseTimeMs`, and `lastCheckSummary` store latest health state.
- `uptimePercentage`, `avgLatencyMs`, and `errorRate` are derived metrics.
- `healthStatus` is an enum so the frontend and alerts get predictable values.
- `latencyHistory` stores recent points for quick chart rendering.
- `lastCheckedAt` prevents checking too often.
- `{ timestamps: true }` adds `createdAt` and `updatedAt`.
- `mongoose.models.Service || mongoose.model(...)` avoids model recompilation errors in hot reload/test environments.

Production questions:

- Why index `workspaceId`?
  - Almost every query is scoped by workspace, so the index keeps tenant-specific lookups fast.
- Why enum fields?
  - They protect data consistency.

---

### `server/src/models/CheckResult.js`

Purpose: Stores each individual service check result.

Line-by-line explanation:

- `workspaceId` scopes the record to a tenant.
- `serviceId` links the result to a service.
- `statusCode`, `latencyMs`, `ok`, and `keywordMatched` capture check outcome.
- `errorMessage` and `responseSnippet` help incident debugging.
- `attempt` records retry attempt number.
- `checkedAt` records when the check happened.
- Compound index `{ serviceId: 1, checkedAt: -1 }` optimizes "latest checks for service" queries.
- TTL index on `checkedAt` automatically deletes old check results after 30 days.

Production questions:

- Why TTL index?
  - Monitoring generates a lot of time-series data. TTL keeps storage bounded automatically.
- Why compound index?
  - The common query is "get recent checks for this service sorted newest first".

---

### `server/src/models/Incident.js`

Purpose: Stores incidents created from alerts or manual response.

Line-by-line explanation:

- `workspaceId` is required and indexed for tenant isolation.
- `serviceId` links incident to affected service.
- `alertIds` links related alerts.
- `title` is required for human-readable incident tracking.
- `status` enum models incident lifecycle.
- `severity` enum models impact.
- `summary` stores description or AI-generated summary.
- `rootCauseTag` supports classification.
- `ownerId` and `responderIds` track responsibility.
- `notes` supports incident timeline.
- Index `{ workspaceId: 1, createdAt: -1 }` speeds dashboard incident lists.
- Index `{ serviceId: 1, status: 1 }` speeds active incident lookup per service.

---

### `server/src/middleware/auth.js`

Purpose: Protects routes using JWT and role checks.

Line-by-line explanation:

- Imports `verifyAccessToken`.
- Imports `ApiError`.
- `resolveActiveWorkspaceRole()` chooses the active workspace from token/header.
- It finds the user's role inside that workspace.
- `requireAuth()` reads `Authorization` header.
- It expects `Bearer <token>`.
- If missing, it returns 401.
- It verifies the access token.
- It resolves workspace from `x-workspace-id`, query param, or first workspace in token.
- It attaches auth data to `req.auth`.
- If token is invalid/expired, it returns 401.
- `requireRole(roles)` returns middleware.
- It checks global roles and workspace role.
- If none match, it returns 403.

Production questions:

- Difference between 401 and 403?
  - 401 means not authenticated. 403 means authenticated but not allowed.
- Why include workspace role?
  - Users can have different permissions in different workspaces.

---

### `server/src/routes/serviceRoutes.js`

Purpose: CRUD API for monitored services.

Line-by-line explanation:

- Imports Express Router.
- Imports Zod for request validation.
- Imports `asyncHandler` so thrown errors reach centralized error middleware.
- Imports all related models needed for service details and cleanup.
- Imports auth middleware and audit/realtime utilities.
- `serviceSchema` validates create/update payloads.
- `name` must be at least 2 characters.
- `url` must be a valid URL.
- `environment` is restricted.
- `checkIntervalMinutes` is between 1 and 1440.
- `workspaceIdFor(req)` resolves active workspace.
- `GET /` requires auth, fetches only services in the workspace, sorts newest first, adds computed health score.
- `POST /` requires admin role, validates body, encrypts API key, creates service, records audit log, emits realtime update, returns 201.
- `GET /:id` fetches one service within workspace and loads related checks, alerts, incidents, logs, metrics, deployments, dependencies using `Promise.all`.
- `PATCH /:id` validates partial payload, encrypts new API key if present, updates within workspace, records audit log, emits realtime update.
- `DELETE /:id` deletes the service within workspace.
- After delete, it records audit log and emits realtime update.
- It then deletes related CheckResults, Metrics, Logs, Alerts, AlertRules, Deployments, Dependencies, SLOs, and Incidents.
- Cleanup errors are logged without hiding the fact that the service was deleted.

Production questions:

- Why include `workspaceId` in every query?
  - It prevents cross-tenant access.
- Why use `Promise.all` in details?
  - Independent database queries can run concurrently.
- Why cascade cleanup?
  - Prevents orphan records and incorrect dashboards.
- What risk exists in cascade cleanup?
  - If cleanup partially fails, data can be orphaned. For stronger guarantees, use transactions if MongoDB deployment supports replica sets.

---

### `server/src/services/monitoringService.js`

Purpose: Performs the actual HTTP health check and updates service metrics.

Line-by-line explanation:

- Imports `CheckResult` and `Service`.
- Imports alert evaluation and realtime emitters.
- Imports health calculation, decryption, logger, DNS, and env.
- `isInternalIP()` detects private/loopback/link-local IPs.
- This is SSRF protection: users cannot make the server call internal addresses unless explicitly allowed.
- Constants define max retry attempts, retry delay, and request timeout.
- `sleep()` supports retry backoff.
- `normalizeHeaders()` builds headers and decrypts stored API key.
- If decryption fails, it logs error and avoids crashing the whole check.
- `runHttpCheck()` creates an AbortController for timeout.
- It parses the service URL.
- It resolves hostname to IP using DNS.
- It blocks private IPs when `ALLOW_INTERNAL_TARGETS` is false.
- It performs a GET request.
- It measures latency using `Date.now()`.
- It reads response text and stores a 500-character snippet.
- If `expectedKeyword` exists, it checks the body contains it.
- `ok` requires both HTTP success and keyword match.
- Errors produce a structured failed result.
- `finally` clears timeout.
- `recalcUptimeFromHistory()` reads last 100 checks and calculates percentage.
- `recalcAvgLatency()` reads last 50 successful checks and averages latency.
- `applyCheckToService()` updates latest service health fields.
- It increments failure count on failure and resets on success.
- It keeps only last 20 latency points.
- It calculates uptime and latency from DB history.
- It maps uptime to `healthy`, `degraded`, or `critical`.
- `runServiceCheck()` skips real checks if service is in maintenance mode.
- Otherwise it retries failed checks up to max attempts.
- Each attempt creates a `CheckResult`.
- If an attempt succeeds, it breaks early.
- Failed attempts use increasing delay.
- After attempts, service stats are updated and saved.
- It emits `service:checked`.
- If final result failed, it evaluates alert rules and emits `service:check-failed`.

Production questions:

- Why retry?
  - To avoid false alerts caused by transient network failures.
- Why timeout?
  - To prevent hanging sockets and worker exhaustion.
- Why block internal IPs?
  - To prevent SSRF attacks.
- Why calculate uptime from recent DB history?
  - It is more accurate than blindly incrementing/decrementing a counter.

---

### `server/src/jobs/monitoringJob.js`

Purpose: Background scheduler for periodic service checks.

Line-by-line explanation:

- Imports `node-cron`.
- Imports logger and models.
- Imports `runServiceCheck`.
- `CONCURRENCY = 10` limits parallel HTTP checks.
- `BATCH_QUERY_LIMIT = 500` limits how many services are processed per sweep.
- `runWithConcurrency()` implements a simple worker pool.
- `index` tracks next item.
- Each worker loops while items remain.
- `Promise.all` runs only `concurrency` number of workers.
- `registerMonitoringJob()` schedules a cron every minute.
- It records sweep start time.
- It fetches up to 500 services.
- It filters services due for check based on `lastCheckedAt` and `checkIntervalMinutes`.
- It counts skipped services.
- It fetches active maintenance windows for relevant workspaces.
- For each due service, it loads the latest document before checking.
- It marks service as temporarily under maintenance if a window applies.
- It calls `runServiceCheck`.
- It logs per-service failure but does not stop the entire sweep.
- It logs checked/skipped/time summary.

Production questions:

- Why bounded concurrency?
  - Without it, checking many URLs simultaneously can exhaust sockets, memory, CPU, and the event loop.
- How would this scale to millions of services?
  - Do not scan all services each minute. Use indexed `nextCheckAt`, pagination/cursors, queues, partitioning, and distributed workers with locking.
- What problem does `.limit(500)` solve?
  - It prevents a single cron tick from loading too much data into memory.

---

### `server/src/jobs/cleanupJob.js`

Purpose: Periodic cleanup of old revoked refresh tokens.

Line-by-line explanation:

- Imports cron and logger.
- Imports `RefreshToken`.
- Registers a job every Sunday at 03:00.
- Calculates cutoff: revoked more than 7 days ago.
- Deletes matching records.
- Logs delete count.
- Errors are caught and logged.

Production questions:

- Why not delete immediately?
  - Keeping revoked tokens briefly can help investigate token reuse/security events.
- What deletes old check results?
  - MongoDB TTL index handles `CheckResult` expiry.

---

### `server/src/utils/crypto.js`

Purpose: Encrypts/decrypts sensitive stored values like service API keys.

Line-by-line explanation:

- Uses Node `crypto`.
- Uses AES-256-GCM.
- `IV_LENGTH = 16` creates a random initialization vector.
- `KEY_PREFIX = "v1:"` supports future encryption migrations.
- `encrypt(text)` returns input unchanged if empty.
- If it already starts with prefix, it avoids double encryption.
- Generates random IV.
- Decodes 32-byte base64 encryption key.
- Creates cipher.
- Encrypts text from UTF-8 to base64.
- Gets GCM auth tag for tamper detection.
- Returns `v1:iv:tag:ciphertext`.
- `decrypt(text)` returns empty/plain text when appropriate.
- It validates encrypted format has 3 parts.
- It decodes IV, tag, ciphertext, and key.
- It creates decipher and sets auth tag.
- If data was tampered with or key is wrong, decryption fails.

Production questions:

- Why AES-GCM?
  - It provides confidentiality and integrity through authenticated encryption.
- Why random IV?
  - Reusing IVs with GCM is dangerous; random IV makes same plaintext encrypt differently.
- Why prefix?
  - Allows future migration like `v2:` without breaking old values.

---

### `server/src/routes/authRoutes.js`

Purpose: Authentication API.

Important explanation:

- Uses Zod schemas for login/register/password reset input.
- Uses a stricter rate limiter for auth endpoints.
- `setRefreshCookie()` stores refresh token in an HTTP-only cookie.
- `/register` validates data, creates user/workspace, sets refresh cookie, returns access token.
- `/login` validates credentials and returns session.
- `/logout` revokes refresh token and clears cookie.
- `/refresh` rotates refresh token and returns a new access token.
- `/me` returns current token payload.
- Password reset and email verification use one-time hashed account tokens.
- Google routes exchange OAuth code for profile and login/register user.

Production questions:

- Why HTTP-only cookie for refresh token?
  - JavaScript cannot read it, reducing XSS token theft risk.
- Why rotate refresh tokens?
  - If an old refresh token is reused after rotation, it can indicate compromise.
- Why rate limit auth?
  - To slow brute-force login and password reset abuse.

---

### `server/src/services/authService.js`

Purpose: Business logic for registration, login, sessions, token rotation, password reset, and Google OAuth account linking.

Important explanation:

- Checks duplicate email before registration.
- Creates workspace first.
- Hashes password using bcrypt with cost 12.
- Stores roles and workspace roles.
- Issues email verification token.
- Login compares password hash.
- Refresh token is persisted only as SHA-256 hash.
- Rotation revokes old token and creates a new one.
- Password reset token is hashed in DB.
- Reset password revokes active refresh tokens.
- Google login either links existing email or creates new user/workspace.

Production questions:

- Why store refresh token hash instead of raw token?
  - If DB leaks, attackers cannot directly use refresh tokens.
- Why revoke sessions after password reset?
  - Existing sessions may be compromised.
- Should registration use transactions?
  - Ideally yes, because user and workspace creation should be atomic.

---

### `server/src/utils/tokens.js`

Purpose: JWT signing, verification, and token hashing.

Line-by-line explanation:

- `signAccessToken()` signs payload with access secret and short TTL.
- Adds `jti` unique token ID.
- `signRefreshToken()` signs with a different secret and longer TTL.
- `verifyAccessToken()` validates access token.
- `verifyRefreshToken()` validates refresh token.
- `hashToken()` returns SHA-256 hash for secure storage.

Production questions:

- Why separate access and refresh secrets?
  - Compromise of one class of token does not automatically compromise the other.
- Why short access TTL?
  - Limits damage if access token leaks.

---

## 4. What to Say for Other Backend Folders

Use these short explanations if they open a random file.

### `models`

> Models define the database schema, relationships, validation constraints, defaults, and indexes. I use indexes on workspace and time-based fields because most queries are tenant-scoped and sorted by recent activity.

### `routes`

> Routes handle HTTP-specific work: method, URL, auth middleware, validation, request parsing, response formatting. I avoid putting heavy business logic in routes when it can be moved to services.

### `services`

> Services contain business rules. For example, monitoring service performs checks, alert service decides if alert rules are breached, auth service handles token rotation and password reset, audit service records mutating operations.

### `middleware`

> Middleware handles cross-cutting request concerns like authentication, authorization, ingestion API key validation, and error handling.

### `jobs`

> Jobs run background work outside request/response flow. Monitoring is frequent and bounded by concurrency; cleanup is scheduled and low priority.

### `utils`

> Utilities are small reusable functions: token signing, encryption, origin checks, workspace resolution, async error wrapping, health score calculation.

### `scripts`

> Scripts are operational one-off tools for seeding demo data, creating users, encrypting existing API keys, or fixing legacy data.

---

## 5. URL Shortener Round 2 Preparation

The feedback specifically mentioned URL Shortener questions. Prepare these answers even if your current project is different.

### Basic URL Shortener Architecture

Request flow:

1. User submits a long URL.
2. Backend validates URL.
3. Backend generates short code.
4. Backend checks uniqueness.
5. Backend stores `{ code, longUrl, userId, expiryAt, createdAt, clickCount }`.
6. User visits `/abc123`.
7. Backend looks up code.
8. If missing, return 404.
9. If expired, return 410 Gone or 404 depending product choice.
10. Otherwise increment analytics asynchronously and redirect with 301/302.

Schema:

```js
{
  code: { type: String, required: true, unique: true, index: true },
  longUrl: { type: String, required: true },
  userId: { type: ObjectId, index: true },
  expiryAt: { type: Date, index: true },
  clickCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
}
```

### Question: How do you ensure crypto-generated ID is always unique?

Strong answer:

> I do not rely only on probability. I use a cryptographically strong random generator for high entropy, but I enforce a unique index at the database level. During creation, I generate a code and attempt insert. If MongoDB throws duplicate key error, I retry with a new code. This makes uniqueness guaranteed by the database, even under concurrent requests.

Example:

```js
async function createShortUrl(longUrl) {
  for (let attempt = 1; attempt <= 5; attempt++) {
    const code = crypto.randomBytes(6).toString("base64url");
    try {
      return await Url.create({ code, longUrl });
    } catch (err) {
      if (err.code === 11000) continue;
      throw err;
    }
  }
  throw new Error("Could not generate unique short code");
}
```

Important points:

- Use `unique: true` index on `code`.
- Do not first `findOne` then `insert` as the only guarantee because two requests can race.
- Insert should be atomic.
- Retry only on duplicate key error.
- Increase code length if collision rate grows.

### Collision Probability

If using 8 characters from 62-character alphabet:

```txt
62^8 = 218 trillion possible codes
```

Collision is unlikely, but production correctness still needs a unique index.

### Question: How to check URL expiry in 1000 million records?

Weak answer:

> Run cron and scan all records.

Strong answer:

> I would not scan 1 billion records. I would create an index on `expiryAt` and query only expired records in small batches. For automatic deletion, MongoDB TTL index can delete expired documents. If I need custom logic before deletion, I use a background worker that repeatedly queries `expiryAt <= now`, sorted by expiry, with a limit, and processes in batches. For very large scale, partition by expiry time, use queues, or move expired records to cold storage.

Option 1: TTL index

```js
urlSchema.index({ expiryAt: 1 }, { expireAfterSeconds: 0 });
```

Good when:

- You only need deletion.
- Exact deletion time is not critical.
- MongoDB TTL monitor delay is acceptable.

Option 2: Batch worker

```js
async function expireUrls() {
  while (true) {
    const expired = await Url.find({
      expiryAt: { $lte: new Date() },
      status: "active"
    })
      .sort({ expiryAt: 1 })
      .limit(1000)
      .select("_id")
      .lean();

    if (!expired.length) break;

    const ids = expired.map((item) => item._id);
    await Url.updateMany(
      { _id: { $in: ids } },
      { $set: { status: "expired" } }
    );
  }
}
```

Indexes:

```js
urlSchema.index({ expiryAt: 1, status: 1 });
urlSchema.index({ code: 1 }, { unique: true });
```

Production scaling answer:

> At 1 billion records, the design must be index-driven. I would never perform collection scans. I would use TTL if deletion is enough. If I need business logic, I would use sharded workers where each worker owns a partition, for example by hash range or expiry time bucket. I would also keep active redirects optimized by indexing `code` and possibly caching hot mappings in Redis.

### Redirect Status Code

Answer:

- `302` for default because destination can change and analytics should be counted.
- `301` for permanent redirect only when you are sure the mapping never changes.

### Analytics at Scale

Question:

> Should click count be incremented directly during redirect?

Strong answer:

> For small scale, `$inc` during redirect is fine. At high scale, I would enqueue click events or write to a log stream and aggregate asynchronously, because redirect latency must stay low.

Example:

```js
await Url.updateOne({ code }, { $inc: { clickCount: 1 } });
```

At high scale:

```txt
Redirect API -> Queue/Kafka/Redis Stream -> Analytics worker -> Aggregated counters
```

### URL Validation

Strong answer:

> I validate the URL format and allowed protocols. I allow only `http` and `https`. I block private IPs and localhost if the backend fetches the URL for preview, because otherwise it can become SSRF. For pure redirects, I still validate scheme to avoid `javascript:` or unsafe protocols.

### Test Cases for URL Shortener

Prepare these:

1. Create short URL with valid URL returns 201.
2. Invalid URL returns 400.
3. Duplicate generated code retries.
4. Database duplicate key error after max retries returns 500/503.
5. Redirect existing active code returns 302.
6. Missing code returns 404.
7. Expired code returns 410.
8. Click count increments.
9. Expired records are processed by worker in batches.
10. Unique index exists on `code`.
11. TTL/index exists on `expiryAt`.
12. Concurrent creates do not generate duplicate DB records.

---

## 6. Production Scenario Answers for Your Current Project

### How will your monitoring worker scale?

Say:

> Currently the worker limits concurrency to 10 and fetches a bounded batch of 500 services per sweep. That protects memory and network sockets. For larger scale, I would add a `nextCheckAt` indexed field and query only due services with `{ nextCheckAt: { $lte: now } }`, sorted by `nextCheckAt`, limited by batch size. Then I would use distributed workers with a lease/lock field so two workers do not check the same service.

Better schema:

```js
serviceSchema.index({ nextCheckAt: 1, workspaceId: 1 });
```

Worker query:

```js
Service.find({
  nextCheckAt: { $lte: now },
  lockedUntil: { $lt: now }
}).sort({ nextCheckAt: 1 }).limit(500)
```

### How do you avoid duplicate work in multiple server instances?

Say:

> I would use a DB-level leasing mechanism or queue. A worker atomically claims a service by setting `lockedUntil` using `findOneAndUpdate`. If the worker dies, lock expires and another worker can pick it up.

### How do you prevent alert spam?

Say:

> I use alert deduplication keys, failure thresholds, and retries before alerting. In production I would also add cooldown windows and alert state transitions so the same incident does not create repeated notifications.

### How do you protect multi-tenant data?

Say:

> Every query is scoped by `workspaceId`. JWT contains workspace membership. Socket.IO clients are placed into workspace-specific rooms. Routes use `workspaceId` in `findOne`, `find`, `update`, and `delete` filters so a user cannot access another workspace by guessing IDs.

### How do you test every line?

Say:

> I divide tests into unit tests and integration tests. Utility functions like health score and alert breach logic are unit tested. Route flows like service deletion are integration tested using an in-memory MongoDB and Supertest. For each route, I test success, validation failure, auth failure, permission failure, not found, and side effects like audit logs or cleanup.

---

## 7. Existing Tests Explanation

### `server/test/logic.test.js`

Explain:

- Uses Node's built-in test runner.
- Tests pure logic without database.
- Verifies health score remains between 0 and 100.
- Verifies alert breach logic for latency, uptime, and failure.
- Verifies dedupe key is stable.
- Verifies AI fallback summaries stay grounded in provided data.

### `server/tests/incident.test.js`

Explain:

- Uses MongoMemoryServer for isolated database tests.
- Uses Supertest to call Express routes without real network.
- Creates user, workspace, service, and related records.
- Signs a JWT access token.
- Deletes service through actual API endpoint.
- Verifies all related records are deleted.

Important note:

> This test proves the route behavior, auth integration, database writes, and cleanup side effects together.

---

## 8. 20 Interview Questions You Should Practice

1. Explain backend architecture from request to response.
2. Why did you separate routes, services, models, and utils?
3. How does authentication work?
4. Why use access and refresh tokens?
5. Why store refresh tokens as hashes?
6. How does refresh token rotation work?
7. How do you prevent NoSQL injection?
8. How do you prevent CORS issues?
9. How do you protect multi-tenant data?
10. How does Socket.IO room isolation work?
11. How does the monitoring cron job work?
12. Why bounded concurrency?
13. How would you scale the monitoring worker to millions of services?
14. How do you avoid false alerts?
15. How do you calculate uptime?
16. Why use TTL indexes?
17. How does cascading cleanup work?
18. What happens if cleanup partially fails?
19. How do you test this backend?
20. What would you improve if given more time?

---

## 9. Best Improvements to Mention Honestly

Say this if asked what you would improve:

> I would add a `nextCheckAt` index-driven scheduler instead of fetching a fixed batch. I would add distributed worker locking for horizontal scale. I would wrap service deletion and cleanup in MongoDB transactions where supported. I would add more integration tests for auth, alert creation, monitoring checks, and RBAC. I would also add structured logs with request IDs and metrics for job duration, error rate, and queue backlog.

This answer sounds senior because it acknowledges current design and gives concrete production upgrades.

---

## 10. Final 2-Minute Explanation Script

Use this when they say "explain your backend":

> The backend starts from `index.js`, where I create the Express app, HTTP server, and Socket.IO server. Before listening for requests, I connect to MongoDB, register background jobs, and initialize real-time broadcasting.
>
> `app.js` configures the Express pipeline. I added Helmet, CORS with allowed origins, JSON body limits, cookie parsing, Mongo sanitization, rate limiting, request logging, a health endpoint, API routes, and centralized error handling.
>
> Data is modeled using Mongoose. Every major collection includes `workspaceId` because the app is multi-tenant. For example, Service stores monitored endpoints and their current health state. CheckResult stores individual health check attempts and has a TTL index to automatically remove old monitoring data.
>
> Auth uses JWT access tokens and refresh tokens. Access tokens are short lived. Refresh tokens are stored in HTTP-only cookies and persisted as hashes in the database. On refresh, the old token is revoked and a new one is issued.
>
> The monitoring worker runs every minute, but each service has its own interval. It fetches a bounded batch, filters services that are due, checks active maintenance windows, and then runs checks with concurrency limited to 10. The actual check has timeout, retry, expected keyword matching, SSRF protection, API key decryption, result persistence, metric recalculation, alert evaluation, and real-time event emission.
>
> For real-time updates, Socket.IO clients authenticate with their JWT. The server extracts workspace IDs and joins workspace-specific rooms. Events are emitted only to those rooms, which prevents cross-tenant data leaks.
>
> For reliability and data integrity, service deletion performs cascading cleanup of related metrics, logs, alerts, incidents, deployments, dependencies, and SLOs. I also added tests using in-memory MongoDB and Supertest to verify this behavior.

End with:

> The key production ideas in this backend are tenant isolation, secure auth, bounded background work, index-aware data access, encrypted sensitive data, and test coverage for critical side effects.

