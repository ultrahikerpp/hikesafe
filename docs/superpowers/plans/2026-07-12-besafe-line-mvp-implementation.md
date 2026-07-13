# BeSafe LINE MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-ready LINE LIFF hiking guard MVP that records standardized Taiwan hiking itineraries, sends check-ins, and escalates overdue trips at 0, 60, and 120 minutes.

**Architecture:** A Next.js App Router application hosts the LIFF UI and server endpoints. PostgreSQL stores users, route versions, trips, check-ins, LINE conversation bindings, and idempotent alert events; a one-minute protected job processes due alerts through a LINE Messaging API adapter. Domain code is independent of Next.js and LINE so time, notification, authorization, and offline behavior can be tested deterministically.

**Tech Stack:** Node.js 24 LTS, TypeScript, Next.js App Router, React, PostgreSQL, Drizzle ORM, `@line/liff`, `@line/bot-sdk`, Zod, Vitest, React Testing Library, MSW, Vercel Functions and `vercel.ts`.

## Global Constraints

- The UI runs inside LINE as a LIFF app; LINE Notify is forbidden because it ended on 2025-03-31.
- Alert stages are exactly scheduled at the planned finish time, +60 minutes, and +120 minutes.
- The system never automatically calls or reports to 119.
- Only active trip participants, bound guardians, or authenticated holders of a trip-scoped viewer grant can view precise GPS.
- Precise completed-trip GPS data is deleted after 90 days; active or unresolved-alert trips are never deleted.
- No background GPS, offline navigation, satellite communication, insurance, or permit filing in MVP.
- A location must carry `accuracyMeters`, `capturedAt`, and `source`; stale coordinates must never be presented as current.
- Every mutation accepts an idempotency key and is safe to retry.
- Route records must contain source URL, source organization, version, and last-reviewed date.
- Production deployment uses Node.js 24 and `vercel.ts`; do not add `vercel.json`.

---

## File Structure

```text
app/
  api/auth/line/route.ts             # Verify LIFF ID tokens and establish session
  api/line/webhook/route.ts          # Bind OA friends/groups from webhook messages
  api/jobs/alerts/route.ts            # Protected due-alert processor
  api/jobs/retention/route.ts         # Protected 90-day GPS cleanup
  api/routes/route.ts                 # Search approved route versions
  api/trips/route.ts                  # Create trips
  api/trips/[tripId]/start/route.ts   # Start and notify
  api/trips/[tripId]/check-ins/route.ts
  api/trips/[tripId]/finish/route.ts
  api/trips/[tripId]/extend/route.ts
  api/trips/[tripId]/report/route.ts
  trips/new/page.tsx
  trips/[tripId]/page.tsx
  layout.tsx
  page.tsx
src/
  db/client.ts                       # Drizzle client
  db/schema.ts                       # Relational schema and enums
  env.ts                             # Zod environment validation
  features/alerts/domain.ts          # Stage calculation and event creation
  features/alerts/process.ts         # Claim/send/mark alert events
  features/auth/session.ts           # Signed httpOnly session
  features/line/bindings.ts          # Binding-code lifecycle
  features/line/messages.ts          # Flex Message builders
  features/reports/build-report.ts   # Plain-text 119-ready summary
  features/routes/catalog.ts         # Catalog query contract
  features/routes/import.ts          # Validated source importer
  features/trips/domain.ts           # State transitions and authorization
  features/trips/service.ts          # Transactional trip use cases
  integrations/line/client.ts        # Push adapter
  integrations/line/verify-id-token.ts
  lib/clock.ts                       # Injectable Clock
  lib/idempotency.ts                 # Mutation deduplication
  lib/location.ts                    # Freshness and accuracy rules
  offline/check-in-queue.ts          # IndexedDB retry queue
data/routes/
  schema.json
  sources.json
  catalog.json                       # Reviewed 百岳 and popular suburban routes
drizzle/
  0000_initial.sql
scripts/
  import-routes.ts
  verify-route-catalog.ts
tests/
  api/
  features/
  fixtures/routes.ts
  integration/
  setup.ts
vercel.ts
vitest.config.ts
```

---

