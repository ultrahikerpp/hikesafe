# Task 5 Report: 接受邀請 API (accept guardian invite)

## What I implemented

`POST /api/guardian-invites/accept` (`app/api/guardian-invites/accept/route.ts`), following the brief exactly:

1. Validates request body with `z.object({ token: z.string().min(1), idToken: z.string().min(1) }).strict()`. Malformed body → 400, without ever calling `verifyLineIdToken`.
2. Verifies the LINE `idToken` via `verifyLineIdToken` **before** any domain logic runs. A rejected/expired token → 401 with a fixed `{ error: 'Unauthorized' }` body; the caught error itself is discarded (never logged or surfaced), so no detail leaks to the client. `acceptGuardianInvite` is never called on this path.
3. Calls `acceptGuardianInvite({ token, lineUserId, displayName, now })` using the verified identity. On failure, maps `result.reason` through the `statusByReason` table (`not_found`→404, `used`→409, `revoked`→409, `already_bound`→409, `expired`→410) and returns `{ reason }`.
4. On success, pushes `copy.guardianBoundNotice(identity.displayName)` to the hiker (`result.inviterLineUserId`) via `pushLineMessage`, keyed by `idempotencyKey: result.bindingId`. If the push throws, it's caught and logged via `console.error('Guardian bound notification failed', { bindingId, error })` — the response is still 200. Returns `{ inviterDisplayName: result.inviterDisplayName }`.

No changes to `src/features/line/guardian-invites.ts` (Task 2) or `src/features/i18n/copy.ts` (Task 3) — both consumed as-is, and their existing shapes matched the brief exactly (verified by reading each file before implementing).

## What I tested and the results

Used the brief's Step 1 test file verbatim: `tests/api/guardian-invites-accept.test.ts`, 5 cases:
- malformed body → 400, LINE never touched
- invalid idToken → 401, `acceptGuardianInvite` never called
- happy path → 200, correct body, `acceptGuardianInvite` called with verified identity, `pushLineMessage` called with hiker's `to`/`idempotencyKey`
- push failure → still 200 (this covers the "push failure must not fail the request" hard requirement called out in the task message)
- all 5 `reason` values → exact status codes from the table, and `pushLineMessage` never called on any failure path

### TDD evidence

**RED** — `npx vitest run tests/api/guardian-invites-accept.test.ts` (before creating the route):
```
FAIL  tests/api/guardian-invites-accept.test.ts [ tests/api/guardian-invites-accept.test.ts ]
Error: Failed to resolve import "@/app/api/guardian-invites/accept/route" from "tests/api/guardian-invites-accept.test.ts". Does the file exist?
 Test Files  1 failed (1)
      Tests  no tests
```
Expected failure: route module doesn't exist yet — matches brief's Step 2 expectation.

**GREEN** — `npx vitest run tests/api/guardian-invites-accept.test.ts` (after creating the route):
```
Test Files  1 passed (1)
      Tests  5 passed (5)
```

**Full suite** — `npx vitest run --exclude "**/.worktrees/**" --exclude "**/tests/integration/**"`:
```
Test Files  46 passed (46)
      Tests  263 passed (263)
```
Baseline was 45 files / 258 tests; delta is exactly +1 file / +5 tests, no regressions.

**Type check** — `npx tsc --noEmit 2>&1 | grep -E "guardian-invites/accept"` returned no matches: the new route and test file introduce zero new type errors. (Pre-existing 53 errors elsewhere are unrelated, per the task brief.)

## Files changed

- `app/api/guardian-invites/accept/route.ts` (new, 44 lines)
- `tests/api/guardian-invites-accept.test.ts` (new)

## Self-review findings

- `verifyLineIdToken` is called and its rejection mapped to 401 strictly before `acceptGuardianInvite` is invoked — confirmed both by code inspection (early `return` inside the `catch`) and by the test asserting `acceptGuardianInvite` was never called on the invalid-token path.
- All 5 `reason` values (`not_found`, `expired`, `used`, `revoked`, `already_bound`) map to the exact status codes specified in the brief — confirmed by the parametrized test looping over all 5 and asserting both status and body.
- A `pushLineMessage` rejection is caught and logged, and the handler still returns 200 — confirmed by a dedicated test.
- No raw caught-error detail reaches any client-facing response body: the 401 path's catch block doesn't bind or forward the error at all; the push-failure catch block logs to `console.error` server-side only and doesn't touch the response.

No concerns beyond what's listed above.

## Commit

```
be9ad1d feat: accept guardian invites and notify the hiker
```
2 files changed: `app/api/guardian-invites/accept/route.ts` (new), `tests/api/guardian-invites-accept.test.ts` (new).

## Issues or concerns

None. Implementation matches the brief's Step 3 code as given, since it already matched the actual interfaces from Task 2 (`guardian-invites.ts`), Task 3 (`copy.guardianBoundNotice`), `verifyLineIdToken`, and `pushLineMessage`/`LineMessage` type — no adaptation was needed.

Note: this report path (`.superpowers/sdd/task-5-report.md`) previously held content from an unrelated earlier plan on this repo (a "首頁改版" / home-redesign task, also numbered task 5). That content has been fully replaced with this report, which covers only the accept-guardian-invite work described in this task's brief and commit.
