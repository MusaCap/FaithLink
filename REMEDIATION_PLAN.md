# FaithLink360 — Complete Remediation Plan

**Date:** March 5, 2026  
**Goal:** Fix ALL performance gaps + wire up every broken frontend feature to working backend APIs  
**Estimated Effort:** 6 phases, ~3-4 weeks

---

## PART A: Frontend ↔ Backend Disconnect Map

Every broken feature traced to its root cause.

### 🔴 COMPLETELY BROKEN (No Backend Endpoint Exists)

| # | Frontend Feature | Frontend File | API Call | Backend Status |
|---|-----------------|---------------|----------|---------------|
| 1 | **Counseling Sessions list** | `care/page.tsx:80` | `GET /api/care/counseling-sessions` | ❌ Missing endpoint |
| 2 | **Create Task** | `taskService.ts:132` | `POST /api/tasks` | ❌ Missing (only GET exists) |
| 3 | **Update Task** | `taskService.ts:147` | `PUT /api/tasks/:id` | ❌ Missing |
| 4 | **Delete Task** | `taskService.ts:163` | `DELETE /api/tasks/:id` | ❌ Missing |
| 5 | **Create Attendance** | `attendanceService.ts:144` | `POST /api/attendance` | ❌ Missing (only GET exists) |
| 6 | **Update Attendance** | `attendanceService.ts:159` | `PUT /api/attendance/:id` | ❌ Missing |
| 7 | **Delete Attendance** | `attendanceService.ts:176` | `DELETE /api/attendance/:id` | ❌ Missing |
| 8 | **Attendance Export** | `attendanceService.ts:211` | `GET /api/attendance/export` | ❌ Missing |
| 9 | **Bulk Update Attendance** | `attendanceService.ts:227` | `POST /api/attendance/:id/bulk-update` | ❌ Missing |
| 10 | **Reports Dashboard Stats** | `reports/page.tsx:33` | `GET /api/reports/dashboard-stats` | ❌ Missing (different from `/api/reports/dashboard`) |
| 11 | **Export Report** | `reports/page.tsx:52` | `GET /api/reports/export/:reportType` | ❌ Missing |
| 12 | **Create Journey Template** | `journeyService.ts:132` | `POST /api/journey-templates` | ❌ Missing (only GET exists) |
| 13 | **Update Journey Template** | `journeyService.ts:147` | `PUT /api/journey-templates/:id` | ❌ Missing |
| 14 | **Delete Journey Template** | `journeyService.ts:163` | `DELETE /api/journey-templates/:id` | ❌ Missing |
| 15 | **Duplicate Journey Template** | `journeyService.ts:174` | `POST /api/journey-templates/:id/duplicate` | ❌ Missing |
| 16 | **Export Journey Template** | `journeyService.ts:417` | `GET /api/journey-templates/:id/export` | ❌ Missing |
| 17 | **Assign Journey to Member** | `journeyService.ts:214` | `POST /api/journeys/member-journeys` | ❌ Missing |
| 18 | **Update Member Journey** | `journeyService.ts:229` | `PUT /api/journeys/member-journeys/:id` | ❌ Missing |
| 19 | **Delete Member Journey** | `journeyService.ts:245` | `DELETE /api/journeys/member-journeys/:id` | ❌ Missing |
| 20 | **Milestone Progress** | `journeyService.ts:258` | `GET /api/journeys/member-journeys/:id/milestones/:id/progress` | ❌ Missing |
| 21 | **Start Milestone** | `journeyService.ts:266` | `POST .../milestones/:id/start` | ❌ Missing |
| 22 | **Complete Milestone** | `journeyService.ts:279` | `POST .../milestones/:id/complete` | ❌ Missing |
| 23 | **Submit Milestone** | `journeyService.ts:306` | `POST /api/journeys/milestone-progress/:id/submit` | ❌ Missing |
| 24 | **Approve Milestone** | `journeyService.ts:334` | `POST .../milestones/:id/approve` | ❌ Missing |
| 25 | **Request Revision** | `journeyService.ts:354` | `POST .../milestones/:id/request-revision` | ❌ Missing |
| 26 | **Export Journey Progress** | `journeyService.ts:431` | `GET /api/journeys/member-journeys/:id/export` | ❌ Missing |
| 27 | **Create Email Campaign** | `communications/page.tsx` | `POST /api/communications/campaigns` | ❌ Missing (only GET exists) |
| 28 | **Create Announcement** | `communications/page.tsx` | `POST /api/communications/announcements` | ❌ Missing (only GET exists) |
| 29 | **Group Messages** | `GroupMessages.tsx` | `GET/POST/PUT/DELETE /api/groups/:id/messages` | ❌ Missing (all 5 endpoints) |
| 30 | **Group Files** | `GroupFiles.tsx` | `GET/POST/DELETE /api/groups/:id/files` | ❌ Missing (all 3 endpoints) |
| 31 | **Bug Report** | `BugReportModal.tsx:40` | `POST /api/bug-report` | ❌ Missing |
| 32 | **Volunteer CRUD** | `volunteerService.ts` | `GET/POST/PUT/DELETE /api/volunteers/*` | ❌ Only loaded when DB connected (always false) |
| 33 | **Volunteer Opportunities** | `volunteerService.ts` | `GET/POST /api/volunteer-opportunities/*` | ❌ Only loaded when DB connected |
| 34 | **Volunteer Hours** | `volunteerService.ts` | `GET/POST /api/volunteers/:id/hours` | ❌ Missing |
| 35 | **Volunteer Stats** | `volunteerService.ts` | `GET /api/volunteers/stats` | ❌ Missing |

