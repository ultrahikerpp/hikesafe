# Quick Trip Creation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let an authenticated returning hiker create a single-person trip in seconds by explicitly selecting an active verified route and confirming prefilled trip details.

**Architecture:** Add a read-only trip-defaults service backed by the authenticated user's latest trip, expose it through a session-protected endpoint, and replace the three-step client form with one quick-create form. Keep `POST /api/trips` and `createTrip` as the only write path; do not add preferences storage, browser persistence, a custom-route path, or a database migration.

**Tech Stack:** Node.js 24.x, Next.js 16 App Router, React 19, TypeScript 6, PostgreSQL, Drizzle ORM, Zod, Vitest, Testing Library, npm.

## Global Constraints

- Use Node 24.x and npm; do not add dependencies.
- Only active, verified route versions returned by the existing route catalog may be selected.
- Do not add custom routes, navigation, background GPS, automatic rescue inference, or automatic 112/119 contact.
- Preserve LINE session verification and ensure defaults are scoped to the authenticated owner.
- Do not store defaults in `localStorage`, cookies, or a new database table.
- Use the latest successfully inserted `trips` record as the only source of previously confirmed vehicle, equipment, phone, route, and guardian choices.
- Keep `POST /api/trips` and `createTrip` as the sole write path and preserve idempotency.
- Require an explicit route selection, at least one currently active guardian, a valid time window, a non-empty vehicle value, and final confirmation before enabling submit.
- Do not touch existing Drizzle migrations or unrelated route-catalog work.
- Preserve all unrelated working-tree changes.

## File Structure

- Create `src/features/trips/quick-defaults.ts`: owner-scoped domain/repository boundary for reading the latest confirmed trip setup.
- Create `tests/features/quick-trip-defaults.test.ts`: domain tests for owner scoping, inactive routes, valid guardians, and empty history.
- Create `app/api/trips/quick-defaults/route.ts`: LINE-session-protected read endpoint.
- Create `tests/api/quick-trip-defaults.test.ts`: endpoint authentication, response, and failure tests.
- Create `app/trips/new/quick-trip-form.ts`: pure datetime and submit-readiness helpers used by the client form.
- Create `tests/features/quick-trip-form-state.test.ts`: deterministic helper tests.
- Modify `app/trips/new/TripForm.tsx`: one-page route search, explicit previous-route action, prefill, guardian confirmation, binding-code flow, and existing trip submission.
- Modify `app/globals.css`: compact mobile form layout and accessible field grouping.
- Create `tests/features/quick-trip-form.test.tsx`: component-level behavior and degraded-state tests.

---

### Task 1: Owner-Scoped Quick Defaults Query

**Files:**
- Create: `src/features/trips/quick-defaults.ts`
- Test: `tests/features/quick-trip-defaults.test.ts`

**Interfaces:**
- Consumes: `trips`, `routeVersions`, `guardians`, and `lineBindings` from `src/db/schema.ts`.
- Produces: `loadQuickTripDefaults(ownerUserId: string, repository?: QuickTripDefaultsRepository): Promise<QuickTripDefaults>`.
- Produces: `QuickTripDefaults` with `routeVersionId: string | null`, `guardianBindingIds: string[]`, `vehicle: string`, `equipment: string[]`, and `leaderPhone: string`.

- [ ] **Step 1: Write the failing domain tests**

