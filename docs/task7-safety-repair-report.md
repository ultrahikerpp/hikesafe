# Task 7 safety repair report

## 2026-07-13

- Alert events now distribute recipient deliveries once; each delivery owns its retry lease, retry key, attempts, and immutable first-send message template.
- `sending` is written while holding the trip lock before the LINE API call. Lifecycle commands cancel only pending or claimed deliveries, so they win before that point but never undo an already-started delivery.
- Direct-guardian viewer tokens are deterministic HMAC values of delivery ID and stable grant version. The database stores only their hashes; retries reconstruct the same token and payload.
- Viewer grants are bound to the authenticated guardian LINE user. Group/room deliveries do not receive a precise viewer link.
- The guardian viewer endpoint returns route, team, latest check-in/location accuracy, and a report summary after authenticated, grant-bound authorization.
- Verification: `npm test` (127 tests), `npm run build`, and Drizzle migration generation all passed.
- Limitation: provider acknowledgement and a remote provider-side delivery cannot be atomically committed with PostgreSQL. Reclaims therefore reuse the exact LINE retry key and persisted message content, allowing the provider to deduplicate and preserving auditable ordering around the local `sending` linearization point.
