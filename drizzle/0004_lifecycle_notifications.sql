ALTER TYPE "public"."alert_stage" ADD VALUE IF NOT EXISTS 'started' BEFORE 'due';--> statement-breakpoint
ALTER TYPE "public"."alert_stage" ADD VALUE IF NOT EXISTS 'extended' BEFORE 'due';
