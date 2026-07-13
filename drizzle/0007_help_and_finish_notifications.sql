ALTER TYPE "public"."alert_stage" ADD VALUE IF NOT EXISTS 'help' BEFORE 'due';--> statement-breakpoint
ALTER TYPE "public"."alert_stage" ADD VALUE IF NOT EXISTS 'finished' BEFORE 'due';--> statement-breakpoint
ALTER TABLE "trips" ADD COLUMN "help_requested_at" timestamp with time zone;