### 🟠 PARTIALLY BROKEN (Backend returns data but UI actions don't work)

| # | Frontend Feature | Issue |
|---|-----------------|-------|
| 36 | **Prayer Request "View Details"** | `care/page.tsx:289` — button sets `selectedRequest` but no detail modal exists |
| 37 | **Prayer Request "Add Update"** | `care/page.tsx:293` — button has no `onClick` handler |
| 38 | **Prayer Request "Assign"** | `care/page.tsx:297` — button has no `onClick` handler |
| 39 | **Delete Prayer Request** | No DELETE endpoint or button exists |
| 40 | **Settings PUT persist** | Settings PUT echoes data back but doesn't actually persist — next GET returns defaults |
| 41 | **Activity page** | `activity/page.tsx:28-88` — still has hardcoded `mockActivities` array as fallback |

### 🟡 PERFORMANCE ISSUES (from audit)

| # | Issue | File |
|---|-------|------|
| 42 | 4,100-line monolithic backend | `server-basic.js` |
| 43 | No auth middleware — any token accepted | `server-basic.js:1920` |
| 44 | All Prisma DB paths disabled (`if false &&`) | ~40 occurrences |
| 45 | Plaintext password storage | `server-basic.js:1736` |
| 46 | Duplicate route definitions | Settings, events |
| 47 | Unbounded in-memory stores | Prayer requests, events, care records |
| 48 | Security middleware installed not applied | helmet, rate-limit, express-validator |
| 49 | TypeScript/ESLint errors suppressed | `next.config.js:5-8` |
| 50 | ~500KB unused frontend deps | react-query v3, axios, next-auth, etc. |
| 51 | DashboardService fires 4 duplicate API calls | `dashboardService.ts` |
| 52 | No React.memo/useMemo/useCallback anywhere | All components |
| 53 | No request body size limit | `server-basic.js:28` |
| 54 | No error boundaries | All pages |
| 55 | No fetch timeouts | All frontend API calls |

---

## PART B: Phased Remediation Plan

### Phase 1: Backend Architecture Refactor (Week 1)
**Goal:** Split monolith, enable security, fix structural issues

#### 1A. Split `server-basic.js` into modules
```
src/backend/
  src/
    server.js              (< 80 lines — app setup, middleware, imports)
    middleware/
      auth.js              (JWT verification)
      security.js          (helmet, rate-limit, body-size)
      errorHandler.js      (global error handler, 404)
    routes/
      auth.routes.js       (login, register, logout, me, forgot-password)
      members.routes.js    (members CRUD, self-service, stats, tags, bulk-upload)
      groups.routes.js     (groups CRUD, attendance, messages, files)
      events.routes.js     (events CRUD, registration, check-in, RSVP)
      care.routes.js       (prayer requests, care records, counseling, members-needing-care)
      tasks.routes.js      (tasks CRUD)
      journeys.routes.js   (templates CRUD, member journeys, milestones)
      communications.routes.js (campaigns, announcements)
      reports.routes.js    (dashboard, attendance, export)
      settings.routes.js   (church, system, users)
      volunteers.routes.js (volunteers, opportunities, hours)
      churches.routes.js   (church directory, join requests)
    stores/
      inMemoryStore.js     (centralized data stores with max-size caps)
    utils/
      helpers.js           (getNextDayOfWeek, etc.)
```

