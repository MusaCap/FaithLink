# FaithLink360 — Full Codebase Performance Audit

**Date:** March 5, 2026  
**Scope:** Backend (`server-basic.js`), Frontend (Next.js app), Build/Deploy config  
**Severity Scale:** 🔴 Critical | 🟠 High | 🟡 Medium | 🟢 Low

---

## Executive Summary

The platform has **significant structural and performance gaps** that will cause scaling, security, and maintainability issues. The most critical finding is the **4,100-line monolithic backend file** with no authentication middleware, no database persistence, and duplicate route definitions. The frontend has **unused dependencies**, **no data-fetching library usage**, and **inconsistent API patterns**.

| Area | Score | Issues Found |
|------|-------|-------------|
| Backend Architecture | 2/10 | Monolith, no auth middleware, in-memory only |
| Security | 2/10 | No real auth, plaintext passwords, no rate limiting |
| Database | 1/10 | All Prisma paths disabled (`if (false && ...)`), in-memory stores |
| Frontend Performance | 5/10 | No memoization, no React Query usage, waterfall fetches |
| Build & Dependencies | 4/10 | Unused deps, lint/TS errors suppressed, duplicate packages |
| API Design | 5/10 | Duplicate routes, inconsistent response shapes, no pagination |

---

## 🔴 CRITICAL Issues

### 1. Monolithic Backend — Single 4,100-line file
**File:** `src/backend/src/server-basic.js`

The entire backend is a single file with 100+ route handlers, in-memory data stores, sample data, and business logic all mixed together. This is the #1 performance and maintainability blocker.

**Impact:** Impossible to test, debug, or scale. Every deployment restarts all routes. Memory usage grows unbounded with in-memory stores.

**Fix:** Decompose into modular route files:
```
src/backend/
  routes/
    auth.js
    members.js
    events.js
    care.js
    settings.js
    groups.js
  middleware/
    auth.js
    validation.js
  stores/
    inMemory.js
  server.js (< 100 lines)
```

### 2. Zero Authentication Middleware
**Lines:** All endpoints are unprotected

No route has actual token verification. The `/api/auth/me` endpoint at line 1920 checks if the token *starts with* `"demo-jwt-token"` — any string matching that prefix grants admin access.

```javascript
// Line 1920 — accepts ANY token starting with "demo-jwt-token"
if (token.startsWith('demo-jwt-token') || token === 'demo-jwt-token-12345') {
```

**Impact:** Any user can access any endpoint. Complete security bypass.

**Fix:** Implement JWT verification middleware using `jsonwebtoken` (already in `package.json` but unused):
```javascript
const jwt = require('jsonwebtoken');
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch { res.status(401).json({ error: 'Invalid token' }); }
}
```

### 3. Database Completely Disabled
**Pattern:** `if (false && dbConnected && prisma)` — ~40 occurrences

Every single Prisma database path is disabled with a hardcoded `false &&` prefix. The app runs entirely on in-memory arrays that **reset on every server restart**. All data (prayer requests, events, care records) is lost on deployment.

**Impact:** Zero data persistence. Production data vanishes on every Render deployment or server restart.

**Fix:** Remove `false &&` guards, enable real Prisma database connections, and ensure `DATABASE_URL` is configured on Render.

### 4. Password Storage — Plaintext
**Line 1736:**
```javascript
password: password, // In production, hash this!
```

The registration endpoint stores passwords in plaintext. `bcryptjs` is already in `package.json` but not used.

**Impact:** Complete credential compromise if database is ever exposed.

**Fix:** Use bcrypt for password hashing (the library is already installed).

---

## 🟠 HIGH Issues

### 5. Duplicate Route Definitions
Multiple routes are defined twice, which means Express will only match the **first** definition. The second is dead code.

| Route | First Definition | Second Definition |
|-------|-----------------|-------------------|
| `PUT /api/settings/system` | Line 2526 (has Prisma logic) | Line 4022 (simple echo) |
| `PUT /api/settings/church` | (none found before) | Line 4013 (simple echo) |