### Task 1: Application shell, test harness, and validated configuration

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `vitest.config.ts`, `tests/setup.ts`
- Create: `src/env.ts`, `src/lib/clock.ts`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `vercel.ts`
- Test: `tests/features/env.test.ts`, `tests/features/clock.test.ts`

**Interfaces:**
- Produces: `env`, `Clock`, `systemClock`, `createTestClock(iso)` used by all later tasks.

- [ ] **Step 1: Scaffold locally and add dependencies**

Run:

```bash
npm init -y
npm pkg set scripts.dev="next dev" scripts.build="next build" scripts.start="next start" scripts.test="vitest run" scripts.routes:verify="tsx scripts/verify-route-catalog.ts"
npm install next@latest react@latest react-dom@latest @vercel/config drizzle-orm postgres zod @line/liff @line/bot-sdk jose idb
npm install -D typescript @types/node @types/react @types/react-dom eslint eslint-config-next vitest @vitest/coverage-v8 jsdom @testing-library/react @testing-library/jest-dom msw drizzle-kit tsx
```

Expected: `npm run dev` exists and dependencies are recorded locally; no global package is installed.

- [ ] **Step 2: Write failing configuration and clock tests**

```ts
// tests/features/env.test.ts
import { describe, expect, it } from 'vitest';
import { parseEnv } from '@/src/env';

describe('parseEnv', () => {
  it('rejects missing LINE credentials', () => {
    expect(() => parseEnv({ DATABASE_URL: 'postgres://localhost/besafe' }))
      .toThrow(/LINE_CHANNEL_ID/);
  });
});

// tests/features/clock.test.ts
import { expect, it } from 'vitest';
import { createTestClock } from '@/src/lib/clock';

it('returns deterministic time', () => {
  expect(createTestClock('2026-07-12T05:00:00+08:00').now().toISOString())
    .toBe('2026-07-11T21:00:00.000Z');
});
```

- [ ] **Step 3: Verify the tests fail**

Run: `npm test -- tests/features/env.test.ts tests/features/clock.test.ts`

Expected: FAIL because `src/env.ts` and `src/lib/clock.ts` do not exist.

- [ ] **Step 4: Implement configuration, clock, metadata, and Vercel config**

```ts
// src/env.ts
import { z } from 'zod';

const schema = z.object({
  DATABASE_URL: z.string().url(),
  LINE_CHANNEL_ID: z.string().min(1),
  LINE_CHANNEL_SECRET: z.string().min(1),
  LINE_CHANNEL_ACCESS_TOKEN: z.string().min(1),
  SESSION_SECRET: z.string().min(32),
  JOB_SECRET: z.string().min(32),
  NEXT_PUBLIC_LIFF_ID: z.string().min(1),
});

export const parseEnv = (value: Record<string, string | undefined>) => schema.parse(value);
export const getEnv = () => parseEnv(process.env);

// src/lib/clock.ts
export interface Clock { now(): Date }
export const systemClock: Clock = { now: () => new Date() };
export const createTestClock = (iso: string): Clock => ({ now: () => new Date(iso) });

// vercel.ts
import type { VercelConfig } from '@vercel/config/v1';
export const config: VercelConfig = {
  framework: 'nextjs',
  crons: [
    { path: '/api/jobs/alerts', schedule: '* * * * *' },
    { path: '/api/jobs/retention', schedule: '17 3 * * *' },
  ],
};

// vitest.config.ts
import path from 'node:path';
import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: { environment: 'jsdom', setupFiles: ['./tests/setup.ts'] },
  resolve: { alias: { '@': path.resolve(__dirname, '.') } },
});

// tests/setup.ts
import '@testing-library/jest-dom/vitest';

// next.config.ts
import type { NextConfig } from 'next';
const nextConfig: NextConfig = {};
export default nextConfig;
```

Set `app/layout.tsx` metadata title to `BeSafe 登山留守` and description to `把路線與最後回報留給重要的人`.

- [ ] **Step 5: Verify and commit**

Run: `npm test -- tests/features/env.test.ts tests/features/clock.test.ts && npm run build`

Expected: 2 tests PASS and production build succeeds.

```bash
git add package.json package-lock.json tsconfig.json next.config.ts vitest.config.ts tests src app vercel.ts
git commit -m "chore: scaffold BeSafe application"
```

---

### Task 2: Domain types, database schema, and trip state transitions

