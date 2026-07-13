ALTER TYPE "public"."alert_delivery_status" ADD VALUE 'manual_review' BEFORE 'sent';--> statement-breakpoint
ALTER TABLE "alert_deliveries" ADD COLUMN "first_attempt_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "alert_deliveries" ADD COLUMN "retry_deadline_at" timestamp with time zone;--> statement-breakpoint
UPDATE "viewer_grants" AS viewer_grant
SET "guardian_line_user_id" = binding."source_id"
FROM "guardians" AS guardian
INNER JOIN "line_bindings" AS binding ON binding."id" = guardian."line_binding_id"
WHERE viewer_grant."guardian_id" = guardian."id"
  AND viewer_grant."trip_id" = guardian."trip_id"
  AND binding."source_type" = 'user'
  AND binding."source_id" IS NOT NULL
  AND binding."revoked_at" IS NULL;--> statement-breakpoint
UPDATE "viewer_grants"
SET "expires_at" = now()
WHERE "guardian_line_user_id" IS NULL
  AND "expires_at" > now();
