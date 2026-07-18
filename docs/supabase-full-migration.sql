-- HikeSafe full database bootstrap for Supabase SQL Editor
-- Applies migrations 0000 through 0010 to an empty public schema.
-- Run this file only when the database has no HikeSafe tables.

CREATE TABLE IF NOT EXISTS public.__besafe_migrations (
  version text PRIMARY KEY,
  checksum text NOT NULL,
  applied_at timestamp with time zone NOT NULL DEFAULT now()
);

BEGIN;

CREATE TYPE public.alert_stage AS ENUM ('due', 'overdue_60', 'overdue_120');
CREATE TYPE public.alert_status AS ENUM ('pending', 'claimed', 'sent', 'cancelled');
CREATE TYPE public.line_source_type AS ENUM ('user', 'group', 'room');
CREATE TYPE public.location_source AS ENUM ('gps', 'network');
CREATE TYPE public.location_status AS ENUM ('available', 'unavailable', 'redacted');
CREATE TYPE public.trip_role AS ENUM ('leader', 'deputy', 'member');
CREATE TYPE public.trip_status AS ENUM ('draft', 'active', 'finished', 'cancelled');

CREATE TABLE public.alert_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  trip_id uuid NOT NULL,
  stage public.alert_stage NOT NULL,
  status public.alert_status DEFAULT 'pending' NOT NULL,
  due_at timestamp with time zone NOT NULL,
  next_attempt_at timestamp with time zone,
  claimed_at timestamp with time zone,
  claim_token text,
  claim_version integer DEFAULT 0 NOT NULL,
  claim_expires_at timestamp with time zone,
  sent_at timestamp with time zone,
  attempts integer DEFAULT 0 NOT NULL,
  last_error text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.check_ins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  trip_id uuid NOT NULL,
  user_id uuid NOT NULL,
  message text,
  location_status public.location_status NOT NULL,
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  accuracy_meters numeric(8, 2),
  location_captured_at timestamp with time zone,
  location_source public.location_source,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT check_ins_location_consistency CHECK (
    (location_status = 'available' AND latitude IS NOT NULL AND longitude IS NOT NULL
      AND accuracy_meters IS NOT NULL AND location_captured_at IS NOT NULL AND location_source IS NOT NULL)
    OR
    (location_status IN ('unavailable', 'redacted') AND latitude IS NULL AND longitude IS NULL
      AND accuracy_meters IS NULL AND location_captured_at IS NULL AND location_source IS NULL)
  )
);

CREATE TABLE public.guardians (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  trip_id uuid NOT NULL,
  line_binding_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.idempotency_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL,
  key text NOT NULL,
  request_hash text NOT NULL,
  response jsonb,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.line_bindings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL,
  source_type public.line_source_type,
  source_id text,
  display_name text,
  binding_code text,
  code_expires_at timestamp with time zone,
  bound_at timestamp with time zone,
  revoked_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT line_bindings_binding_code_unique UNIQUE (binding_code)
);

CREATE TABLE public.routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  slug text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT routes_slug_unique UNIQUE (slug)
);

CREATE TABLE public.route_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  route_id uuid NOT NULL,
  mountain_name text NOT NULL,
  route_name text NOT NULL,
  region text NOT NULL,
  kind text NOT NULL,
  start_latitude numeric(9, 6) NOT NULL,
  start_longitude numeric(9, 6) NOT NULL,
  distance_km numeric(7, 2) NOT NULL,
  elevation_gain_meters integer NOT NULL,
  duration_minutes integer NOT NULL,
  difficulty integer NOT NULL,
  checkpoints jsonb NOT NULL,
  evacuation_points jsonb NOT NULL,
  permit_notes text NOT NULL,
  source_organization text NOT NULL,
  source_url text NOT NULL,
  source_version text NOT NULL,
  reviewed_at timestamp with time zone NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  line_user_id text NOT NULL,
  display_name text NOT NULL,
  picture_url text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT users_line_user_id_unique UNIQUE (line_user_id)
);

CREATE TABLE public.trip_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  trip_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role public.trip_role NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  owner_user_id uuid NOT NULL,
  route_version_id uuid NOT NULL,
  status public.trip_status DEFAULT 'draft' NOT NULL,
  starts_at timestamp with time zone NOT NULL,
  planned_finish_at timestamp with time zone NOT NULL,
  started_at timestamp with time zone,
  finished_at timestamp with time zone,
  vehicle text DEFAULT '' NOT NULL,
  equipment jsonb DEFAULT '[]'::jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.viewer_grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  trip_id uuid NOT NULL,
  guardian_id uuid NOT NULL,
  token_hash text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT viewer_grants_token_hash_unique UNIQUE (token_hash)
);