**Files:**
- Create: `src/db/client.ts`, `src/db/schema.ts`, `src/features/trips/domain.ts`, `src/lib/location.ts`
- Create: `drizzle.config.ts`, `drizzle/0000_initial.sql`
- Test: `tests/features/trip-domain.test.ts`, `tests/features/location.test.ts`

**Interfaces:**
- Produces: `TripStatus`, `TripRole`, `LocationFix`, `canFinishTrip(role)`, `assertFreshLocation(fix, now)`, and Drizzle tables.

- [ ] **Step 1: Write failing domain tests**

```ts
// tests/features/trip-domain.test.ts
import { describe, expect, it } from 'vitest';
import { canFinishTrip, transitionTrip } from '@/src/features/trips/domain';

describe('trip state', () => {
  it('allows leader and deputy to finish an active trip', () => {
    expect(canFinishTrip('leader')).toBe(true);
    expect(canFinishTrip('deputy')).toBe(true);
    expect(canFinishTrip('member')).toBe(false);
    expect(transitionTrip('active', 'finish')).toBe('finished');
  });
  it('rejects starting a finished trip', () => {
    expect(() => transitionTrip('finished', 'start')).toThrow('Invalid trip transition');
  });
});

// tests/features/location.test.ts
import { expect, it } from 'vitest';
import { assertFreshLocation } from '@/src/lib/location';

it('rejects a stale fix instead of presenting it as current', () => {
  expect(() => assertFreshLocation({ latitude: 24.18, longitude: 121.28,
    accuracyMeters: 25, capturedAt: new Date('2026-07-12T08:00:00Z'), source: 'gps' },
    new Date('2026-07-12T08:06:01Z'))).toThrow('Location is stale');
});
```

- [ ] **Step 2: Run tests and confirm failure**

Run: `npm test -- tests/features/trip-domain.test.ts tests/features/location.test.ts`

Expected: FAIL with unresolved module errors.

- [ ] **Step 3: Implement the domain contracts**

```ts
// src/features/trips/domain.ts
export type TripStatus = 'draft' | 'active' | 'finished' | 'cancelled';
export type TripRole = 'leader' | 'deputy' | 'member';
export type TripAction = 'start' | 'finish' | 'cancel';

const transitions: Record<TripStatus, Partial<Record<TripAction, TripStatus>>> = {
  draft: { start: 'active', cancel: 'cancelled' },
  active: { finish: 'finished', cancel: 'cancelled' },
  finished: {}, cancelled: {},
};
export const canFinishTrip = (role: TripRole) => role === 'leader' || role === 'deputy';
export function transitionTrip(status: TripStatus, action: TripAction): TripStatus {
  const next = transitions[status][action];
  if (!next) throw new Error('Invalid trip transition');
  return next;
}

// src/lib/location.ts
export interface LocationFix {
  latitude: number; longitude: number; accuracyMeters: number;
  capturedAt: Date; source: 'gps' | 'network';
}
export function assertFreshLocation(fix: LocationFix, now: Date) {
  if (now.getTime() - fix.capturedAt.getTime() > 5 * 60_000) throw new Error('Location is stale');
  if (fix.accuracyMeters > 200) throw new Error('Location accuracy is insufficient');
  return fix;
}
```

- [ ] **Step 4: Define and migrate the relational schema**

Create tables for `users`, `routes`, `route_versions`, `trips`, `trip_members`, `guardians`, `line_bindings`, `check_ins`, `alert_events`, `viewer_grants`, and `idempotency_keys`. Add unique indexes on `(trip_id, stage)` for alerts, `(user_id, key)` for idempotency, and `(trip_id, user_id)` for membership. Use timestamptz for every timestamp and numeric columns for latitude, longitude, and accuracy.

Run: `npx drizzle-kit generate`

Expected: `drizzle/0000_initial.sql` contains all eleven tables and the three unique indexes.

- [ ] **Step 5: Verify and commit**

Run: `npm test -- tests/features/trip-domain.test.ts tests/features/location.test.ts && npm run build`

Expected: 4 domain tests PASS and build succeeds.

```bash
git add src/db src/features/trips src/lib/location.ts drizzle drizzle.config.ts tests/features
git commit -m "feat: add trip domain and database schema"
```