Create `tests/features/quick-trip-defaults.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest';

import {
  loadQuickTripDefaults,
  type QuickTripDefaultsRepository,
} from '@/src/features/trips/quick-defaults';

const latestTrip = {
  id: 'trip-2',
  routeVersionId: 'route-version-2',
  routeIsActive: true,
  vehicle: '白色廂型車 ABC-1234',
  equipment: ['頭燈', '保暖衣'],
  leaderPhone: '0912345678',
};

describe('loadQuickTripDefaults', () => {
  it('returns the authenticated owner latest trip and active guardian choices', async () => {
    const repository: QuickTripDefaultsRepository = {
      findLatestTripForOwner: vi.fn().mockResolvedValue(latestTrip),
      findActiveGuardianBindingIds: vi.fn().mockResolvedValue(['binding-1']),
    };

    await expect(loadQuickTripDefaults('owner-1', repository)).resolves.toEqual({
      routeVersionId: 'route-version-2',
      guardianBindingIds: ['binding-1'],
      vehicle: '白色廂型車 ABC-1234',
      equipment: ['頭燈', '保暖衣'],
      leaderPhone: '0912345678',
    });
    expect(repository.findLatestTripForOwner).toHaveBeenCalledWith('owner-1');
    expect(repository.findActiveGuardianBindingIds).toHaveBeenCalledWith('owner-1', 'trip-2');
  });

  it('omits a superseded route while retaining confirmed non-route values', async () => {
    const repository: QuickTripDefaultsRepository = {
      findLatestTripForOwner: vi.fn().mockResolvedValue({ ...latestTrip, routeIsActive: false }),
      findActiveGuardianBindingIds: vi.fn().mockResolvedValue([]),
    };

    await expect(loadQuickTripDefaults('owner-1', repository)).resolves.toEqual({
      routeVersionId: null,
      guardianBindingIds: [],
      vehicle: '白色廂型車 ABC-1234',
      equipment: ['頭燈', '保暖衣'],
      leaderPhone: '0912345678',
    });
  });

  it('returns an empty setup when the owner has no previous trip', async () => {
    const repository: QuickTripDefaultsRepository = {
      findLatestTripForOwner: vi.fn().mockResolvedValue(undefined),
      findActiveGuardianBindingIds: vi.fn(),
    };

    await expect(loadQuickTripDefaults('owner-1', repository)).resolves.toEqual({
      routeVersionId: null,
      guardianBindingIds: [],
      vehicle: '',
      equipment: [],
      leaderPhone: '',
    });
    expect(repository.findActiveGuardianBindingIds).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run the test and confirm the missing module failure**

Run:

```bash
npm test -- tests/features/quick-trip-defaults.test.ts
```

Expected: FAIL because `@/src/features/trips/quick-defaults` does not exist.

- [ ] **Step 3: Implement the owner-scoped query boundary**

Create `src/features/trips/quick-defaults.ts`:

```ts
export interface QuickTripDefaults {
  routeVersionId: string | null;
  guardianBindingIds: string[];
  vehicle: string;
  equipment: string[];
  leaderPhone: string;
}

interface LatestTripSetup {
  id: string;
  routeVersionId: string;
  routeIsActive: boolean;
  vehicle: string;
  equipment: unknown;
  leaderPhone: string;
}

export interface QuickTripDefaultsRepository {
  findLatestTripForOwner(ownerUserId: string): Promise<LatestTripSetup | undefined>;
  findActiveGuardianBindingIds(ownerUserId: string, tripId: string): Promise<string[]>;
}

const emptyDefaults = (): QuickTripDefaults => ({
  routeVersionId: null,
  guardianBindingIds: [],
  vehicle: '',
  equipment: [],
  leaderPhone: '',
});

const stringList = (value: unknown) =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];

export const loadQuickTripDefaults = async (
  ownerUserId: string,
  repository: QuickTripDefaultsRepository = databaseRepository,
): Promise<QuickTripDefaults> => {
  const latest = await repository.findLatestTripForOwner(ownerUserId);
  if (!latest) return emptyDefaults();

  return {
    routeVersionId: latest.routeIsActive ? latest.routeVersionId : null,
    guardianBindingIds: await repository.findActiveGuardianBindingIds(ownerUserId, latest.id),
    vehicle: latest.vehicle,
    equipment: stringList(latest.equipment),
    leaderPhone: latest.leaderPhone,
  };
};

const databaseRepository: QuickTripDefaultsRepository = {
  async findLatestTripForOwner(ownerUserId) {
    const [{ desc, eq }, { db }, { routeVersions, trips }] = await Promise.all([
      import('drizzle-orm'),
      import('@/src/db/client'),
      import('@/src/db/schema'),
    ]);
    const [trip] = await db.select({
      id: trips.id,
      routeVersionId: trips.routeVersionId,
      routeIsActive: routeVersions.isActive,
      vehicle: trips.vehicle,
      equipment: trips.equipment,
      leaderPhone: trips.leaderPhone,
    }).from(trips)
      .innerJoin(routeVersions, eq(routeVersions.id, trips.routeVersionId))
      .where(eq(trips.ownerUserId, ownerUserId))
      .orderBy(desc(trips.createdAt))
      .limit(1);
    return trip;
  },

  async findActiveGuardianBindingIds(ownerUserId, tripId) {
    const [{ and, eq, isNotNull, isNull }, { db }, { guardians, lineBindings }] = await Promise.all([
      import('drizzle-orm'),
      import('@/src/db/client'),
      import('@/src/db/schema'),
    ]);
    const bindings = await db.select({ id: lineBindings.id })
      .from(guardians)
      .innerJoin(lineBindings, eq(lineBindings.id, guardians.lineBindingId))
      .where(and(
        eq(guardians.tripId, tripId),
        eq(lineBindings.userId, ownerUserId),
        isNotNull(lineBindings.boundAt),
        isNotNull(lineBindings.sourceId),
        isNull(lineBindings.revokedAt),
      ));
    return bindings.map(({ id }) => id);
  },
};
```

- [ ] **Step 4: Run the domain tests**

Run:

```bash
npm test -- tests/features/quick-trip-defaults.test.ts
```

Expected: PASS with 3 tests.

- [ ] **Step 5: Commit the domain query**

```bash
git add src/features/trips/quick-defaults.ts tests/features/quick-trip-defaults.test.ts
git commit -m "feat: load quick trip defaults"
```

---

### Task 2: Authenticated Quick Defaults Endpoint

**Files:**
- Create: `app/api/trips/quick-defaults/route.ts`
- Test: `tests/api/quick-trip-defaults.test.ts`

**Interfaces:**
- Consumes: `loadQuickTripDefaults(ownerUserId: string)` from Task 1 and `verifySession(token: string)` from `src/features/auth/session.ts`.
- Produces: `GET /api/trips/quick-defaults`, returning `{ defaults: QuickTripDefaults }`, `401` without a verified LINE session, or `503` if the read fails.

- [ ] **Step 1: Write the failing endpoint tests**

Create `tests/api/quick-trip-defaults.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/src/features/auth/session', () => ({
  verifySession: vi.fn(),
  sessionCookie: { name: 'besafe_session' },
}));
vi.mock('@/src/features/trips/quick-defaults', () => ({ loadQuickTripDefaults: vi.fn() }));

