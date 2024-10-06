ALTER TABLE "form_answers" DROP CONSTRAINT "form_answers_form_user_id_user_feedback_forms_id_fk";
--> statement-breakpoint
ALTER TABLE "form_answers" DROP CONSTRAINT "form_answers_user_id_profiles_user_id_fk";
--> statement-breakpoint
ALTER TABLE "form_answers" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "form_answers" ALTER COLUMN "submitted_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "form_answers" ADD COLUMN "formuserId" uuid ;--> statement-breakpoint
ALTER TABLE "form_answers" DROP COLUMN IF EXISTS "form_user_id";