ALTER TABLE public.alert_events ADD CONSTRAINT alert_events_trip_id_trips_id_fk
  FOREIGN KEY (trip_id) REFERENCES public.trips(id);
ALTER TABLE public.check_ins ADD CONSTRAINT check_ins_trip_id_trips_id_fk
  FOREIGN KEY (trip_id) REFERENCES public.trips(id);
ALTER TABLE public.check_ins ADD CONSTRAINT check_ins_user_id_users_id_fk
  FOREIGN KEY (user_id) REFERENCES public.users(id);
ALTER TABLE public.guardians ADD CONSTRAINT guardians_trip_id_trips_id_fk
  FOREIGN KEY (trip_id) REFERENCES public.trips(id);
ALTER TABLE public.guardians ADD CONSTRAINT guardians_line_binding_id_line_bindings_id_fk
  FOREIGN KEY (line_binding_id) REFERENCES public.line_bindings(id);
ALTER TABLE public.idempotency_keys ADD CONSTRAINT idempotency_keys_user_id_users_id_fk
  FOREIGN KEY (user_id) REFERENCES public.users(id);
ALTER TABLE public.line_bindings ADD CONSTRAINT line_bindings_user_id_users_id_fk
  FOREIGN KEY (user_id) REFERENCES public.users(id);
ALTER TABLE public.route_versions ADD CONSTRAINT route_versions_route_id_routes_id_fk
  FOREIGN KEY (route_id) REFERENCES public.routes(id);
ALTER TABLE public.trip_members ADD CONSTRAINT trip_members_trip_id_trips_id_fk
  FOREIGN KEY (trip_id) REFERENCES public.trips(id);
ALTER TABLE public.trip_members ADD CONSTRAINT trip_members_user_id_users_id_fk
  FOREIGN KEY (user_id) REFERENCES public.users(id);
ALTER TABLE public.trips ADD CONSTRAINT trips_owner_user_id_users_id_fk
  FOREIGN KEY (owner_user_id) REFERENCES public.users(id);
ALTER TABLE public.trips ADD CONSTRAINT trips_route_version_id_route_versions_id_fk
  FOREIGN KEY (route_version_id) REFERENCES public.route_versions(id);
ALTER TABLE public.viewer_grants ADD CONSTRAINT viewer_grants_trip_id_trips_id_fk
  FOREIGN KEY (trip_id) REFERENCES public.trips(id);

CREATE UNIQUE INDEX guardians_id_trip_unique ON public.guardians USING btree (id, trip_id);
ALTER TABLE public.viewer_grants ADD CONSTRAINT viewer_grants_guardian_trip_guardians_id_trip_fk
  FOREIGN KEY (guardian_id, trip_id) REFERENCES public.guardians(id, trip_id);
CREATE UNIQUE INDEX alert_events_active_trip_stage_unique ON public.alert_events
  USING btree (trip_id, stage) WHERE status IN ('pending', 'claimed');
CREATE INDEX alert_events_pending_due_idx ON public.alert_events
  USING btree (due_at) WHERE status = 'pending' AND next_attempt_at IS NULL;
CREATE INDEX alert_events_pending_next_attempt_idx ON public.alert_events
  USING btree (next_attempt_at) WHERE status = 'pending' AND next_attempt_at IS NOT NULL;
CREATE INDEX check_ins_last_available_location_idx ON public.check_ins
  USING btree (trip_id, created_at DESC NULLS LAST) WHERE location_status = 'available';
CREATE UNIQUE INDEX guardians_trip_line_binding_unique ON public.guardians
  USING btree (trip_id, line_binding_id);
CREATE UNIQUE INDEX idempotency_keys_user_key_unique ON public.idempotency_keys
  USING btree (user_id, key);
CREATE INDEX route_versions_route_source_version_idx ON public.route_versions
  USING btree (route_id, source_version);
CREATE UNIQUE INDEX route_versions_one_active_per_route ON public.route_versions
  USING btree (route_id) WHERE is_active = true;
CREATE INDEX route_versions_active_catalog_idx ON public.route_versions
  USING btree (region, kind, mountain_name, route_name) WHERE is_active = true;
CREATE UNIQUE INDEX trip_members_trip_user_unique ON public.trip_members
  USING btree (trip_id, user_id);
CREATE UNIQUE INDEX trip_members_one_leader_per_trip ON public.trip_members
  USING btree (trip_id) WHERE role = 'leader';
CREATE UNIQUE INDEX trip_members_one_deputy_per_trip ON public.trip_members
  USING btree (trip_id) WHERE role = 'deputy';
