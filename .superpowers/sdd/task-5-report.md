# Task 5 report — trip creation, authorization, and viewer grants

## Status

Implemented and verified with Node 24.18.0.

## Delivered

- Transactional `createTrip` validates active route versions, finish-after-start,
  unique members, a session-owner leader, a deputy for multi-person trips, and
  active owner-bound guardian bindings.
- Idempotency uses a stable SHA-256 request hash. A mismatched reused key is
  rejected; an identical retry returns the original trip ID without recreating
  data or persisting plaintext viewer tokens.
- Each guardian receives a freshly generated 32-byte token. Only its SHA-256
  hash is stored; plaintext is returned by the service solely for notification
  composition and is omitted from the API response.
- `POST /api/trips` validates the session and assigns that session user as the
  leader instead of trusting a client-provided leader ID.
- Added member/viewer-grant authorization helper and a mobile-width three-step
  trip form.

## Verification

- RED: focused tests initially failed because the Task 5 service/API modules
  did not exist.
- `npm test -- tests/features/trip-service.test.ts tests/api/create-trip.test.ts`
  — 11 passed.
- `npm test` — 69 passed across 13 files.
- `npm run build` — passed.

## Known constraint

The formal route catalog remains blocked by its safety gate. The form reads
only currently active database route versions and explicitly reports an empty
catalog as unavailable; it does not substitute fixtures or claim production
route selection is ready.
