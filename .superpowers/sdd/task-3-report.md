# Task 3 Report: Deterministic Quick Form State Rules

## TDD evidence

- RED: `npm test -- tests/features/quick-trip-form-state.test.ts` failed because `app/trips/new/quick-trip-form.ts` did not exist; Vitest reported the unresolved import before running tests.
- GREEN: the same focused command passed with 1 test file and 3 tests passing.

## Changed files

- `app/trips/new/quick-trip-form.ts`
  - Added `QuickRouteOption` and `QuickTripDefaultsResponse`.
  - Added pure helpers `currentStartValue`, `calculatePlannedFinish`, `isValidTripWindow`, and `canSubmitQuickTrip` with the exact brief behavior.
- `tests/features/quick-trip-form-state.test.ts`
  - Added the specified three state-rule tests.

`TripForm.tsx` was not modified.

## Tests

- `npm test -- tests/features/quick-trip-form-state.test.ts` — PASS, 1 file / 3 tests.
- `git diff --check` — PASS.

## Self-review

- Scope is limited to the two requested files; no unrelated working-tree files were changed.
- The helpers are deterministic and contain no I/O, framework state, or database access.
- Local date/time formatting preserves the `datetime-local` shape and uses the runtime's local timezone.
- Trip submission requires a route, at least one guardian binding, a non-blank vehicle, confirmation, and a strictly increasing valid time window.

## Concerns

- The PostgreSQL baseline at `127.0.0.1:55432` is unavailable. No database repair or integration setup changes were attempted; only the requested focused helper tests were run.
- `TripForm` integration is intentionally deferred to Task 4.
