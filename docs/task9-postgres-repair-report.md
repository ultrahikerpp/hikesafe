# Task 9 PostgreSQL repair report

Date: 2026-07-13

## Completed locally

- Added `npm run db:migrate`, a repeatable migration runner that stores a SHA-256 checksum for every applied SQL file.
- Added a PostgreSQL integration suite that resets a disposable schema and applies migrations `0000` through `0003` on every test run.
- Verified two independent PostgreSQL connections do not claim the same child delivery while one row is locked with `FOR UPDATE SKIP LOCKED`.
- Verified the trip lifecycle waits for the trip-row lock before it cancels pending delivery work, and verified expired `sending` leases are reclaimed without changing their retry key or persisted message.
- Corrected two clean-install migration failures: the composite guardian index now exists before its foreign key, and migration `0003` no longer aliases a table as PostgreSQL's reserved `grant` keyword.
- Replaced the home page's nonexistent `#start`, `#progress`, and `#finish` fragments with the working trip-creation route and an explanation of the prerequisite.

## Node 24 verification

- `npm test`: 34 files, 153 tests passed.
- `npm run db:migrate`: completed safely against an already-migrated disposable database.
- `npm run build`: passed.
- `npm run routes:verify`: catalog remains blocked at 0/100 hundred peaks and 0/30 suburban routes, with no missing sources. This was intentionally not changed.

## Remaining credential blocker

No live LINE Login, Messaging API, LIFF, webhook, or Vercel credential was supplied. No live LINE request or deployment was attempted.