#### 1B. Apply Security Middleware
- JWT auth middleware on all `/api/*` routes (except `/api/auth/login`, `/api/auth/register`, `/health`)
- `helmet()` for HTTP security headers
- `express-rate-limit` — 100 req/15min per IP
- `express.json({ limit: '1mb' })` body size limit
- bcrypt password hashing on register

#### 1C. Remove Duplicate Routes
- Remove duplicate `PUT /api/settings/system` (line 4022)
- Consolidate all settings endpoints in one file
- Remove `if (false && dbConnected)` guards → use direct fallback pattern

#### 1D. Add Missing Backend Endpoints (~35 endpoints)
All endpoints listed in the disconnect map above, organized by route file:

**tasks.routes.js** — Add POST, PUT, DELETE with in-memory store  
**attendance.routes.js** — Add POST, PUT, DELETE, export, bulk-update  
**care.routes.js** — Add GET counseling-sessions, DELETE prayer request  
**journeys.routes.js** — Add full CRUD for templates and member journeys (POST, PUT, DELETE, duplicate, export, milestone lifecycle)  
**communications.routes.js** — Add POST for campaigns and announcements  
**groups.routes.js** — Add messages CRUD (5 endpoints) + files CRUD (3 endpoints)  
**reports.routes.js** — Add dashboard-stats, export/:reportType  
**volunteers.routes.js** — Add full inline CRUD (not gated on dbConnected)  
**misc** — Add POST /api/bug-report  

---

### Phase 2: Fix Frontend-Backend Wiring (Week 2)
**Goal:** Every button, form, and list on the frontend works end-to-end

#### 2A. Care Page Fixes
- Wire "View Details" button → open detail modal showing prayer request updates
- Wire "Add Update" button → inline form that POSTs to `/api/care/prayer-requests/:id` (update)
- Wire "Assign" button → dropdown of deacons, calls PUT to assign
- Counseling Sessions tab loads data from new `/api/care/counseling-sessions`

#### 2B. Tasks Page Fixes
- Create Task form → POST /api/tasks
- Update task status → PUT /api/tasks/:id
- Delete task → DELETE /api/tasks/:id
- Verify list refreshes after mutations

#### 2C. Communications Page Fixes
- Create Campaign → POST /api/communications/campaigns
- Create Announcement → POST /api/communications/announcements
- Verify list refreshes after creation

#### 2D. Reports Page Fixes
- Fix endpoint URL: `/api/reports/dashboard-stats` → match backend
- Wire Export button → `/api/reports/export/:reportType`

#### 2E. Journey Templates Fixes
- Create/Edit/Delete templates → POST/PUT/DELETE /api/journey-templates
- Assign journey to member → POST /api/journeys/member-journeys
- Milestone start/complete/submit/approve lifecycle
- Export functionality

#### 2F. Group Messages & Files
- Wire GroupMessages component to new backend endpoints
- Wire GroupFiles component to new backend endpoints

#### 2G. Activity Page
- Remove hardcoded `mockActivities` array
- Rely entirely on `/api/activity` endpoint

#### 2H. Settings Persistence
- Settings PUT endpoints should update in-memory store
- Settings GET endpoints should return stored values (not always defaults)

---

### Phase 3: Frontend Performance (Week 2-3)
**Goal:** Optimize rendering, reduce bundle, add resilience

#### 3A. Remove Unused Dependencies
```bash
npm uninstall react-query axios next-auth @next-auth/prisma-adapter @headlessui/react
```
Keep: `@tanstack/react-query` (migrate to use it), `react-hook-form`, `framer-motion`

#### 3B. Implement React Query (or centralized fetch hooks)
- Replace raw `fetch()` calls in page components with `useQuery`/`useMutation`
- Automatic caching, deduplication, refetching
- Remove manual cache in dashboardService, taskService, attendanceService

