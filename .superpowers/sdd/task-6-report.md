# Task 6 report — trip lifecycle and offline check-ins

## Status

Implemented and verified with Node 24.

## Delivered

- Transactional `startTrip`, `recordCheckIn`, `extendTrip`, and `finishTrip`
  commands lock the trip, verify membership and role, reserve an idempotency
  key, apply the mutation, and persist its replay result in one transaction.
- Start, check-in, and finish accept only fresh GPS fixes. A text-only check-in
  or finish persists `locationStatus: 'unavailable'`; network fixes and stale
  fixes are rejected.
- Members can check in. Only leaders and deputies can extend or finish. Finish
  records the final location state and cancels every pending alert.
- Starting and extending create the due, +60-minute, and +120-minute stages.
  Extension atomically cancels the unsent schedule before creating the new
  three-stage schedule. The alert uniqueness invariant is partial so a
  cancelled stage can be replaced.
- Added authenticated start, check-in, extension, and finish routes.
- Added an IndexedDB queue with an injectable store for tests. Pending entries
  remain pending until a successful response, flush strictly FIFO, stop after a
  failure, retain failed work, and reuse the original idempotency key.
- Added the active-trip screen with elapsed/planned/check-in/GPS/queue status
  and the four required actions. Pending work is never rendered as delivered;
  the help action explicitly says that BeSafe does not automatically report.

## Verification

- RED: focused command, queue, API, and UI tests each initially failed because
  the corresponding modules/routes/components did not exist.
- `npm test -- tests/features/trip-commands.test.ts tests/features/offline-queue.test.ts tests/api/trip-lifecycle.test.ts`
  — 11 passed.
- `npm test` — 92 passed across 19 files.
- `npm run build` — passed.

## Catalog constraint

The formal route catalog remains blocked. This task neither imports nor exposes
fixtures as a production catalog and does not imply that route selection is
ready for production use.

## Reviewer P1 follow-up

- The active-trip server page now verifies the session before reading data and
  loads the active trip through a participant-scoped query. It passes the
  actual `startedAt`, `plannedFinishAt`, last persisted (therefore successfully
  sent) check-in, and server-derived GPS freshness into `TripActions`.
- Elapsed time is calculated from the same server `now` value and `startedAt`.
- Extension and finish now cancel every unsent alert (`pending` and `claimed`),
  so an old claimed stage no longer blocks its replacement.
- The Task 7 delivery contract requires a stable alert event ID, an immediate
  event-ID check for `pending` plus active trip status before delivery, and the
  same ID as the provider idempotency key.
- Added regression coverage for participant scoping, elapsed duration,
  start/check-in/extend idempotency, claimed-stage rescheduling, and the alert
  delivery contract.

### Follow-up verification

- Focused lifecycle/UI/contract tests: 17 passed.
- Full suite: 99 passed across 21 files.
- Production build: passed with Node 24.