The `PUT /api/settings/system` at line 4022 will **never execute** because Express matches line 2526 first.

**Fix:** Remove duplicate routes, consolidate into single handlers.

### 6. In-Memory Stores — Unbounded Growth
**Lines 3700–3857:** `inMemoryPrayerRequests`, `inMemoryCareRecords`, `inMemoryEvents`

These arrays grow without limit. Every POST adds data that is never cleaned up. On a busy server, this causes memory leaks.

```javascript
inMemoryPrayerRequests.push(newRequest);  // Line 3889 — never purged
inMemoryEvents.push(newEvent);            // Line 3961 — never purged
inMemoryCareRecords.push(newRecord);      // Line 3933 — never purged
```

**Impact:** Memory consumption grows linearly until the server crashes or is restarted (which then loses all data).

**Fix:** Either implement database persistence (preferred) or add max-size caps with eviction.

### 7. Security Middleware Not Applied
**Installed but unused packages:**
- `helmet` — HTTP security headers (in `package.json`, never `require()`d)
- `express-rate-limit` — rate limiting (in `package.json`, never `require()`d)
- `express-validator` — input validation (in `package.json`, never `require()`d)
- `cookie-parser` — cookie handling (in `package.json`, never `require()`d)

**Impact:** No protection against common attacks (XSS, CSRF, brute-force, injection).

**Fix:** Add these middleware calls after `app.use(express.json())`:
```javascript
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
app.use(helmet());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
```

### 8. Frontend — TypeScript & ESLint Errors Suppressed
**File:** `src/frontend/next.config.js` lines 4–9
```javascript
typescript: { ignoreBuildErrors: true },
eslint: { ignoreDuringBuilds: true },
```

All TypeScript and ESLint errors are silently ignored during builds. This masks real bugs, type mismatches, and broken imports that would otherwise be caught at build time.

**Impact:** Broken code ships to production silently.

**Fix:** Set both to `false`, fix all reported errors, then keep them enforced in CI.

### 9. Frontend — Unused/Duplicate Dependencies
**File:** `src/frontend/package.json`

| Package | Issue |
|---------|-------|
| `react-query` (v3) | Duplicate of `@tanstack/react-query` (v5) — both installed, neither used |
| `@tanstack/react-query` | Installed but zero `useQuery` calls found anywhere |
| `axios` | Installed but all API calls use native `fetch()` |
| `@hookform/resolvers` + `react-hook-form` | Installed, limited actual usage |
| `framer-motion` | Installed, minimal usage detected |
| `next-auth` + `@next-auth/prisma-adapter` | Installed but custom auth used instead |
| `@headlessui/react` | Installed, may not be actively used |

**Impact:** ~500KB+ unnecessary JavaScript shipped to client. Slower builds, larger bundle.

**Fix:** Remove unused packages or migrate to using them consistently.

---

## 🟡 MEDIUM Issues

### 10. DashboardService — Redundant API Calls
**File:** `src/frontend/src/services/dashboardService.ts`

All four methods (`getStats`, `getRecentActivity`, `getUpcomingEvents`, `getAlerts`) call the **same endpoint** (`/api/reports/dashboard`) independently. If called in sequence without cache populated, this fires 4 identical HTTP requests.

**Fix:** Call the endpoint once, distribute results to all consumers. Or use `@tanstack/react-query` (already installed) for automatic deduplication.

### 11. Frontend — No React.memo / useMemo / useCallback
No components use `React.memo`, `useMemo`, or `useCallback`. Every state change in parent components triggers full re-renders of all children, including heavy list components like `MemberCareTracker`, `GroupList`, etc.

**Impact:** Sluggish UI on pages with large data sets.

**Fix:** Add `React.memo` to expensive child components, `useMemo` for filtered/sorted lists, `useCallback` for event handlers passed as props.

