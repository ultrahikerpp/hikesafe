CREATE TYPE "public"."alert_stage" AS ENUM('due', 'overdue_60', 'overdue_120');--> statement-breakpoint
CREATE TYPE "public"."alert_status" AS ENUM('pending', 'claimed', 'sent', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."line_source_type" AS ENUM('user', 'group', 'room');--> statement-breakpoint
CREATE TYPE "public"."location_source" AS ENUM('gps', 'network');--> statement-breakpoint
CREATE TYPE "public"."location_status" AS ENUM('available', 'unavailable', 'redacted');--> statement-breakpoint
CREATE TYPE "public"."trip_role" AS ENUM('leader', 'deputy', 'member');--> statement-breakpoint
CREATE TYPE "public"."trip_status" AS ENUM('draft', 'active', 'finished', 'cancelled');--> statement-breakpoint
CREATE TABLE "alert_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trip_id" uuid NOT NULL,
	"stage" "alert_stage" NOT NULL,
	"status" "alert_status" DEFAULT 'pending' NOT NULL,
	"due_at" timestamp with time zone NOT NULL,
	"next_attempt_at" timestamp with time zone,
	"claimed_at" timestamp with time zone,
	"sent_at" timestamp with time zone,
	"attempts" integer DEFAULT 0 NOT NULL,
	"last_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "check_ins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trip_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"message" text,
	"location_status" "location_status" NOT NULL,
	"latitude" numeric(9, 6),
	"longitude" numeric(9, 6),
	"accuracy_meters" numeric(8, 2),
	"location_captured_at" timestamp with time zone,
	"location_source" "location_source",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "check_ins_location_consistency" CHECK (("check_ins"."location_status" = 'available' and "check_ins"."latitude" is not null and "check_ins"."longitude" is not null and "check_ins"."accuracy_meters" is not null and "check_ins"."location_captured_at" is not null and "check_ins"."location_source" is not null) or ("check_ins"."location_status" in ('unavailable', 'redacted') and "check_ins"."latitude" is null and "check_ins"."longitude" is null and "check_ins"."accuracy_meters" is null and "check_ins"."location_captured_at" is null and "check_ins"."location_source" is null))
);
--> statement-breakpoint
CREATE TABLE "guardians" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trip_id" uuid NOT NULL,
	"line_binding_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "idempotency_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"key" text NOT NULL,
	"request_hash" text NOT NULL,
	"response" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "line_bindings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"source_type" "line_source_type",
	"source_id" text,
	"display_name" text,
	"binding_code" text,
	"code_expires_at" timestamp with time zone,
	"bound_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "line_bindings_binding_code_unique" UNIQUE("binding_code")
);
--> statement-breakpoint
CREATE TABLE "route_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"route_id" uuid NOT NULL,
	"mountain_name" text NOT NULL,
	"route_name" text NOT NULL,
	"region" text NOT NULL,
	"kind" text NOT NULL,
	"start_latitude" numeric(9, 6) NOT NULL,
	"start_longitude" numeric(9, 6) NOT NULL,
	"distance_km" numeric(7, 2) NOT NULL,
	"elevation_gain_meters" integer NOT NULL,
	"duration_minutes" integer NOT NULL,
	"difficulty" integer NOT NULL,
	"checkpoints" jsonb NOT NULL,
	"evacuation_points" jsonb NOT NULL,
	"permit_notes" text NOT NULL,
	"source_organization" text NOT NULL,
	"source_url" text NOT NULL,
	"source_version" text NOT NULL,
	"reviewed_at" timestamp with time zone NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "routes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "routes_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "trip_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trip_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "trip_role" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trips" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_user_id" uuid NOT NULL,
	"route_version_id" uuid NOT NULL,
	"status" "trip_status" DEFAULT 'draft' NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"planned_finish_at" timestamp with time zone NOT NULL,
	"started_at" timestamp with time zone,
	"finished_at" timestamp with time zone,
	"vehicle" text DEFAULT '' NOT NULL,
	"equipment" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"line_user_id" text NOT NULL,
	"display_name" text NOT NULL,
	"picture_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_line_user_id_unique" UNIQUE("line_user_id")
);
--> statement-breakpoint
CREATE TABLE "viewer_grants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trip_id" uuid NOT NULL,
	"guardian_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "viewer_grants_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