import { GET } from '@/app/api/trips/quick-defaults/route';
import { verifySession } from '@/src/features/auth/session';
import { loadQuickTripDefaults } from '@/src/features/trips/quick-defaults';

describe('GET /api/trips/quick-defaults', () => {
  beforeEach(() => {
    vi.mocked(verifySession).mockReset();
    vi.mocked(loadQuickTripDefaults).mockReset();
  });

  it('requires a verified LINE session', async () => {
    const response = await GET(new Request('http://localhost/api/trips/quick-defaults'));

    expect(response.status).toBe(401);
    expect(loadQuickTripDefaults).not.toHaveBeenCalled();
  });

  it('loads defaults only for the authenticated owner', async () => {
    vi.mocked(verifySession).mockResolvedValue({
      userId: 'owner-1', lineUserId: 'U-owner', expiresAt: new Date(),
    });
    vi.mocked(loadQuickTripDefaults).mockResolvedValue({
      routeVersionId: 'route-version-1',
      guardianBindingIds: ['binding-1'],
      vehicle: '汽車 ABC-1234',
      equipment: ['頭燈'],
      leaderPhone: '0912345678',
    });

    const response = await GET(new Request('http://localhost/api/trips/quick-defaults', {
      headers: { cookie: 'besafe_session=session-token' },
    }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ defaults: expect.objectContaining({
      routeVersionId: 'route-version-1', guardianBindingIds: ['binding-1'],
    }) });
    expect(loadQuickTripDefaults).toHaveBeenCalledWith('owner-1');
  });

  it('returns a controlled unavailable response when defaults cannot be read', async () => {
    vi.mocked(verifySession).mockResolvedValue({
      userId: 'owner-1', lineUserId: 'U-owner', expiresAt: new Date(),
    });
    vi.mocked(loadQuickTripDefaults).mockRejectedValue(new Error('database unavailable'));

    const response = await GET(new Request('http://localhost/api/trips/quick-defaults', {
      headers: { cookie: 'besafe_session=session-token' },
    }));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ error: 'Quick defaults unavailable' });
  });
});
```

- [ ] **Step 2: Run the endpoint tests and confirm the missing route failure**

Run:

```bash
npm test -- tests/api/quick-trip-defaults.test.ts
```

Expected: FAIL because `app/api/trips/quick-defaults/route.ts` does not exist.

- [ ] **Step 3: Implement the protected read endpoint**

Create `app/api/trips/quick-defaults/route.ts`:

```ts
import { NextResponse } from 'next/server';

import { sessionCookie, verifySession } from '@/src/features/auth/session';
import { loadQuickTripDefaults } from '@/src/features/trips/quick-defaults';

const sessionToken = (request: Request) => request.headers.get('cookie')
  ?.split(';')
  .map((part) => part.trim())
  .find((part) => part.startsWith(`${sessionCookie.name}=`))
  ?.slice(sessionCookie.name.length + 1);

