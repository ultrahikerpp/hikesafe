# Task 7 Report: `/guardians` Guardian Management Page

## What I implemented

- `app/guardians/GuardiansContent.tsx` — client component (`'use client'`) implementing:
  - `LiffBootstrap` for LINE login (reused, not reimplemented).
  - A "my guardians" list (`GET /api/guardian-bindings`, filtered to bindings with `boundAt` and `sourceId`), each row with name, a `Chip` (group vs guardian), bound time (via `formatTime`), and a `revokeBinding` `Button` that calls `DELETE /api/guardian-bindings/{id}` and removes the row from local state on success (no page reload / refetch).
  - An "invite a guardian" flow: `inviteGuardian` button calls `POST /api/guardian-invites`; on success shows expiry text plus a `copyInviteLink` button (always rendered once an invite exists) and, only when `liff.isApiAvailable('shareTargetPicker')` resolves true, a `shareInviteToLine` button. 409 responses map to `copy.inviteLimitReached`; other failures map to `copy.inviteCreateError`.
  - A collapsed `<details>` "group binding (advanced)" section preserving the legacy binding-code flow (`POST /api/guardian-bindings` → code + instructions via `copy.bindingCodeInstructions`).
  - All user-visible text via `copy.xxx`; no new copy keys needed (all pre-existed from Task 3).
- `app/guardians/page.tsx` — thin server shell rendering `GuardiansContent`.
- `tests/features/guardians-page.test.tsx` — the 4 test cases from the brief, with one necessary addition (see below).

## Deviation from the brief (and why)

The brief's test code, run as-given, produced 3/4 failures: `TestingLibraryElementError: Found multiple elements with the role "button" and name ...`. Root cause: this repo's `vitest.config.ts` does not set `test.globals: true`, so React Testing Library's automatic `afterEach(cleanup)` (which depends on detecting a global `afterEach`) never registers, and each `it()`'s rendered DOM tree is never unmounted before the next `render()` call — DOM from prior tests in the same file accumulates. Every other component test file in this repo (`trip-actions.test.tsx`, `home.test.tsx`, `deep-links.test.tsx`, `quick-trip-form.test.tsx`) explicitly imports `cleanup` from `@testing-library/react` and calls `afterEach(cleanup)` for this exact reason.

Fix: added `import { cleanup, ... } from '@testing-library/react'`, `afterEach` to the vitest import, and `afterEach(cleanup);` in the `describe` block — matching the established convention in this codebase. This is the only change from the brief's literal test code; all `fireEvent`/`.textContent` usage was kept exactly as given (per the task's testing-convention note).

## TDD evidence

**RED** — `npx vitest run tests/features/guardians-page.test.tsx` (before creating `app/guardians/*`):
```
FAIL  tests/features/guardians-page.test.tsx [ tests/features/guardians-page.test.tsx ]
Error: Failed to resolve import "@/app/guardians/GuardiansContent" from "tests/features/guardians-page.test.tsx". Does the file exist?
 Test Files  1 failed (1)
      Tests  no tests
```
Expected: fails because `GuardiansContent` doesn't exist yet. Matches.

Intermediate RED (after implementation, before adding `cleanup`) — 3 of 4 tests failed with `Found multiple elements with the role "button" and name "邀請留守人\nInvite a guardian"` due to missing `afterEach(cleanup)` (see deviation above).

**GREEN** — `npx vitest run tests/features/guardians-page.test.tsx` (after implementation + `cleanup` fix):
```
 Test Files  1 passed (1)
      Tests  4 passed (4)
```

**Full suite** — `npx vitest run --exclude "**/.worktrees/**" --exclude "**/tests/integration/**"`:
```
 Test Files  47 passed (47)
      Tests  270 passed (270)
```
Baseline was 46 files / 266 tests; delta is exactly +1 file / +4 tests, no regressions.

**TypeScript** — `npx tsc --noEmit 2>&1 | grep -c "error TS"` → `53`, matching the documented pre-existing baseline exactly; `grep` for `guardians/` in the error output returned nothing (no new errors introduced).

## Files changed

- `app/guardians/GuardiansContent.tsx` (new)
- `app/guardians/page.tsx` (new)
- `tests/features/guardians-page.test.tsx` (new)

## Self-review findings

- Share-to-LINE button: renders only inside `{canShare && ...}`, and `canShare` is only set `true` after `liff.isApiAvailable('shareTargetPicker')` resolves truthy — confirmed by test 1 (`queryByRole('button', { name: copy.shareInviteToLine })` is null when `@line/liff` import throws in the jsdom test environment, i.e., "unavailable").
- Copy-link button: renders unconditionally once `invite` is set (no `canShare` gate) — confirmed by test 1 and 2.
- Revoke: updates `bindings` via `setBindings((current) => current.filter(...))`, no `refresh()` call and no `location.reload()` — confirmed by test 4 (`waitFor` the row disappearing, no additional GET call needed after the DELETE).
- All 4 new tests use `fireEvent` and `.textContent` (`status.textContent`, `alert.textContent`), not `userEvent`/`toHaveTextContent` — confirmed by re-reading the final test file; no `@testing-library/user-event` import added, no new dependency.
- Reused only existing shared components: `Card`, `Button`, `Chip`, `Notice`, `LiffBootstrap`, plus a plain `<details>`/`<summary>` (brief did not call for the `Expander` component here, and none of the existing pages use `Expander` for this exact collapsed-code-block pattern — kept as specified in the brief).
- No new CSS: `card-row` and `source-note` classes already exist in `app/globals.css`.
- Function sizes: largest function (`GuardiansContent` body) is under 50 lines per logical handler; file is 141 lines, well under the 800-line cap.

