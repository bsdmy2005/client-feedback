ALTER TABLE "adhoc_feedback" ADD COLUMN "conversation" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "adhoc_feedback" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "adhoc_feedback" DROP COLUMN IF EXISTS "feedback";