export const GET = async (request: Request) => {
  const token = sessionToken(request);
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let session;
  try {
    session = await verifySession(token);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    return NextResponse.json({ defaults: await loadQuickTripDefaults(session.userId) });
  } catch {
    return NextResponse.json({ error: 'Quick defaults unavailable' }, { status: 503 });
  }
};
```

- [ ] **Step 4: Run the endpoint and domain tests**

Run:

```bash
npm test -- tests/api/quick-trip-defaults.test.ts tests/features/quick-trip-defaults.test.ts
```

Expected: PASS with 6 tests.

- [ ] **Step 5: Commit the endpoint**

```bash
git add app/api/trips/quick-defaults/route.ts tests/api/quick-trip-defaults.test.ts
git commit -m "feat: expose quick trip defaults"
```

---

### Task 3: Deterministic Quick Form State Rules

**Files:**
- Create: `app/trips/new/quick-trip-form.ts`
- Test: `tests/features/quick-trip-form-state.test.ts`

**Interfaces:**
- Produces: `QuickRouteOption`, `QuickTripDefaultsResponse`, `currentStartValue`, `calculatePlannedFinish`, `isValidTripWindow`, and `canSubmitQuickTrip`.
- Consumed by: `TripForm` in Task 4.

- [ ] **Step 1: Write the failing state tests**

Create `tests/features/quick-trip-form-state.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import {
  calculatePlannedFinish,
  canSubmitQuickTrip,
  currentStartValue,
  isValidTripWindow,
} from '@/app/trips/new/quick-trip-form';

describe('quick trip form state', () => {
  it('rounds the default start to the current local minute', () => {
    const now = new Date(2026, 6, 18, 8, 12, 59, 900);
    expect(currentStartValue(now)).toBe('2026-07-18T08:12');
  });

  it('uses the selected route official duration for the initial finish time', () => {
    expect(calculatePlannedFinish('2026-07-18T08:00', 240))
      .toBe('2026-07-18T12:00');
  });

  it('rejects incomplete or reversed windows and accepts a confirmed complete setup', () => {
    expect(isValidTripWindow('2026-07-18T08:00', '2026-07-18T07:59')).toBe(false);
    expect(canSubmitQuickTrip({
      routeVersionId: 'route-1',
      guardianBindingIds: ['binding-1'],
      startsAt: '2026-07-18T08:00',
      plannedFinishAt: '2026-07-18T12:00',
      vehicle: '汽車 ABC-1234',
      confirmed: true,
    })).toBe(true);
    expect(canSubmitQuickTrip({
      routeVersionId: 'route-1',
      guardianBindingIds: [],
      startsAt: '2026-07-18T08:00',
      plannedFinishAt: '2026-07-18T12:00',
      vehicle: '汽車 ABC-1234',
      confirmed: true,
    })).toBe(false);
  });
});
```

- [ ] **Step 2: Run the state tests and confirm the missing module failure**

Run:

```bash
npm test -- tests/features/quick-trip-form-state.test.ts
```

Expected: FAIL because `app/trips/new/quick-trip-form.ts` does not exist.

- [ ] **Step 3: Implement the pure state helpers**

Create `app/trips/new/quick-trip-form.ts`:

```ts
export interface QuickRouteOption {
  id: string;
  region: string;
  mountainName: string;
  routeName: string;
  durationMinutes: number;
  sourceOrganization: string;
  sourceUrl: string;
  sourceVersion: string;
  reviewedAt: string;
}

export interface QuickTripDefaultsResponse {
  routeVersionId: string | null;
  guardianBindingIds: string[];
  vehicle: string;
  equipment: string[];
  leaderPhone: string;
}

const pad = (value: number) => String(value).padStart(2, '0');

const localDateTime = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
  `T${pad(date.getHours())}:${pad(date.getMinutes())}`;

export const currentStartValue = (now = new Date()) => {
  const rounded = new Date(now);
  rounded.setSeconds(0, 0);
  return localDateTime(rounded);
};

export const calculatePlannedFinish = (startsAt: string, durationMinutes: number) => {
  const start = new Date(startsAt);
  if (!startsAt || Number.isNaN(start.getTime()) || durationMinutes <= 0) return '';
  return localDateTime(new Date(start.getTime() + durationMinutes * 60_000));
};

export const isValidTripWindow = (startsAt: string, plannedFinishAt: string) => {
  const start = new Date(startsAt).getTime();
  const finish = new Date(plannedFinishAt).getTime();
  return Number.isFinite(start) && Number.isFinite(finish) && finish > start;
};

export const canSubmitQuickTrip = (input: {
  routeVersionId: string;
  guardianBindingIds: string[];
  startsAt: string;
  plannedFinishAt: string;
  vehicle: string;
  confirmed: boolean;
}) => Boolean(
  input.routeVersionId &&
  input.guardianBindingIds.length > 0 &&
  input.vehicle.trim() &&
  input.confirmed &&
  isValidTripWindow(input.startsAt, input.plannedFinishAt),
);
```

- [ ] **Step 4: Run the state tests**

Run:

```bash
npm test -- tests/features/quick-trip-form-state.test.ts
```

Expected: PASS with 3 tests.

- [ ] **Step 5: Commit the state rules**

```bash
git add app/trips/new/quick-trip-form.ts tests/features/quick-trip-form-state.test.ts
git commit -m "feat: define quick trip form rules"
```

---

### Task 4: One-Page Quick Trip Form

**Files:**
- Modify: `app/trips/new/TripForm.tsx`
- Modify: `app/globals.css`
- Create: `tests/features/quick-trip-form.test.tsx`

**Interfaces:**
- Consumes: `GET /api/routes`, `GET /api/guardian-bindings`, `POST /api/guardian-bindings`, `GET /api/trips/quick-defaults`, and the existing `POST /api/trips`.
- Consumes: all exports from `app/trips/new/quick-trip-form.ts` created in Task 3.
- Produces: a single-page accessible form that never auto-selects the previous route and never treats failed creation as success.

- [ ] **Step 1: Write failing component tests for explicit selection, timing, degraded defaults, and catalog failure**

Create `tests/features/quick-trip-form.test.tsx`:

```tsx
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TripForm } from '@/app/trips/new/TripForm';

