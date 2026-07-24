-- HikeSafe — Supabase pg_cron setup for the alerts heartbeat.
--
-- WHY THIS FILE EXISTS
--   The alerts job (GET /api/jobs/alerts) must run every minute so overdue
--   LINE notifications reach guardians on time. Vercel Hobby cron only fires
--   once a day, so this schedule lives in Supabase via pg_cron + pg_net.
--   That schedule is stored ONLY in Supabase's `cron.job` table — it is NOT
--   part of the Drizzle migrations, so rebuilding the database does NOT bring
--   it back, and losing it silently stops every guardian alert. This file is
--   the version-controlled source of truth. Re-apply it whenever the database
--   is rebuilt, the deploy host changes, or JOB_SECRET is rotated.
--
--   (Retention runs daily on Vercel Cron, defined in the tracked `vercel.ts`,
--   so it is already version-controlled and is intentionally NOT here.)
--
-- WHY NOT A DRIZZLE MIGRATION
--   Migrations replay against local/preview databases too, which have no
--   pg_cron and no Vault, and the migrate role may lack rights on the `cron`
--   schema. This is an environment-specific, apply-by-hand step — same
--   convention as the other docs/*.sql files.
--
-- SECURITY
--   No secrets in this file. The base URL and JOB_SECRET are read from
--   Supabase Vault at cron runtime, so the committed SQL and the stored job
--   command stay free of plaintext credentials.
--
-- HOW TO APPLY  (Supabase SQL editor)
--   1. Seed the two Vault secrets once per database (replace placeholders):
--        select vault.create_secret('https://<your-app-host>', 'hikesafe_base_url');
--        select vault.create_secret('<JOB_SECRET>',            'hikesafe_job_secret');
--      To rotate later, use vault.update_secret(id, new_value) — look up the
--      id with:  select id, name from vault.secrets where name like 'hikesafe_%';
--   2. Run the rest of this file to (re)create the schedule. Safe to re-run.
--
-- VERIFY
--   select jobname, schedule, active from cron.job where jobname = 'hikesafe-alerts';
--   select status, return_message, start_time
--     from cron.job_run_details
--    where jobid = (select jobid from cron.job where jobname = 'hikesafe-alerts')
--    order by start_time desc limit 5;

-- Extensions (Supabase provides these; enabling is idempotent).
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Drop any prior instance so a rename or duplicate can't linger. Guarded so it
-- is a no-op on a fresh database where the job does not exist yet.
select cron.unschedule('hikesafe-alerts')
where exists (select 1 from cron.job where jobname = 'hikesafe-alerts');

-- Every minute: call the alerts endpoint with the Bearer token, both pulled
-- from Vault at runtime. cron.schedule upserts by jobname, so re-running this
-- replaces the schedule in place rather than creating a second job.
select cron.schedule(
  'hikesafe-alerts',
  '* * * * *',
  $job$
    select net.http_get(
      url := (
        select decrypted_secret from vault.decrypted_secrets
        where name = 'hikesafe_base_url'
      ) || '/api/jobs/alerts',
      headers := jsonb_build_object(
        'Authorization',
        'Bearer ' || (
          select decrypted_secret from vault.decrypted_secrets
          where name = 'hikesafe_job_secret'
        )
      )
    );
  $job$
);