---

### Task 3: Versioned Taiwan route catalog and verified importer

**Files:**
- Create: `data/routes/schema.json`, `data/routes/sources.json`, `data/routes/catalog.json`
- Create: `src/features/routes/import.ts`, `src/features/routes/catalog.ts`, `scripts/import-routes.ts`, `scripts/verify-route-catalog.ts`
- Create: `app/api/routes/route.ts`
- Test: `tests/fixtures/routes.ts`, `tests/features/route-import.test.ts`, `tests/api/routes.test.ts`

**Interfaces:**
- Produces: `RouteInput`, `importRouteCatalog(inputs)`, `searchRoutes(query)`, `GET /api/routes?q=&region=&kind=`.

- [ ] **Step 1: Write failing catalog validation tests**

```ts
// tests/features/route-import.test.ts
import { expect, it } from 'vitest';
import { validateRouteInput } from '@/src/features/routes/import';
import { validRoute } from '@/tests/fixtures/routes';

it('requires traceable source and review metadata', () => {
  expect(validateRouteInput(validRoute).sourceUrl).toMatch(/^https:/);
  expect(() => validateRouteInput({ ...validRoute, sourceUrl: '' })).toThrow();
  expect(() => validateRouteInput({ ...validRoute, checkpoints: [] })).toThrow();
});
```

Use this exact fixture shape:

```ts
export const validRoute = {
  slug: 'hehuan-north-xiaofengkou', mountainName: '合歡北峰', routeName: '小風口往返',
  region: '南投縣', kind: 'hundred_peak', startLat: 24.1819, startLng: 121.2814,
  distanceKm: 5.2, elevationGainM: 495, durationMinutes: 240, difficulty: 3,
  checkpoints: [{ name: '合歡北峰', order: 1 }], evacuationPoints: [{ name: '小風口', order: 1 }],
  permitNotes: '出發前查閱主管機關最新公告', sourceOrganization: '太魯閣國家公園管理處',
  sourceUrl: 'https://www.taroko.gov.tw/', sourceVersion: '2026-07-12', reviewedAt: '2026-07-12',
};
```

- [ ] **Step 2: Run the failing test**

Run: `npm test -- tests/features/route-import.test.ts`

Expected: FAIL because `validateRouteInput` does not exist.

- [ ] **Step 3: Implement Zod validation and transactional upsert**

```ts
// src/features/routes/import.ts
import { z } from 'zod';
export const routeInputSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/), mountainName: z.string().min(1), routeName: z.string().min(1),
  region: z.string().min(1), kind: z.enum(['hundred_peak', 'suburban']),
  startLat: z.number().min(21).max(26), startLng: z.number().min(119).max(123),
  distanceKm: z.number().positive(), elevationGainM: z.number().nonnegative(),
  durationMinutes: z.number().int().positive(), difficulty: z.number().int().min(1).max(5),
  checkpoints: z.array(z.object({ name: z.string().min(1), order: z.number().int().positive() })).min(1),
  evacuationPoints: z.array(z.object({ name: z.string().min(1), order: z.number().int().positive() })).min(1),
  permitNotes: z.string(), sourceOrganization: z.string().min(1), sourceUrl: z.string().url(),
  sourceVersion: z.string().min(1), reviewedAt: z.iso.date(),
});
export type RouteInput = z.infer<typeof routeInputSchema>;
export const validateRouteInput = (input: unknown) => routeInputSchema.parse(input);
```

`importRouteCatalog` must parse the full file before opening a transaction, upsert by `slug`, insert a new immutable `route_versions` row when source version or reviewed content changes, and leave the previous version addressable by existing trips.

- [ ] **Step 4: Populate and verify the complete launch catalog**

Create `sources.json` with one entry per source organization and URL. Populate `catalog.json` with every Taiwan 百岳 entry and the approved popular suburban routes, each matching `RouteInput`. Do not synthesize distance, elevation, duration, checkpoints, or evacuation points; exclude a route until all required fields have a traceable source and human review date.