### 12. No Request Body Size Limit
**Line 28:** `app.use(express.json());`

No payload size limit configured. An attacker can send arbitrarily large JSON bodies to consume server memory.

**Fix:** `app.use(express.json({ limit: '1mb' }));`

### 13. API Response Inconsistency
Some endpoints return `{ members: [...] }`, others `{ data: [...] }`, others `{ records: [...] }`. The prayer requests endpoint returns both `prayerRequests` AND `requests` with identical data (lines 160–161).

**Impact:** Frontend must handle multiple response shapes, increasing complexity and bugs.

**Fix:** Standardize all responses to: `{ success, data, count, message }`.

### 14. Frontend Pages Missing Error Boundaries
No error boundaries exist around page content. A JavaScript error in any component crashes the entire page with a white screen.

**Fix:** Add `ErrorBoundary` components around page sections.

### 15. No API Request Timeout
Frontend `fetch()` calls have no timeout. A slow or hung backend will leave the UI in a loading state indefinitely.

**Fix:** Use `AbortController` with timeouts:
```javascript
const controller = new AbortController();
setTimeout(() => controller.abort(), 10000);
fetch(url, { signal: controller.signal });
```

### 16. CORS Wildcard Pattern Risk
**Line 16:** Backend allows requests from its own Render domain:
```javascript
'https://faithlink-ntgg.onrender.com'  // Backend domain (for internal calls)
```
This shouldn't be in the CORS origins — the backend doesn't call itself via HTTP.

---

## 🟢 LOW Issues

### 17. Missing `express.json()` Error Handling
Invalid JSON in request bodies returns Express's default 400 error with a stack trace. Should be caught and returned as a clean error.

### 18. No Compression Middleware
Response payloads are not gzip-compressed. Adding `compression` middleware would reduce bandwidth 60-80% for JSON responses.

### 19. Frontend Images Unoptimized
**Line 12 in next.config.js:** `images: { unoptimized: true }`  
Disables Next.js image optimization. All images served at original size/format.

### 20. No Logging Framework
Backend uses `console.log` / `console.error` everywhere. No structured logging, no log levels, no log aggregation.

**Fix:** Add `winston` or `pino` for structured, leveled logging.

### 21. `getNavigationItems()` Recreated Every Render
**File:** `DashboardLayout.tsx` line 41  
The navigation array is recalculated on every render. Should be memoized with `useMemo` based on `user?.role`.

### 22. Fallback Data Masks Real Errors
Many frontend catch blocks silently return mock/fallback data instead of showing errors to the user, making it impossible to detect when the backend is down.

---

## Priority Remediation Plan

### Phase 1 — Security (1-2 weeks)
1. Implement real JWT auth middleware
2. Enable bcrypt password hashing
3. Apply helmet, rate limiting, body size limits
4. Remove `false &&` from database paths, enable Prisma

### Phase 2 — Architecture (2-3 weeks)
1. Split `server-basic.js` into modular route files
2. Remove duplicate route definitions
3. Standardize API response format
4. Add request timeouts and error boundaries

### Phase 3 — Performance (1-2 weeks)
1. Remove unused frontend dependencies
2. Enable TypeScript/ESLint checking in builds
3. Add React.memo/useMemo to expensive components
4. Implement React Query for data fetching
5. Add compression middleware
6. Enable Next.js image optimization

### Phase 4 — Observability (1 week)
1. Add structured logging (winston/pino)
2. Add health check monitoring
3. Add request/response timing metrics
4. Replace fallback data with proper error states

---

## Summary

The platform works for demo purposes but has **critical gaps** that prevent production readiness:
- **No real authentication** — anyone can access any endpoint
- **No data persistence** — all data lost on restart
- **4,100-line monolith** — unmaintainable and untestable
- **~500KB unused JS** shipped to browser
- **Security middleware installed but not applied**

The highest-ROI fixes are: (1) enable database persistence, (2) implement JWT auth middleware, and (3) split the backend into modules.
