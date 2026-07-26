CREATE TABLE "session_revocations" (
	"session_id" text PRIMARY KEY NOT NULL,
	"revoked_at" timestamp with time zone DEFAULT now() NOT NULL
);