The initial 30 day-hike routes are: 七星山主峰東峰、大屯山主峰、面天山向天山、劍潭山、金面山、皇帝殿東西峰、五寮尖、筆架連峰、南插天山、北插天山、姜子寮山、無耳茶壺山半屏山、桃源谷、東眼山、拉拉山、飛鳳山、鵝公髻山、加里山、火炎山、八仙山、馬崙山、屋我尾山、波津加山、東卯山、唐麻丹山、白毛山、大塔山、尾寮山、里龍山、都蘭山。 If a named route cannot satisfy every required field from an authoritative source, the verification command must fail and launch is blocked; do not replace it with invented data.

Run: `npm run routes:verify`

Expected output:

```text
Catalog valid
Hundred peaks: 100
Suburban routes: 30 or more
Missing sources: 0
Duplicate slugs: 0
```

- [ ] **Step 5: Add search API and tests**

Test that `GET /api/routes?q=合歡&kind=hundred_peak` returns only approved active versions, includes source and review metadata, and never returns superseded versions. Implement query normalization for Traditional Chinese substring matching and filters for `region` and `kind`.

Run: `npm test -- tests/features/route-import.test.ts tests/api/routes.test.ts`

Expected: importer and API tests PASS.

- [ ] **Step 6: Commit**

```bash
git add data/routes src/features/routes scripts app/api/routes tests
git commit -m "feat: add verified Taiwan route catalog"
```

---

### Task 4: LINE identity, signed sessions, and friend/group binding

**Files:**
- Create: `src/integrations/line/verify-id-token.ts`, `src/features/auth/session.ts`, `src/features/line/bindings.ts`
- Create: `app/api/auth/line/route.ts`, `app/api/line/webhook/route.ts`
- Test: `tests/features/line-auth.test.ts`, `tests/integration/line-binding.test.ts`

**Interfaces:**
- Produces: `verifyLineIdToken(token) -> LineIdentity`, `createSession(identity)`, `createBindingCode(userId)`, and webhook binding for `user`, `group`, or `room` conversations.

- [ ] **Step 1: Write failing token and binding tests**

Test these exact behaviors: invalid audience is rejected; expired token is rejected; a six-character code expires after 10 minutes; only the user who created a code can bind it; webhook signature failure returns 401; `綁定 ABC123` stores the event source type and source ID without logging the channel access token.

Run: `npm test -- tests/features/line-auth.test.ts tests/integration/line-binding.test.ts`

Expected: FAIL with missing modules.

- [ ] **Step 2: Implement ID-token verification and session cookie**

```ts
export interface LineIdentity { lineUserId: string; displayName: string; pictureUrl?: string }
export async function verifyLineIdToken(idToken: string): Promise<LineIdentity> {
  const body = new URLSearchParams({ id_token: idToken, client_id: env.LINE_CHANNEL_ID });
  const response = await fetch('https://api.line.me/oauth2/v2.1/verify', { method: 'POST', body });
  if (!response.ok) throw new Error('Invalid LINE identity token');
  const value = await response.json();
  return { lineUserId: value.sub, displayName: value.name, pictureUrl: value.picture };
}
```

Sign an httpOnly, secure, sameSite=lax session with `jose`; store only internal user ID, LINE user ID, and expiry. Never accept a LINE user ID directly from client JSON.

- [ ] **Step 3: Implement webhook binding**

Validate `x-line-signature` before reading events. A binding code is single-use and expires after 10 minutes. For group binding, store the group ID from the webhook source; do not use discontinued LIFF `groupId`. Reply with `已綁定 BeSafe 留守通知` after success.

- [ ] **Step 4: Verify and commit**

Run: `npm test -- tests/features/line-auth.test.ts tests/integration/line-binding.test.ts`

Expected: all auth and binding tests PASS.

```bash
git add src/integrations/line src/features/auth src/features/line app/api/auth app/api/line tests
git commit -m "feat: add LINE identity and guardian binding"
```

---

### Task 5: Trip creation, membership authorization, and viewer grants

**Files:**
- Create: `src/features/trips/service.ts`, `src/features/auth/authorize-trip.ts`, `src/lib/idempotency.ts`
- Create: `app/api/trips/route.ts`, `app/trips/new/page.tsx`, `app/trips/new/TripForm.tsx`
- Test: `tests/features/trip-service.test.ts`, `tests/api/create-trip.test.ts`

**Interfaces:**
- Consumes: route version IDs, LINE session user, `TripRole`.
- Produces: `createTrip(command)`, `authorizeTripViewer(request)`, and `POST /api/trips`.