## Issues or concerns

None. One deviation from the brief's literal test code was necessary (documented above) to match established repo convention (`afterEach(cleanup)`); functionally identical otherwise.

## Note on this report file

This report file previously contained a report for a *different* "Task 7" from an earlier phase of this project (`DraftTrip 套用新元件` — restyling `DraftTrip.tsx` with shared components, commit `d5bbd15`). That work is unrelated to this task and already merged; this file has been overwritten with the current Task 7 (guardian management page) report per the task numbering in the active plan.

## Fix: review findings

The reviewer (`.superpowers/sdd/task-7-review.md`) flagged two Important-severity gaps. Both are fixed.

### Finding 1: share-available branch was completely untested

No test previously mocked `@line/liff` to make `isApiAvailable('shareTargetPicker')` resolve `true`; the only path exercised was the "unavailable" one, where the real `@line/liff` import throws in jsdom.

Fix (`tests/features/guardians-page.test.tsx`):
- Added a module-level `vi.mock('@line/liff', () => ({ default: { isApiAvailable: vi.fn(() => false), getProfile: vi.fn(...), shareTargetPicker: vi.fn(...) } }))`, plus `import liff from '@line/liff'` to access the mock in tests.
- `beforeEach` now resets `liff.isApiAvailable` to `() => false` (the default/"unavailable" case), so the existing "unavailable" test's assertions are unaffected — it now hits the mocked `false` return instead of the import throwing, but the observable behavior and assertions are identical.
- Added a new test, `'offers the share button when LINE sharing is available'`: overrides `vi.mocked(liff.isApiAvailable).mockReturnValue(true)`, creates an invite, and asserts `screen.findByRole('button', { name: copy.shareInviteToLine })` resolves (button renders). Does not simulate a click/share, per the finding's scope.

RED (assertion removed/mock override disabled, run in isolation via `-t "offers the share button"`):
```
FAIL tests/features/guardians-page.test.tsx > guardians page > offers the share button when LINE sharing is available
TestingLibraryElementError: Unable to find role="button" and name `copy.shareInviteToLine`
 Test Files  1 failed (1)
      Tests  1 failed | 5 skipped (6)
```
GREEN (override restored): `npx vitest run tests/features/guardians-page.test.tsx` → `Test Files 1 passed (1)`, `Tests 6 passed (6)`.

### Finding 2: initial guardian-list fetch silently swallowed all failures

`refresh()` returned early on `!response.ok` with no error surfaced, and `useEffect(() => { void refresh(); }, [refresh])` had no `.catch`, so a failed load rendered identically to "zero guardians bound" — misleading for a safety app.

Fix (`app/guardians/GuardiansContent.tsx`), mirroring `app/trips/new/TripForm.tsx`'s `refreshBindings` pattern:
- `refresh` now `throw new Error('Guardian bindings unavailable')` on `!response.ok` instead of silently returning.
- The mount `useEffect` now does `void refresh().catch(() => { setLoadFailed(true); setNotice({ tone: 'error', text: copy.authenticationError('讀取留守人清單', 'loading your guardian list') }); })`, reusing the existing `notice` state (no new UI mechanism) and `copy.authenticationError` (no new copy key, per constraints).
- Added a `loadFailed` boolean state so the "no guardians bound" message (`copy.noGuardianBindings`) only renders when the list is *confirmed* empty (`bindings.length === 0 && !loadFailed`), not when the load failed.

RED (`.superpowers/sdd` — ran new test against the pre-fix `GuardiansContent.tsx` via `git stash push -- app/guardians/GuardiansContent.tsx`):
```
FAIL tests/features/guardians-page.test.tsx > guardians page > shows an error notice instead of "no guardians" when the initial load fails
TestingLibraryElementError: Unable to find role="alert"
(rendered output shows copy.noGuardianBindings text instead)
 Test Files  1 failed (1)
      Tests  1 failed | 5 passed (6)
```
GREEN (fix restored): `npx vitest run tests/features/guardians-page.test.tsx` → `Test Files 1 passed (1)`, `Tests 6 passed (6)`.

### Full verification after both fixes

- `npx vitest run tests/features/guardians-page.test.tsx` → `Test Files 1 passed (1)`, `Tests 6 passed (6)` (4 original + 2 new).
- `npx vitest run --exclude "**/.worktrees/**" --exclude "**/tests/integration/**"` → `Test Files 47 passed (47)`, `Tests 272 passed (272)` (baseline 270 + 2 new, zero regressions).
- `npx tsc --noEmit 2>&1 | grep -c "error TS"` → `53`, matching the documented pre-existing baseline exactly; `grep` for `guardian` in the error output returned nothing (zero new errors).

### Files changed (this fix)

- `app/guardians/GuardiansContent.tsx` — `refresh` throws on failure; mount effect catches and sets an error `Notice`; added `loadFailed` state gating the empty-state message.
- `tests/features/guardians-page.test.tsx` — added `@line/liff` module mock + 2 new test cases (share-available branch, load-failure branch).