const route = {
  id: 'route-version-1',
  region: '南投縣',
  mountainName: '合歡山主峰',
  routeName: '合歡山主峰線',
  durationMinutes: 240,
  sourceOrganization: '太魯閣國家公園管理處',
  sourceUrl: 'https://www.taroko.gov.tw/',
  sourceVersion: '2026-07-12',
  reviewedAt: '2026-07-12',
};

const binding = {
  id: 'binding-1', sourceType: 'user', displayName: '小玉',
  sourceId: 'U-guardian', boundAt: '2026-07-18T00:00:00.000Z',
};

const defaults = {
  routeVersionId: route.id,
  guardianBindingIds: [binding.id],
  vehicle: '汽車 ABC-1234',
  equipment: ['頭燈'],
  leaderPhone: '0912345678',
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { 'content-type': 'application/json' },
});

const installFetch = (options: { defaultsStatus?: number; routesStatus?: number; tripStatus?: number } = {}) => {
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    if (url === '/api/routes') return options.routesStatus
      ? json({ error: 'Route catalog unavailable' }, options.routesStatus)
      : json({ routes: [route] });
    if (url === '/api/guardian-bindings') return json({ bindings: [binding] });
    if (url === '/api/trips/quick-defaults') return options.defaultsStatus
      ? json({ error: 'Quick defaults unavailable' }, options.defaultsStatus)
      : json({ defaults });
    if (url === '/api/trips' && init?.method === 'POST') return options.tripStatus
      ? json({ error: 'Guardian binding is not active' }, options.tripStatus)
      : json({ tripId: 'trip-1' }, 201);
    throw new Error(`Unexpected fetch: ${url}`);
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

describe('TripForm quick creation', () => {
  beforeEach(() => installFetch());
  afterEach(() => vi.unstubAllGlobals());

  it('requires an explicit previous-route action and keeps a manually edited finish time', async () => {
    render(<TripForm />);

    const routeSelect = await screen.findByRole('combobox', { name: '路線' });
    expect(routeSelect).toHaveValue('');
    fireEvent.click(await screen.findByRole('button', { name: '使用上次路線：合歡山主峰線' }));
    expect(routeSelect).toHaveValue(route.id);

    fireEvent.change(screen.getByLabelText('出發時間'), { target: { value: '2026-07-18T08:00' } });
    expect(screen.getByLabelText('預計下山時間')).toHaveValue('2026-07-18T12:00');

    fireEvent.change(screen.getByLabelText('預計下山時間'), { target: { value: '2026-07-18T13:00' } });
    fireEvent.change(screen.getByLabelText('出發時間'), { target: { value: '2026-07-18T09:00' } });
    expect(screen.getByLabelText('預計下山時間')).toHaveValue('2026-07-18T13:00');
  });

  it('prefills active guardians and emergency details but requires final confirmation', async () => {
    render(<TripForm />);
    fireEvent.click(await screen.findByRole('button', { name: '使用上次路線：合歡山主峰線' }));

    expect(await screen.findByRole('checkbox', { name: '小玉' })).toBeChecked();
    fireEvent.click(screen.getByText('行程與緊急資料'));
    expect(screen.getByLabelText('交通工具')).toHaveValue('汽車 ABC-1234');
    expect(screen.getByLabelText('裝備（每行一項）')).toHaveValue('頭燈');
    expect(screen.getByLabelText('領隊聯絡電話（供留守聯絡）')).toHaveValue('0912345678');

    const submit = screen.getByRole('button', { name: '建立行程草稿' });
    expect(submit).toBeDisabled();
    fireEvent.click(screen.getByRole('checkbox', { name: '我已確認路線、預計下山時間與留守人' }));
    expect(submit).toBeEnabled();
  });

  it('remains usable from empty fields when quick defaults are unavailable', async () => {
    vi.unstubAllGlobals();
    installFetch({ defaultsStatus: 503 });
    render(<TripForm />);

    expect(await screen.findByRole('option', { name: '南投縣｜合歡山主峰｜合歡山主峰線' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /使用上次路線/ })).not.toBeInTheDocument();
  });

  it('blocks creation when the verified route catalog is unavailable', async () => {
    vi.unstubAllGlobals();
    installFetch({ routesStatus: 503 });
    render(<TripForm />);

    expect(await screen.findByRole('alert')).toHaveTextContent('目前沒有可用的已啟用路線版本');
    expect(screen.getByRole('button', { name: '建立行程草稿' })).toBeDisabled();
  });

  it('uses the existing create endpoint and refreshes stale server-validated choices', async () => {
    vi.unstubAllGlobals();
    const fetchMock = installFetch({ tripStatus: 422 });
    render(<TripForm />);
    fireEvent.click(await screen.findByRole('button', { name: '使用上次路線：合歡山主峰線' }));
    fireEvent.click(screen.getByRole('checkbox', { name: '我已確認路線、預計下山時間與留守人' }));
    fireEvent.click(screen.getByRole('button', { name: '建立行程草稿' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Guardian binding is not active');
    const createCall = fetchMock.mock.calls.find(([url, init]) =>
      url === '/api/trips' && init?.method === 'POST');
    expect(createCall).toBeDefined();
    expect(JSON.parse(String(createCall?.[1]?.body))).toMatchObject({
      routeVersionId: route.id,
      guardianBindingIds: [binding.id],
      members: [],
      vehicle: '汽車 ABC-1234',
    });
    await waitFor(() => {
      expect(fetchMock.mock.calls.filter(([url]) => url === '/api/routes')).toHaveLength(2);
      expect(fetchMock.mock.calls.filter(([url]) => url === '/api/guardian-bindings')).toHaveLength(2);
    });
  });
});
```

- [ ] **Step 2: Run the component tests and confirm failures against the three-step form**

Run:

```bash
npm test -- tests/features/quick-trip-form.test.tsx
```

Expected: FAIL because the current form has no quick-defaults request, explicit previous-route button, confirmation checkbox, or one-page layout.

- [ ] **Step 3: Replace the three-step form with the one-page quick form**

Replace `app/trips/new/TripForm.tsx` with:

```tsx
'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';

import {
  calculatePlannedFinish,
  canSubmitQuickTrip,
  currentStartValue,
  type QuickRouteOption,
  type QuickTripDefaultsResponse,
} from './quick-trip-form';

interface GuardianBinding {
  id: string;
  sourceType: 'user' | 'group' | 'room' | null;
  displayName: string | null;
  sourceId: string | null;
  boundAt: string | null;
}

const splitLines = (value: string) => value
  .split(/\n|,/)
  .map((item) => item.trim())
  .filter(Boolean);

export function TripForm() {
  const [routes, setRoutes] = useState<QuickRouteOption[]>([]);
  const [routeQuery, setRouteQuery] = useState('');
  const [routeVersionId, setRouteVersionId] = useState('');
  const [lastRouteVersionId, setLastRouteVersionId] = useState<string | null>(null);
  const [catalogAvailable, setCatalogAvailable] = useState(false);
  const [bindings, setBindings] = useState<GuardianBinding[]>([]);
  const [guardianBindingIds, setGuardianBindingIds] = useState<string[]>([]);
  const [bindingCode, setBindingCode] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [equipment, setEquipment] = useState('');
  const [leaderPhone, setLeaderPhone] = useState('');
  const [startsAt, setStartsAt] = useState(() => currentStartValue());
  const [plannedFinishAt, setPlannedFinishAt] = useState('');
  const [finishWasEdited, setFinishWasEdited] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const [error, setError] = useState('');

  const refreshRoutes = useCallback(async () => {
    const response = await fetch('/api/routes');
    if (!response.ok) throw new Error('Route catalog unavailable');
    const body = await response.json() as { routes: QuickRouteOption[] };
    setRoutes(body.routes);
    setCatalogAvailable(true);
  }, []);

  const refreshBindings = useCallback(async () => {
    const response = await fetch('/api/guardian-bindings');
    if (!response.ok) throw new Error('Guardian bindings unavailable');
    setBindings((await response.json() as { bindings: GuardianBinding[] }).bindings);
  }, []);

  useEffect(() => {
    void refreshRoutes().catch(() => {
      setCatalogAvailable(false);
      setError('目前沒有可用的已啟用路線版本。正式路線目錄尚未通過安全驗證時，無法建立行程。');
    });
    void refreshBindings().catch(() => setError('請先完成 LINE 登入，才能管理留守綁定。'));
    void fetch('/api/trips/quick-defaults').then(async (response) => {
      if (!response.ok) return;
      const { defaults } = await response.json() as { defaults: QuickTripDefaultsResponse };
      setLastRouteVersionId(defaults.routeVersionId);
      setGuardianBindingIds(defaults.guardianBindingIds);
      setVehicle(defaults.vehicle);
      setEquipment(defaults.equipment.join('\n'));
      setLeaderPhone(defaults.leaderPhone);
    }).catch(() => undefined);
  }, [refreshBindings, refreshRoutes]);

  const activeBindings = useMemo(() => bindings.filter(
    (binding) => binding.boundAt && binding.sourceId,
  ), [bindings]);
  const activeBindingIds = useMemo(
    () => new Set(activeBindings.map(({ id }) => id)),
    [activeBindings],
  );
  const selectedGuardianBindingIds = guardianBindingIds.filter((id) => activeBindingIds.has(id));
  const selectedRoute = routes.find(({ id }) => id === routeVersionId);
  const lastRoute = routes.find(({ id }) => id === lastRouteVersionId);
  const visibleRoutes = useMemo(() => {
    const query = routeQuery.normalize('NFKC').trim().toLocaleLowerCase('zh-Hant-TW');
    if (!query) return routes;
    return routes.filter((route) =>
      `${route.region} ${route.mountainName} ${route.routeName}`
        .normalize('NFKC')
        .toLocaleLowerCase('zh-Hant-TW')
        .includes(query),
    );
  }, [routeQuery, routes]);

  const chooseRoute = (id: string) => {
    setRouteVersionId(id);
    setConfirmed(false);
    const route = routes.find((item) => item.id === id);
    if (route && !finishWasEdited) {
      setPlannedFinishAt(calculatePlannedFinish(startsAt, route.durationMinutes));
    }
  };

  const changeStart = (value: string) => {
    setStartsAt(value);
    setConfirmed(false);
    if (selectedRoute && !finishWasEdited) {
      setPlannedFinishAt(calculatePlannedFinish(value, selectedRoute.durationMinutes));
    }
  };

  const createBinding = async () => {
    setError('');
    const response = await fetch('/api/guardian-bindings', { method: 'POST' });
    const body = await response.json() as { code?: string; error?: string };
    if (!response.ok || !body.code) {
      setError(body.error ?? '無法建立綁定碼');
      return;
    }
    setBindingCode(body.code);
    await refreshBindings();
  };

  const canSubmit = catalogAvailable && !submitting && canSubmitQuickTrip({
    routeVersionId,
    guardianBindingIds: selectedGuardianBindingIds,
    startsAt,
    plannedFinishAt,
    vehicle,
    confirmed,
  });

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError('');
    const response = await fetch('/api/trips', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        routeVersionId,
        startsAt: new Date(startsAt).toISOString(),
        plannedFinishAt: new Date(plannedFinishAt).toISOString(),
        members: [],
        guardianBindingIds: selectedGuardianBindingIds,
        vehicle: vehicle.trim(),
        equipment: splitLines(equipment),
        leaderPhone,
        idempotencyKey,
      }),
    });
    const body = await response.json() as { tripId?: string; error?: string };
    if (!response.ok || !body.tripId) {
      setSubmitting(false);
      setError(body.error ?? '無法建立行程');
      await Promise.allSettled([refreshRoutes(), refreshBindings()]);
      return;
    }
    window.location.assign(`/trips/${body.tripId}`);
  };

  return <form className="trip-form" onSubmit={submit}>
    <h1>快速建立行程</h1>
    <p>僅能使用已驗證、已啟用的路線。建立後仍需在登山口取得 GPS 才能開始行程。</p>

    {lastRoute && <button type="button" className="secondary-action" onClick={() => chooseRoute(lastRoute.id)}>
      使用上次路線：{lastRoute.routeName}
    </button>}

    <label>搜尋已驗證路線
      <input type="search" value={routeQuery} onChange={(event) => setRouteQuery(event.target.value)} />
    </label>
    <label>路線
      <select required value={routeVersionId} onChange={(event) => chooseRoute(event.target.value)}>
        <option value="">請選擇</option>
        {visibleRoutes.map((route) => <option key={route.id} value={route.id}>
          {route.region}｜{route.mountainName}｜{route.routeName}
        </option>)}
      </select>
    </label>
    {selectedRoute && <p className="source-note">官方預估 {selectedRoute.durationMinutes} 分鐘；來源：<a href={selectedRoute.sourceUrl}>{selectedRoute.sourceOrganization}</a>；版本 {selectedRoute.sourceVersion}；覆核 {selectedRoute.reviewedAt}</p>}

    <div className="quick-time-grid">
      <label>出發時間
        <input required type="datetime-local" value={startsAt} onChange={(event) => changeStart(event.target.value)} />
      </label>
      <label>預計下山時間
        <input required type="datetime-local" value={plannedFinishAt} onChange={(event) => {
          setPlannedFinishAt(event.target.value);
          setFinishWasEdited(true);
          setConfirmed(false);
        }} />
      </label>
    </div>

    <fieldset>
      <legend>本次留守人</legend>
      {activeBindings.map((binding) => <label key={binding.id}>
        <input type="checkbox" checked={guardianBindingIds.includes(binding.id)} onChange={(event) => {
          setConfirmed(false);
          setGuardianBindingIds((ids) => event.target.checked
            ? [...new Set([...ids, binding.id])]
            : ids.filter((id) => id !== binding.id));
        }} />
        {binding.displayName || (binding.sourceType === 'group' ? '已綁定群組' : '已綁定留守人')}
      </label>)}
      {activeBindings.length === 0 && <p>尚無有效留守綁定，請先建立綁定碼。</p>}
      <button type="button" className="secondary-action" onClick={() => void createBinding()}>建立留守綁定碼</button>
      {bindingCode && <p role="status">本次綁定碼：{bindingCode}（10 分鐘有效）。請在 HikeSafe 官方帳號私訊、群組或聊天室輸入「綁定 {bindingCode}」。</p>}
    </fieldset>

    <details>
      <summary>行程與緊急資料</summary>
      <label>交通工具
        <input required value={vehicle} onChange={(event) => { setVehicle(event.target.value); setConfirmed(false); }} />
      </label>
      <label>裝備（每行一項）
        <textarea value={equipment} onChange={(event) => setEquipment(event.target.value)} />
      </label>
      <label>領隊聯絡電話（供留守聯絡）
        <input type="tel" value={leaderPhone} onChange={(event) => setLeaderPhone(event.target.value)} />
      </label>
    </details>

    <label className="confirmation-row">
      <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} />
      我已確認路線、預計下山時間與留守人
    </label>
    <button type="submit" disabled={!canSubmit}>{submitting ? '建立中…' : '建立行程草稿'}</button>
    {error && <p role="alert">{error}</p>}
  </form>;
}
```

- [ ] **Step 4: Add compact mobile form styles**

Append these rules to `app/globals.css`:

```css
.trip-form fieldset,
.trip-form details {
  margin-top: 1rem;
  border: 1px solid #b8c8bc;
  border-radius: 0.5rem;
  padding: 0.75rem;
  background: #fff;
}