- [ ] **Step 1: Write failing trip creation tests**

Test that creation rejects a superseded route version, finish time before start, no deputy on a multi-person trip, duplicate member IDs, unbound guardian, and reused idempotency key with different JSON. Test that a repeated identical request returns the original trip ID.

Run: `npm test -- tests/features/trip-service.test.ts tests/api/create-trip.test.ts`

Expected: FAIL with missing trip service.

- [ ] **Step 2: Implement typed create command and transaction**

```ts
export interface CreateTripCommand {
  ownerUserId: string; routeVersionId: string; startsAt: Date; plannedFinishAt: Date;
  members: Array<{ userId: string; role: 'leader' | 'deputy' | 'member' }>;
  guardianBindingIds: string[]; vehicle: string; equipment: string[]; idempotencyKey: string;
}
```

In one database transaction: reserve the idempotency key, verify route and bindings, insert the draft trip and members, create a 32-byte random viewer grant per guardian binding, store only SHA-256 hashes, and return plaintext grants only for composing messages.

- [ ] **Step 3: Build the three-step form**

Screen 1 selects region, mountain, route, and displays source metadata. Screen 2 assigns leader, deputy, and members. Screen 3 chooses bindings, vehicle, equipment, start, and planned finish. Submit exactly one `POST /api/trips` with a UUID idempotency key.

- [ ] **Step 4: Verify and commit**

Run: `npm test -- tests/features/trip-service.test.ts tests/api/create-trip.test.ts && npm run build`

Expected: service and API tests PASS; build succeeds.

```bash
git add src/features/trips src/features/auth src/lib/idempotency.ts app/api/trips app/trips/new tests
git commit -m "feat: add guarded trip creation"
```

---

### Task 6: Start, check-in, extension, offline queue, and finish flows

**Files:**
- Create: `src/offline/check-in-queue.ts`, `src/features/trips/commands.ts`
- Create: `app/trips/[tripId]/page.tsx`, `app/trips/[tripId]/TripActions.tsx`
- Create: trip start, check-in, extend, and finish API routes listed in File Structure
- Test: `tests/features/trip-commands.test.ts`, `tests/features/offline-queue.test.ts`, `tests/api/trip-lifecycle.test.ts`

**Interfaces:**
- Produces: `startTrip`, `recordCheckIn`, `extendTrip`, `finishTrip`, `enqueueCheckIn`, and `flushCheckIns`.

- [ ] **Step 1: Write failing lifecycle tests**

Cover: fresh GPS starts a draft trip; member may check in; only leader/deputy may extend or finish; text-only check-in records `locationStatus='unavailable'`; stale GPS is rejected; finish cancels pending alerts; extension atomically replaces unsent stage schedule; duplicate idempotency keys do not duplicate records.

- [ ] **Step 2: Write failing offline queue tests**

Use an in-memory IndexedDB adapter. Assert queued items display `pending`, flush oldest first, keep failed items, remove successful items, and preserve the original idempotency key across retries.

Run: `npm test -- tests/features/trip-commands.test.ts tests/features/offline-queue.test.ts`

Expected: FAIL with missing commands and queue.

- [ ] **Step 3: Implement transactional commands and API routes**

Each command locks the trip row, verifies state and role, reserves its idempotency key, applies the mutation, and commits notification outbox rows in the same transaction. `finishTrip` sets `finishedAt`, stores the final location or explicit unavailable state, and marks all pending alert events cancelled.

- [ ] **Step 4: Implement the active-trip UI**

Show elapsed time, planned finish, last successfully sent check-in, current GPS freshness, pending queue count, and four actions: `回報目前進度`, `延長下山時間`, `需要協助`, `確認全隊安全下山`. Never render a pending check-in as delivered.

- [ ] **Step 5: Verify and commit**

Run: `npm test -- tests/features/trip-commands.test.ts tests/features/offline-queue.test.ts tests/api/trip-lifecycle.test.ts && npm run build`

Expected: lifecycle, offline, and API tests PASS; build succeeds.

```bash
git add src/offline src/features/trips app/trips app/api/trips tests
git commit -m "feat: add trip check-in lifecycle"
```

---

### Task 7: Deterministic three-stage alert processor and LINE messages