CREATE INDEX trips_retention_finished_at_idx ON public.trips
  USING btree (finished_at) WHERE status = 'finished';

INSERT INTO public.__besafe_migrations (version, checksum)
VALUES ('0000_initial.sql', 'ecb7d9cc54a9940cc49eb984bc6f102728175fd52afda59a97f59a8639f8cd78');
COMMIT;

BEGIN;

CREATE TYPE public.alert_delivery_status AS ENUM ('pending', 'claimed', 'sent', 'cancelled');
CREATE TABLE public.alert_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  event_id uuid NOT NULL,
  recipient_id text NOT NULL,
  guardian_id uuid,
  retry_key uuid DEFAULT gen_random_uuid() NOT NULL,
  status public.alert_delivery_status DEFAULT 'pending' NOT NULL,
  next_attempt_at timestamp with time zone,
  claimed_at timestamp with time zone,
  claim_token text,
  claim_version integer DEFAULT 0 NOT NULL,
  claim_expires_at timestamp with time zone,
  sent_at timestamp with time zone,
  attempts integer DEFAULT 0 NOT NULL,
  last_error text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT alert_deliveries_retry_key_unique UNIQUE (retry_key)
);
ALTER TABLE public.trips ADD COLUMN leader_phone text DEFAULT '' NOT NULL;
ALTER TABLE public.alert_deliveries ADD CONSTRAINT alert_deliveries_event_id_alert_events_id_fk
  FOREIGN KEY (event_id) REFERENCES public.alert_events(id);
ALTER TABLE public.alert_deliveries ADD CONSTRAINT alert_deliveries_guardian_id_guardians_id_fk
  FOREIGN KEY (guardian_id) REFERENCES public.guardians(id);
CREATE UNIQUE INDEX alert_deliveries_event_recipient_unique ON public.alert_deliveries
  USING btree (event_id, recipient_id);
CREATE INDEX alert_deliveries_pending_idx ON public.alert_deliveries
  USING btree (next_attempt_at) WHERE status = 'pending';

INSERT INTO public.__besafe_migrations (version, checksum)
VALUES ('0001_alert-deliveries.sql', 'd96500480e4f33c7b0cb89d955695921a2a74e71ee5efe10e283b52e8a0ee8af');
COMMIT;

BEGIN;

ALTER TYPE public.alert_delivery_status ADD VALUE 'sending' BEFORE 'sent';
ALTER TABLE public.alert_deliveries ADD COLUMN guardian_line_user_id text;
ALTER TABLE public.alert_deliveries ADD COLUMN viewer_grant_eligible boolean DEFAULT false NOT NULL;
ALTER TABLE public.alert_deliveries ADD COLUMN grant_version integer DEFAULT 1 NOT NULL;
ALTER TABLE public.alert_deliveries ADD COLUMN message jsonb;
ALTER TABLE public.viewer_grants ADD COLUMN delivery_id uuid;
ALTER TABLE public.viewer_grants ADD COLUMN token_version integer DEFAULT 1 NOT NULL;
ALTER TABLE public.viewer_grants ADD COLUMN guardian_line_user_id text;
ALTER TABLE public.viewer_grants ADD CONSTRAINT viewer_grants_delivery_id_alert_deliveries_id_fk
  FOREIGN KEY (delivery_id) REFERENCES public.alert_deliveries(id);
CREATE UNIQUE INDEX viewer_grants_delivery_version_unique ON public.viewer_grants
  USING btree (delivery_id, token_version);

INSERT INTO public.__besafe_migrations (version, checksum)
VALUES ('0002_cultured_mad_thinker.sql', '1a4d707cfaea9edb81b70e1c226a7fe4eb6ef668ddf955a6c2559234a9cddd04');
COMMIT;

BEGIN;

ALTER TYPE public.alert_delivery_status ADD VALUE 'manual_review' BEFORE 'sent';
ALTER TABLE public.alert_deliveries ADD COLUMN first_attempt_at timestamp with time zone;
ALTER TABLE public.alert_deliveries ADD COLUMN retry_deadline_at timestamp with time zone;
UPDATE public.viewer_grants AS viewer_grant
SET guardian_line_user_id = binding.source_id
FROM public.guardians AS guardian
INNER JOIN public.line_bindings AS binding ON binding.id = guardian.line_binding_id
WHERE viewer_grant.guardian_id = guardian.id
  AND viewer_grant.trip_id = guardian.trip_id
  AND binding.source_type = 'user'
  AND binding.source_id IS NOT NULL
  AND binding.revoked_at IS NULL;