#### 3C. Add Memoization
- `React.memo` on: GroupList, MemberCareTracker, navigation items
- `useMemo` on: filtered lists (prayer requests, tasks, members, events)
- `useCallback` on: event handlers passed as props

#### 3D. Add Error Boundaries
- Create `<ErrorBoundary>` component
- Wrap each page section (sidebar, main content, modals)
- Show user-friendly fallback UI on crash

#### 3E. Add Fetch Timeouts
- Create `fetchWithTimeout` utility (10s default)
- Apply to all API calls

#### 3F. Enable TypeScript/ESLint
- Set `ignoreBuildErrors: false` and `ignoreDuringBuilds: false`
- Fix all reported errors
- Add to CI pipeline

---

### Phase 4: API Consistency & Data Integrity (Week 3)
**Goal:** Standardize response format, fix duplicate routes

#### 4A. Standardize Response Format
All endpoints return:
```json
{
  "success": true|false,
  "data": { ... },
  "count": 10,
  "total": 100,
  "message": "optional message"
}
```

#### 4B. Add Pagination to List Endpoints
All GET list endpoints accept `?page=1&limit=20` and return `total` count.

#### 4C. Add Input Validation
Use `express-validator` (already installed) on all POST/PUT endpoints.

#### 4D. Fix Inconsistent Response Keys
- Prayer requests: return only `data.prayerRequests` (remove duplicate `requests` key)
- Events: standardize on `data.events`
- Members: standardize on `data.members`

---

### Phase 5: Database Enablement (Week 3-4)
**Goal:** Enable real data persistence

#### 5A. Configure Database
- Ensure `DATABASE_URL` is set on Render
- Run `prisma migrate deploy` in CI/CD
- Seed production database

#### 5B. Enable Prisma Paths
- Remove all `if (false && dbConnected)` guards
- Use pattern: `if (dbConnected) { /* prisma */ } else { /* in-memory fallback */ }`
- In-memory stores become development-only fallback

#### 5C. Add Data Persistence to In-Memory Stores
- Until DB is enabled: add max-size caps (1000 items per store)
- Add TTL eviction (items older than 24h)

---

### Phase 6: Testing & Deployment (Week 4)
**Goal:** Verify everything works end-to-end

#### 6A. Backend API Tests
- Test every endpoint with `supertest` (already in devDependencies)
- Verify correct status codes, response shapes
- Test auth middleware blocks unauthorized requests

#### 6B. Frontend Integration Tests
- Test each page loads without errors
- Test form submissions reach backend
- Test error states display correctly

#### 6C. End-to-End Smoke Test
Manual walkthrough of every user flow:
1. Register → Login → Dashboard loads
2. Navigate to each page → data displays
3. Create/Edit/Delete on every module
4. Settings save and persist
5. Reports load and export

#### 6D. Deploy & Verify
- Commit all changes
- Push to GitHub
- Verify Render backend starts cleanly
- Verify Netlify frontend builds
- Run smoke test on production URLs

---

## Summary: What Gets Fixed

| Metric | Before | After |
|--------|--------|-------|
| Working frontend features | ~40% | 100% |
| Backend endpoints covering frontend calls | ~55% | 100% |
| Auth security | None (any token accepted) | JWT verification |
| Data persistence | In-memory (lost on restart) | In-memory with caps → Database |
| Backend file structure | 1 file, 4,100 lines | 15+ files, <200 lines each |
| Unused frontend JS | ~500KB | 0KB |
| TypeScript errors caught at build | 0 (suppressed) | All |
| Error boundaries | 0 | All pages |
| API response consistency | Mixed formats | Standardized |
| Security middleware | 0/4 applied | 4/4 applied |

---

## Recommended Execution Order

**Start with Phase 1** (backend architecture) because it unblocks everything else. The backend split makes it possible to add endpoints cleanly, and the auth middleware is a security requirement.

**Phase 2** (frontend wiring) delivers the most visible user value — every button starts working.

**Phases 3-4** (performance + consistency) can be done in parallel.

**Phase 5** (database) can be done independently once Phase 1 is complete.

**Phase 6** (testing) runs continuously but has a dedicated final sprint.
