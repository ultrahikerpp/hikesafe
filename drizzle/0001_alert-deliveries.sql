CREATE TYPE "public"."alert_delivery_status" AS ENUM('pending', 'claimed', 'sent', 'cancelled');--> statement-breakpoint
CREATE TABLE "alert_deliveries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"recipient_id" text NOT NULL,
	"guardian_id" uuid,
	"retry_key" uuid DEFAULT gen_random_uuid() NOT NULL,
	"status" "alert_delivery_status" DEFAULT 'pending' NOT NULL,
	"next_attempt_at" timestamp with time zone,
	"claimed_at" timestamp with time zone,
	"claim_token" text,
	"claim_version" integer DEFAULT 0 NOT NULL,
	"claim_expires_at" timestamp with time zone,
	"sent_at" timestamp with time zone,
	"attempts" integer DEFAULT 0 NOT NULL,
	"last_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "alert_deliveries_retry_key_unique" UNIQUE("retry_key")
);
--> statement-breakpoint
ALTER TABLE "trips" ADD COLUMN "leader_phone" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "alert_deliveries" ADD CONSTRAINT "alert_deliveries_event_id_alert_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."alert_events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alert_deliveries" ADD CONSTRAINT "alert_deliveries_guardian_id_guardians_id_fk" FOREIGN KEY ("guardian_id") REFERENCES "public"."guardians"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "alert_deliveries_event_recipient_unique" ON "alert_deliveries" USING btree ("event_id","recipient_id");--> statement-breakpoint
CREATE INDEX "alert_deliveries_pending_idx" ON "alert_deliveries" USING btree ("next_attempt_at") WHERE "alert_deliveries"."status" = 'pending';