UPDATE public.viewer_grants
SET expires_at = now()
WHERE guardian_line_user_id IS NULL
  AND expires_at > now();

INSERT INTO public.__besafe_migrations (version, checksum)
VALUES ('0003_nervous_umar.sql', '792a9a1d5ccaae2a1e400971b97fb546e2b20601425bd373252248f8c6b7780e');
COMMIT;

BEGIN;

ALTER TYPE public.alert_stage ADD VALUE IF NOT EXISTS 'started' BEFORE 'due';
ALTER TYPE public.alert_stage ADD VALUE IF NOT EXISTS 'extended' BEFORE 'due';

INSERT INTO public.__besafe_migrations (version, checksum)
VALUES ('0004_lifecycle_notifications.sql', '6da39b7366faece2ed8c5ecf44460a473610bba4175e5ec1e4471f7cc65023cb');
COMMIT;

BEGIN;

DROP INDEX public.alert_events_active_trip_stage_unique;
CREATE UNIQUE INDEX alert_events_active_trip_stage_unique ON public.alert_events
  USING btree (trip_id, stage)
  WHERE status IN ('pending', 'claimed') AND stage IN ('due', 'overdue_60', 'overdue_120');

INSERT INTO public.__besafe_migrations (version, checksum)
VALUES ('0005_alert_stage_index.sql', '17f9f679770986a09e52ff4dd87f5cd00e90b8c39e5619fbce485620e28a4906');
COMMIT;

BEGIN;

CREATE TABLE public.trip_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  trip_id uuid NOT NULL,
  token_hash text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  accepted_by_user_id uuid,
  accepted_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT trip_invites_token_hash_unique UNIQUE (token_hash)
);
ALTER TABLE public.trip_invites ADD CONSTRAINT trip_invites_trip_id_trips_id_fk
  FOREIGN KEY (trip_id) REFERENCES public.trips(id);
ALTER TABLE public.trip_invites ADD CONSTRAINT trip_invites_accepted_by_user_id_users_id_fk
  FOREIGN KEY (accepted_by_user_id) REFERENCES public.users(id);

INSERT INTO public.__besafe_migrations (version, checksum)
VALUES ('0006_trip_invites.sql', '47c9597f4dd7206dc365e98588c573d64bfd9a8f05f065c4f6f4e0d50dc9d64d');
COMMIT;

BEGIN;

ALTER TYPE public.alert_stage ADD VALUE IF NOT EXISTS 'help' BEFORE 'due';
ALTER TYPE public.alert_stage ADD VALUE IF NOT EXISTS 'finished' BEFORE 'due';
ALTER TABLE public.trips ADD COLUMN help_requested_at timestamp with time zone;

INSERT INTO public.__besafe_migrations (version, checksum)
VALUES ('0007_help_and_finish_notifications.sql', 'a42f72ff5b8ea7ee79092f20cc0fc3742fb12a73010314cc7969c66fcd700dd7');
COMMIT;

BEGIN;

ALTER TABLE public.route_versions
  ALTER COLUMN elevation_gain_meters DROP NOT NULL,
  ADD COLUMN elevation_difference_meters integer,
  ADD COLUMN designations jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD CONSTRAINT route_versions_elevation_difference_nonnegative
    CHECK (elevation_difference_meters IS NULL OR elevation_difference_meters >= 0);

INSERT INTO public.__besafe_migrations (version, checksum)
VALUES ('0008_route_catalog_designations.sql', '1d66124f4cc821cb38c7c1c1547be4d2275b925345f7c39e390d74ed136d142a');
COMMIT;

BEGIN;

ALTER TABLE public.route_versions
  ALTER COLUMN start_latitude DROP NOT NULL,
  ALTER COLUMN start_longitude DROP NOT NULL,
  ALTER COLUMN permit_notes DROP NOT NULL;

INSERT INTO public.__besafe_migrations (version, checksum)
VALUES ('0009_route_catalog_official_gaps.sql', 'f0d486189ad8bb3b10a55b2ef450bcc33c0508766b12da897b037430f2e79c25');
COMMIT;

BEGIN;

ALTER TABLE public.route_versions
  ADD COLUMN source_references jsonb NOT NULL DEFAULT '[]'::jsonb;

INSERT INTO public.__besafe_migrations (version, checksum)
VALUES ('0010_route_catalog_source_references.sql', '536024f9b5adb4571f505e7780fe523d88c7c0707f3f84b5afe2f17597f34e79');
COMMIT;

-- Verify that all migrations were recorded.
SELECT version, applied_at
FROM public.__besafe_migrations
ORDER BY version;
