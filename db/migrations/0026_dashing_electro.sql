ALTER TABLE "adhoc_feedback" DROP CONSTRAINT "adhoc_feedback_user_id_profiles_user_id_fk";
--> statement-breakpoint
ALTER TABLE "adhoc_feedback" ALTER COLUMN "client_id" DROP NOT NULL;