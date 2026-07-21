# Task 6 Report: 撤銷綁定 API

Note: this file previously held stale content left over from an unrelated
earlier task (a `TripActions.tsx` dialog-to-expander rewrite) that had
occupied this filename under a different task-numbering scheme. Replaced
below with the report for the actual Task 6 assigned this session:
`DELETE /api/guardian-bindings/[id]`.

## What I implemented

`app/api/guardian-bindings/[id]/route.ts` — a `DELETE` handler that lets an
authenticated hiker revoke one of their own `line_bindings` rows.

- Requires a valid session cookie (`besafe_session`); returns 401 if missing
  or invalid (`verifySession` throws).
- Looks up the `id` route param and issues a single `UPDATE ... WHERE id = ?
  AND userId = ? AND revokedAt IS NULL` that sets `revokedAt` to `new Date()`,
  scoped by both `id` and the session's `userId` in the same `where()` clause
  (via `and(...)`) — never a separate ownership check after an id-only fetch.
- If `returning()` comes back empty (row doesn't exist, isn't owned by this
  user, or was already revoked), responds `404 { error: 'Binding not found' }`
  — identical body/status regardless of which of those three reasons applied.
- On success, responds `204` with no body.
- Never deletes the row — soft-delete only, via the `revokedAt` timestamp.

This is the third copy of the inline `sessionToken(request)` cookie-parsing
helper (previously in `app/api/guardian-bindings/route.ts` and
`app/api/guardian-invites/route.ts`). Per the task brief, I did not extract a
shared helper — followed the brief's inline version as instructed.

## What I tested and the results

Extended the existing shared test file `tests/api/guardian-bindings.test.ts`
per the brief:
- Replaced the top-of-file mock block to add `update`/`set`/`where`/
  `returning` mocks for `db.update(...)`, alongside the existing `select`
  mock chain (which is untouched).
- Added `import { DELETE } from '@/app/api/guardian-bindings/[id]/route';`.
- Added a new `describe('DELETE /api/guardian-bindings/[id]', ...)` block
  with 3 tests:
  1. No session → 401, `update` never called.
  2. Owner's binding → 204, `set` called with `{ revokedAt: expect.any(Date) }`.
  3. Someone else's binding (mocked via `returning` resolving to `[]`) → 404.

The 2 pre-existing tests in the file (`GET`/`POST` on
`/api/guardian-bindings`) were not modified in body — only the shared mock
block above them gained an `update` mock alongside `select`.

## TDD evidence

**RED** — `npx vitest run tests/api/guardian-bindings.test.ts` (before
creating the route file):

```
FAIL  tests/api/guardian-bindings.test.ts [ tests/api/guardian-bindings.test.ts ]
Error: Failed to resolve import "@/app/api/guardian-bindings/[id]/route" from
"tests/api/guardian-bindings.test.ts". Does the file exist?
...
 Test Files  1 failed | 1 passed (2)
      Tests  2 passed (2)
```

Failed exactly as expected — the route module didn't exist yet, so the test
file failed to even load (its own 5 tests never ran; the other passing file
in that run was an unrelated suite).

**GREEN** — after creating `app/api/guardian-bindings/[id]/route.ts`, same
command:

```
✓ tests/api/guardian-bindings.test.ts > guardian bindings API > rejects an unauthenticated listing and binding-code creation request
✓ tests/api/guardian-bindings.test.ts > guardian bindings API > creates a code and lists only the authenticated owner binding scope
✓ tests/api/guardian-bindings.test.ts > DELETE /api/guardian-bindings/[id] > rejects revocation without a session
✓ tests/api/guardian-bindings.test.ts > DELETE /api/guardian-bindings/[id] > revokes the binding owned by the authenticated hiker
✓ tests/api/guardian-bindings.test.ts > DELETE /api/guardian-bindings/[id] > hides bindings that belong to somebody else behind a 404

 Test Files  2 passed (2)
      Tests  7 passed (7)
```

(The "2 files / 7 tests" total includes a stale, pre-existing duplicate at
`.worktrees/quick-trip-creation/tests/api/guardian-bindings.test.ts` — an
existing worktree in this repo, not something this task touched. Verified
via `--reporter=verbose` that my target file
(`tests/api/guardian-bindings.test.ts`) alone has exactly 5 passing tests: 2
pre-existing + 3 new — matching the brief's expectation exactly.)

**Full suite** —
`npx vitest run --exclude "**/.worktrees/**" --exclude "**/tests/integration/**"`:

```
 Test Files  46 passed (46)
      Tests  266 passed (266)
```

Matches the expected 46 files / 266 tests (263 baseline + 3 new), all
passing.

**Type check** — `npx tsc --noEmit` still reports 53 errors (same
pre-existing baseline count on this branch), none in `guardian-bindings`
files. Confirmed via `grep -c "error TS"` (53) and `grep "guardian-bindings"`
(no matches).

## Files changed

- `app/api/guardian-bindings/[id]/route.ts` (new, 30 lines)
- `tests/api/guardian-bindings.test.ts` (modified: mock block + new describe
  block, 92 lines total)

## Self-review findings

- **WHERE scoping**: confirmed the `update(...).where(and(eq(id), eq(userId),
  isNull(revokedAt)))` call scopes by `id` AND `userId` in one query — no
  separate ownership check after an id-only fetch.
- **404 response identity**: confirmed "doesn't exist", "exists but belongs
  to someone else", and "already revoked" all fall through the same
  `revoked.length === 0` branch, returning the exact same
  `{ error: 'Binding not found' }` / 404 — indistinguishable from outside.
- **Pre-existing tests**: confirmed the 2 original tests in the file still
  pass, and their bodies were not edited — only the shared mock scaffolding
  above them was extended.
- **Soft-delete**: confirmed `db.update(...).set({ revokedAt: new Date() })`
  — no `db.delete(...)` anywhere in this route.

No concerns found.

## Issues or concerns

None. Implementation follows the brief exactly (no deviations), a known and
pre-approved third copy of the `sessionToken` helper was added per explicit
instruction (not extracted), and all verification commands ran clean.

## Commit

- `f4d1f6d` — `feat: allow hikers to revoke a guardian binding`
- Staged only `app/api/guardian-bindings/[id]/route.ts` and
  `tests/api/guardian-bindings.test.ts` (2 files changed, 83 insertions, 1
  deletion).
