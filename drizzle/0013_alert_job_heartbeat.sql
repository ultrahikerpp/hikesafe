CREATE TABLE "job_heartbeats" (
	"job_name" text PRIMARY KEY NOT NULL,
	"last_started_at" timestamp with time zone,
	"last_succeeded_at" timestamp with time zone,
	"last_failed_at" timestamp with time zone,
	"last_error" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