ALTER TABLE "alert_events" ADD CONSTRAINT "alert_events_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guardians" ADD CONSTRAINT "guardians_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guardians" ADD CONSTRAINT "guardians_line_binding_id_line_bindings_id_fk" FOREIGN KEY ("line_binding_id") REFERENCES "public"."line_bindings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "idempotency_keys" ADD CONSTRAINT "idempotency_keys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "line_bindings" ADD CONSTRAINT "line_bindings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "route_versions" ADD CONSTRAINT "route_versions_route_id_routes_id_fk" FOREIGN KEY ("route_id") REFERENCES "public"."routes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_members" ADD CONSTRAINT "trip_members_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_members" ADD CONSTRAINT "trip_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trips" ADD CONSTRAINT "trips_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trips" ADD CONSTRAINT "trips_route_version_id_route_versions_id_fk" FOREIGN KEY ("route_version_id") REFERENCES "public"."route_versions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "viewer_grants" ADD CONSTRAINT "viewer_grants_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "viewer_grants" ADD CONSTRAINT "viewer_grants_guardian_trip_guardians_id_trip_fk" FOREIGN KEY ("guardian_id","trip_id") REFERENCES "public"."guardians"("id","trip_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "alert_events_active_trip_stage_unique" ON "alert_events" USING btree ("trip_id","stage") WHERE "alert_events"."status" in ('pending', 'claimed');--> statement-breakpoint
CREATE INDEX "alert_events_pending_due_idx" ON "alert_events" USING btree ("due_at") WHERE "alert_events"."status" = 'pending' and "alert_events"."next_attempt_at" is null;--> statement-breakpoint
CREATE INDEX "alert_events_pending_next_attempt_idx" ON "alert_events" USING btree ("next_attempt_at") WHERE "alert_events"."status" = 'pending' and "alert_events"."next_attempt_at" is not null;--> statement-breakpoint
CREATE INDEX "check_ins_last_available_location_idx" ON "check_ins" USING btree ("trip_id","created_at" DESC NULLS LAST) WHERE "check_ins"."location_status" = 'available';--> statement-breakpoint
CREATE UNIQUE INDEX "guardians_id_trip_unique" ON "guardians" USING btree ("id","trip_id");--> statement-breakpoint
CREATE UNIQUE INDEX "guardians_trip_line_binding_unique" ON "guardians" USING btree ("trip_id","line_binding_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idempotency_keys_user_key_unique" ON "idempotency_keys" USING btree ("user_id","key");--> statement-breakpoint
CREATE INDEX "route_versions_route_source_version_idx" ON "route_versions" USING btree ("route_id","source_version");--> statement-breakpoint
CREATE UNIQUE INDEX "route_versions_one_active_per_route" ON "route_versions" USING btree ("route_id") WHERE "route_versions"."is_active" = true;--> statement-breakpoint
CREATE INDEX "route_versions_active_catalog_idx" ON "route_versions" USING btree ("region","kind","mountain_name","route_name") WHERE "route_versions"."is_active" = true;--> statement-breakpoint
CREATE UNIQUE INDEX "trip_members_trip_user_unique" ON "trip_members" USING btree ("trip_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "trip_members_one_leader_per_trip" ON "trip_members" USING btree ("trip_id") WHERE "trip_members"."role" = 'leader';--> statement-breakpoint
CREATE UNIQUE INDEX "trip_members_one_deputy_per_trip" ON "trip_members" USING btree ("trip_id") WHERE "trip_members"."role" = 'deputy';--> statement-breakpoint
CREATE INDEX "trips_retention_finished_at_idx" ON "trips" USING btree ("finished_at") WHERE "trips"."status" = 'finished';
