# HikeSafe LINE MVP

HikeSafe records an active hiking trip, accepts explicit GPS or text-only check-ins, and schedules LINE reminders at the planned finish time, +60 minutes, and +120 minutes. It is a leave-behind information tool, not navigation, background tracking, satellite communications, or an emergency dispatch service.

## Local setup

Use Node 24.x and copy `.env.example` to `.env.local`. `src/env.ts` defines nine variables — eight required and one optional:

- `DATABASE_URL`: PostgreSQL connection URL.
- `LINE_CHANNEL_ID` and `LINE_CHANNEL_SECRET`: LINE Login channel values.
- `LINE_CHANNEL_ACCESS_TOKEN`: Messaging API channel token.
- `SESSION_SECRET`, `JOB_SECRET`, and `GRANT_TOKEN_SECRET`: independently generated secrets of at least 32 characters.
- `NEXT_PUBLIC_LIFF_ID`: LIFF application ID.
- `NEXT_PUBLIC_LINE_OA_URL` (optional): LINE Official Account URL. When set, guardian invite acceptance shows an "add Official Account" button; the button is hidden when it is unset.

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
4. Set the eight required variables above in Vercel (plus optional `NEXT_PUBLIC_LINE_OA_URL`), apply migrations, then deploy.
5. Authorize the alert job at `GET /api/jobs/alerts` with `Authorization: Bearer <JOB_SECRET>` on a frequent schedule. Authorize `GET /api/jobs/retention` with the same header daily. The every-minute alerts schedule runs on Supabase pg_cron and is defined in `docs/supabase-cron-setup.sql` — re-apply that file after any database rebuild, since the schedule is not part of the migrations. Retention runs on Vercel Cron (`vercel.ts`).
6. Test LINE Login, a guardian binding, and a Messaging API push in the deployed environment before allowing real trips.

## Operational checks and limitations

- The route catalog now passes `npm run routes:verify` (`Catalog valid`, zero missing sources, zero duplicate slugs), so route selection is no longer gated on it. Two non-blocking coverage warnings remain: 96 of 100 small hundred peaks are catalogued (official designations 040, 041, 064, and 087 are still missing), and some required suburban routes are not yet present. Re-run `npm run routes:verify` after any catalog change and treat a non-zero exit (any error, including missing sources) as a hard block.
- Run alert processing after the planned finish time, +60 minutes, and +120 minutes. Verify the job receives its bearer secret, and investigate any delivery that reaches `manual_review` after the retry window.
- Run retention daily. It redacts precise GPS only after a finished trip is older than 90 days and has no unresolved alerts or deliveries.
- GPS is collected only during explicit start, check-in, and finish actions. A text-only check-in is marked as unavailable location, never as a current GPS fix.
- Offline check-ins remain pending until successfully sent. A pending entry is not a delivered safety confirmation.
- LINE delivery cannot be atomically committed with PostgreSQL. The worker persists a retry key and message before sending so LINE can deduplicate retries.
- HikeSafe does not infer a rescue need from missing updates and does not automatically contact 112 or 119.

## Verification scope

`tests/integration/full-trip-flow.test.ts` uses the existing repository abstractions and MSW to exercise the lifecycle, three alert stages, finish cancellation, and 91-day retention. `tests/integration/alert-race.test.ts` covers two workers racing a deputy finish and a LINE 500 followed by a successful retry. `tests/integration/postgres-alerts.test.ts` resets `BESAFE_TEST_DATABASE_URL` (or its local test default), reapplies migrations, and verifies PostgreSQL row locks, delivery claiming, cancellation ordering, and lease reclaim.

PostgreSQL integration is covered locally with a disposable test database. Real LINE Login, Messaging API, LIFF, webhook, and Vercel credential values remain blocked until the operator supplies them; no live LINE request or deployment has been attempted.
