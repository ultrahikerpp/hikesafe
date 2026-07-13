# BeSafe LINE MVP

BeSafe records an active hiking trip, accepts explicit GPS or text-only check-ins, and schedules LINE reminders at the planned finish time, +60 minutes, and +120 minutes. It is a leave-behind information tool, not navigation, background tracking, satellite communications, or an emergency dispatch service.

## Local setup

Use Node 24.x and copy `.env.example` to `.env.local`. `src/env.ts` currently defines eight variables (the Task 9 brief says seven, but the source of truth contains eight):

- `DATABASE_URL`: PostgreSQL connection URL.
- `LINE_CHANNEL_ID` and `LINE_CHANNEL_SECRET`: LINE Login channel values.
- `LINE_CHANNEL_ACCESS_TOKEN`: Messaging API channel token.
- `SESSION_SECRET`, `JOB_SECRET`, and `GRANT_TOKEN_SECRET`: independently generated secrets of at least 32 characters.
- `NEXT_PUBLIC_LIFF_ID`: LIFF application ID.

Apply migrations before creating trips; `npm run db:migrate` is repeatable and records a checksum for each applied file. Import only a verified route catalog after `npm run routes:verify` succeeds.

```sh
npm run db:migrate
npm test
npm run build
npm run routes:verify
```

For a local development fixture, inject the repository dependencies used by the integration tests and pass an explicit test `idToken` through `handleLineAuth` dependencies. This is deliberately not a LINE credential bypass: the production route always verifies a real LINE ID token and returns 401 when verification fails.

## LINE and Vercel configuration

1. Create a LINE Login channel and set its LIFF endpoint to the deployed HTTPS application URL.
2. Create a Messaging API channel, issue its access token, and add the Official Account to every intended guardian group. Group or room delivery does not grant precise viewer access; bind an individual guardian for that.
3. Register the webhook URL as `https://<host>/api/line/webhook` and verify its signature with `LINE_CHANNEL_SECRET`.
4. Set the eight variables above in Vercel, apply migrations, then deploy.
5. Authorize the alert job at `GET /api/jobs/alerts` with `Authorization: Bearer <JOB_SECRET>` on a frequent schedule. Authorize `GET /api/jobs/retention` with the same header daily.
6. Test LINE Login, a guardian binding, and a Messaging API push in the deployed environment before allowing real trips.

## Operational checks and limitations

- The route catalog is **not production route-selection ready** until `npm run routes:verify` reports the required catalog with zero missing sources. At present this gate is blocked, so do not claim a formal catalog is usable or deploy route selection.
- Run alert processing after the planned finish time, +60 minutes, and +120 minutes. Verify the job receives its bearer secret, and investigate any delivery that reaches `manual_review` after the retry window.
- Run retention daily. It redacts precise GPS only after a finished trip is older than 90 days and has no unresolved alerts or deliveries.
- GPS is collected only during explicit start, check-in, and finish actions. A text-only check-in is marked as unavailable location, never as a current GPS fix.
- Offline check-ins remain pending until successfully sent. A pending entry is not a delivered safety confirmation.
- LINE delivery cannot be atomically committed with PostgreSQL. The worker persists a retry key and message before sending so LINE can deduplicate retries.
- BeSafe does not infer a rescue need from missing updates and does not automatically contact 112 or 119.

## Verification scope

`tests/integration/full-trip-flow.test.ts` uses the existing repository abstractions and MSW to exercise the lifecycle, three alert stages, finish cancellation, and 91-day retention. `tests/integration/alert-race.test.ts` covers two workers racing a deputy finish and a LINE 500 followed by a successful retry. `tests/integration/postgres-alerts.test.ts` resets `BESAFE_TEST_DATABASE_URL` (or its local test default), reapplies migrations, and verifies PostgreSQL row locks, delivery claiming, cancellation ordering, and lease reclaim.

PostgreSQL integration is covered locally with a disposable test database. Real LINE Login, Messaging API, LIFF, webhook, and Vercel credential values remain blocked until the operator supplies them; no live LINE request or deployment has been attempted.
