# Canonical Supabase bootstrap

Use the repository migration runner for every new or rebuilt HikeSafe database. Do not run `supabase-full-migration.sql`; that file is a historical 0000–0010 snapshot and is retained only for reference.

1. Configure `DATABASE_URL` for the empty Supabase PostgreSQL database.
2. From the repository root, run `npm run db:migrate`.
3. Verify that `__besafe_migrations` contains every file in `drizzle/`, including `0011_line_location_source.sql`, `0011_route_catalog_tiered_sources.sql`, `0012_guardian_invites.sql`, `0013_alert_job_heartbeat.sql`, `0014_session_revocations.sql`, and `0015_check_in_notifications.sql`.
4. Apply `docs/supabase-cron-setup.sql` in the Supabase SQL editor and verify the `hikesafe-alerts` job is active.

The migration runner records checksums and serializes concurrent runners with a PostgreSQL advisory lock. It is the same flow used by production deployment migrations.