**Files:**
- Create: `src/features/alerts/domain.ts`, `src/features/alerts/process.ts`
- Create: `src/features/line/messages.ts`, `src/integrations/line/client.ts`
- Create: `app/api/jobs/alerts/route.ts`
- Test: `tests/features/alert-domain.test.ts`, `tests/features/alert-process.test.ts`, `tests/features/line-messages.test.ts`

**Interfaces:**
- Produces: `scheduleAlertEvents(tripId, plannedFinishAt)`, `processDueAlerts(clock)`, and `buildLineMessage(stage, trip)`.

- [ ] **Step 1: Write failing schedule tests**

```ts
import { expect, it } from 'vitest';
import { scheduleAlertEvents } from '@/src/features/alerts/domain';

it('schedules exactly 0, 60, and 120 minute stages', () => {
  const due = new Date('2026-07-12T05:00:00Z');
  expect(scheduleAlertEvents('trip-1', due).map(x => [x.stage, x.dueAt.toISOString()])).toEqual([
    ['due', '2026-07-12T05:00:00.000Z'],
    ['overdue_60', '2026-07-12T06:00:00.000Z'],
    ['overdue_120', '2026-07-12T07:00:00.000Z'],
  ]);
});
```

Add tests that finished trips send nothing, concurrent workers claim an event once, LINE failure increments attempts without marking sent, and extending a trip cancels old pending stages before adding three new stages.

- [ ] **Step 2: Run and confirm failure**

Run: `npm test -- tests/features/alert-domain.test.ts tests/features/alert-process.test.ts`

Expected: FAIL with missing alert modules.

- [ ] **Step 3: Implement stage generation and worker claiming**

```ts
export type AlertStage = 'due' | 'overdue_60' | 'overdue_120';
export function scheduleAlertEvents(tripId: string, plannedFinishAt: Date) {
  return ([['due', 0], ['overdue_60', 60], ['overdue_120', 120]] as const).map(([stage, minutes]) => ({
    tripId, stage, dueAt: new Date(plannedFinishAt.getTime() + minutes * 60_000),
  }));
}
```

Claim up to 100 due rows with `FOR UPDATE SKIP LOCKED`. Before each send, re-read trip status; skip finished or cancelled trips. Mark sent only after LINE returns success. Retry failed rows with bounded exponential delay at 1, 5, 15, and 30 minutes.

- [ ] **Step 4: Build exact notification content**

`due` goes only to active participants. `overdue_60` sends a yellow guardian card with planned time, last check-in time, route, team, call-participant action, and a no-signal disclaimer. `overdue_120` sends a red card with viewer-grant URL, last location availability, report copy action, and a `tel:119` action; message copy explicitly says the system has not contacted 119.

- [ ] **Step 5: Protect and test the job route**

Require `Authorization: Bearer ${JOB_SECRET}`. Return `{ claimed, sent, failed, skipped }`. Reject a missing or incorrect secret with 401.

Run: `npm test -- tests/features/alert-domain.test.ts tests/features/alert-process.test.ts tests/features/line-messages.test.ts`

