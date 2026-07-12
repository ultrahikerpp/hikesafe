# Task 7 safety repair report

## 2026-07-13

- Alert events now distribute recipient deliveries once; each delivery owns its retry lease, retry key, attempts, and immutable first-send message template.
- `sending` is written while holding the trip lock before the LINE API call. Lifecycle commands cancel only pending or claimed deliveries, so they win before that point but never undo an already-started delivery.
- Direct-guardian viewer tokens are deterministic HMAC values of delivery ID and stable grant version. The database stores only their hashes; retries reconstruct the same token and payload.
- Viewer grants are bound to the authenticated guardian LINE user. Group/room deliveries do not receive a precise viewer link.
- The guardian viewer endpoint returns route, team, latest check-in/location accuracy, and a report summary after authenticated, grant-bound authorization.
- Verification: `npm test` (127 tests), `npm run build`, and Drizzle migration generation all passed.
- Limitation: provider acknowledgement and a remote provider-side delivery cannot be atomically committed with PostgreSQL. Reclaims therefore reuse the exact LINE retry key and persisted message content, allowing the provider to deduplicate and preserving auditable ordering around the local `sending` linearization point.

## 2026-07-13 follow-up

- The legacy viewer API now forwards the verified LINE user ID to grant authorization. Migration `0003` backfills only direct-user bindings and expires group, room, revoked, and otherwise unbound legacy grants; clients receive `REQUIRES_DIRECT_GUARDIAN_BINDING` and must bind an individual guardian again.
- Each delivery receives a `first_attempt_at` and a 23-hour-45-minute retry deadline. The deadline is a terminal `manual_review` state: no later worker calls LINE, and 120-minute viewer grants expire at the same deadline.
- No PostgreSQL integration environment is configured in this workspace, so migration data-backfill behavior has not been claimed as database-tested. The generated SQL is included for deployment review; unit/API tests cover its authorization and terminal-delivery contracts.
- Verification: focused viewer/delivery tests, `npm test` (132 tests), `npm run build`, and Drizzle migration generation passed.
