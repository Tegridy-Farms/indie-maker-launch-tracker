DO $$ BEGIN
 CREATE TYPE "status_enum" AS ENUM('idea', 'in_progress', 'launched', 'shelved');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ideas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text DEFAULT 'default' NOT NULL,
	"title" varchar(120) NOT NULL,
	"description" text,
	"status" "status_enum" DEFAULT 'idea' NOT NULL,
	"tags" text[],
	"url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ideas_user_status" ON "ideas" ("user_id","status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ideas_user_created" ON "ideas" ("user_id","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ideas_user_updated" ON "ideas" ("user_id","updated_at");