Expected: all alert and message snapshot tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/features/alerts src/features/line src/integrations/line app/api/jobs/alerts tests/features
git commit -m "feat: add overdue alert escalation"
```

---

### Task 8: Emergency report, authorization, and 90-day retention

**Files:**
- Create: `src/features/reports/build-report.ts`, `src/features/auth/viewer-grants.ts`
- Create: `app/api/trips/[tripId]/report/route.ts`, `app/api/jobs/retention/route.ts`
- Test: `tests/features/report.test.ts`, `tests/features/viewer-grants.test.ts`, `tests/features/retention.test.ts`

**Interfaces:**
- Produces: `buildEmergencyReport(trip)`, `authorizeViewerGrant(token, lineUserId)`, and `deleteExpiredPreciseLocations(clock)`.

- [ ] **Step 1: Write failing report and privacy tests**

Assert the report includes team, route, start, planned finish, last successful check-in, GPS accuracy/time when present, vehicle, equipment, checkpoints, evacuation points, and `BeSafe 尚未代為通報 119`. Assert it says `最後位置未取得` when absent and never substitutes an older coordinate as current.

Assert viewer grants require both a valid LINE session and matching hashed bearer token, and use constant-time hash comparison. Delivery-derived grants retain their short retry/deadline cap; the 90-day GPS retention policy does not extend that authority. Assert retention deletes latitude, longitude, and accuracy only for finished trips older than 90 days while preserving active and unresolved-alert trips.

- [ ] **Step 2: Run and confirm failure**

Run: `npm test -- tests/features/report.test.ts tests/features/viewer-grants.test.ts tests/features/retention.test.ts`

Expected: FAIL with missing modules.

- [ ] **Step 3: Implement report, grant verification, and cleanup**

Return the report as UTF-8 plain text and structured JSON. Hash incoming grants with SHA-256 and compare using `timingSafeEqual`. Cleanup executes in one transaction, records deleted row count, and never deletes trip identity, route version, or notification audit fields.

- [ ] **Step 4: Verify and commit**

Run: `npm test -- tests/features/report.test.ts tests/features/viewer-grants.test.ts tests/features/retention.test.ts`

Expected: report, authorization, and retention tests PASS.

```bash
git add src/features/reports src/features/auth app/api/trips app/api/jobs/retention tests/features
git commit -m "feat: add emergency report and data retention"
```

---

### Task 9: Full-flow integration, accessibility, and failure-state verification

**Files:**
- Create: `tests/integration/full-trip-flow.test.ts`, `tests/integration/alert-race.test.ts`
- Modify: `app/globals.css`, `app/page.tsx`, `app/trips/new/TripForm.tsx`, `app/trips/[tripId]/TripActions.tsx`
- Create: `README.md`, `.env.example`

**Interfaces:**
- Consumes all prior interfaces; produces the deployable MVP.

- [ ] **Step 1: Write the end-to-end integration test**

Using MSW for LINE and a test PostgreSQL database, execute: authenticate leader; create route-backed trip; bind group; create trip; start with GPS; member check-in; extend finish; run job at new due time, +60, +120; verify three distinct messages; finish trip; run worker again; verify no new alert; run retention at day 91; verify precise GPS removed.

- [ ] **Step 2: Write the race and failure test**

Run two alert workers concurrently while a deputy finishes the trip. Assert each stage sends at most once and no stage sends after the finish transaction commits. Simulate LINE 500 then 200 and assert a single eventual sent event with two attempts.

- [ ] **Step 3: Run integration tests**

Run: `npm test -- tests/integration/full-trip-flow.test.ts tests/integration/alert-race.test.ts`

Expected: both integration files PASS with no open handles.

- [ ] **Step 4: Complete accessible mobile UI**

Ensure 44px minimum touch targets, visible keyboard focus, semantic labels, non-color alert labels (`正常`, `留意`, `紅色警示`), reduced-motion support, and 375px layout without horizontal scrolling. Keep primary navigation to `建立行程`, `開始登山`, `進度回報`, and `安全下山`.

- [ ] **Step 5: Document setup and operational checks**

`.env.example` lists all seven keys from `src/env.ts` without values. README documents LINE Login channel, Messaging API channel, webhook URL, LIFF endpoint, OA group permission, database migration, route catalog verification, alert job authorization, retention job, local test commands, and the explicit limitations from Global Constraints.

- [ ] **Step 6: Run final verification**

Run:

```bash
npm test
npm run routes:verify
npm run build
```

Expected: all tests PASS, route report shows 100 百岳 and at least 30 suburban routes with zero missing sources, and production build succeeds.

Then use `/browse` against the local app to verify at 375×812 and 1280×720: create trip, start, check in, offline pending state, extension, finish, and unauthorized report rejection. Capture console and failed-network output; expected result is zero uncaught errors and zero unintended failed requests.

- [ ] **Step 7: Commit**

```bash
git add app tests README.md .env.example
git commit -m "feat: complete BeSafe LINE MVP"
```

---

## Deployment Gate

Do not deploy until the user supplies or authorizes creation of LINE Login and Messaging API credentials, a PostgreSQL database, and Vercel environment values. Before deployment, upgrade the outdated Vercel CLI through Homebrew in accordance with project installation policy, confirm version 55.0.0 or newer, apply migrations, import the verified catalog, register the webhook and LIFF URL, deploy, and run the full `/browse` canary flow against production.
