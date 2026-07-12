ALTER TYPE "public"."alert_delivery_status" ADD VALUE 'sending' BEFORE 'sent';--> statement-breakpoint
ALTER TABLE "alert_deliveries" ADD COLUMN "guardian_line_user_id" text;--> statement-breakpoint
ALTER TABLE "alert_deliveries" ADD COLUMN "viewer_grant_eligible" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "alert_deliveries" ADD COLUMN "grant_version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "alert_deliveries" ADD COLUMN "message" jsonb;--> statement-breakpoint
ALTER TABLE "viewer_grants" ADD COLUMN "delivery_id" uuid;--> statement-breakpoint
ALTER TABLE "viewer_grants" ADD COLUMN "token_version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "viewer_grants" ADD COLUMN "guardian_line_user_id" text;--> statement-breakpoint
ALTER TABLE "viewer_grants" ADD CONSTRAINT "viewer_grants_delivery_id_alert_deliveries_id_fk" FOREIGN KEY ("delivery_id") REFERENCES "public"."alert_deliveries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "viewer_grants_delivery_version_unique" ON "viewer_grants" USING btree ("delivery_id","token_version");