.trip-form summary {
  min-height: 44px;
  cursor: pointer;
  font-weight: 700;
}

.trip-form input[type='checkbox'] {
  display: inline-block;
  width: auto;
  min-height: auto;
  margin-right: 0.5rem;
}

.quick-time-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.source-note {
  font-size: 0.875rem;
}

.trip-form .secondary-action {
  color: #174a2c;
  border: 1px solid #174a2c;
  background: #fff;
}

.confirmation-row {
  padding: 0.75rem;
  border-left: 0.35rem solid #174a2c;
  background: #edf7ef;
}

@media (max-width: 36rem) {
  .quick-time-grid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 5: Run the quick form tests**

Run:

```bash
npm test -- tests/features/quick-trip-form-state.test.ts tests/features/quick-trip-form.test.tsx
```

Expected: PASS with 8 tests.

- [ ] **Step 6: Run the existing trip creation and route API tests**

Run:

```bash
npm test -- tests/api/create-trip.test.ts tests/api/routes.test.ts tests/features/draft-trip.test.tsx
```

Expected: PASS; the existing write API, active-route filter, and draft start flow remain unchanged.

- [ ] **Step 7: Commit the one-page form**

```bash
git add app/trips/new/TripForm.tsx app/globals.css tests/features/quick-trip-form.test.tsx
git commit -m "feat: add quick trip creation form"
```

---

### Task 5: Full Verification

**Files:**
- Verify only; modify only files changed by Tasks 1-4 if a regression directly caused by this feature is found.

**Interfaces:**
- Consumes: all deliverables from Tasks 1-4.
- Produces: a passing logic/API suite and production Next.js build.

- [ ] **Step 1: Run all tests**

Run:

```bash
npm test
```

Expected: all Vitest suites pass, including quick defaults, quick form, trip creation, authorization, alert, offline queue, and integration abstractions.

- [ ] **Step 2: Run the production build**

Run:

```bash
npm run build
```

Expected: Next.js production build succeeds with `/api/trips/quick-defaults` included and no TypeScript errors.

- [ ] **Step 3: Inspect the final scoped diff**

Run:

```bash
git status --short
git diff --stat HEAD~4..HEAD
```

Expected: the four implementation commits contain only the files listed in this plan; pre-existing unrelated changes remain unstaged and unmodified.

- [ ] **Step 4: Record verification in the final handoff**

Report the exact `npm test` suite/test totals and the `npm run build` result. Explicitly state that `npm run routes:verify` was not required because route catalog data and import logic were not changed.
