ALTER TYPE "public"."location_source" ADD VALUE IF NOT EXISTS 'line';
--> statement-breakpoint
ALTER TABLE "public"."check_ins" DROP CONSTRAINT "check_ins_location_consistency";
--> statement-breakpoint
ALTER TABLE "public"."check_ins" ADD CONSTRAINT "check_ins_location_consistency" CHECK (
  (
    "location_status" = 'available'
    AND "latitude" IS NOT NULL AND "longitude" IS NOT NULL
    AND "location_captured_at" IS NOT NULL
    AND (("location_source" IN ('gps', 'network') AND "accuracy_meters" IS NOT NULL)
      OR ("location_source" = 'line' AND "accuracy_meters" IS NULL))
  )
  OR (
    "location_status" IN ('unavailable', 'redacted')
    AND "latitude" IS NULL AND "longitude" IS NULL
    AND "accuracy_meters" IS NULL AND "location_captured_at" IS NULL
    AND "location_source" IS NULL
  )
);
