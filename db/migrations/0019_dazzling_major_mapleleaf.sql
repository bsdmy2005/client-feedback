ALTER TABLE "form_answers" DROP CONSTRAINT "form_answers_form_id_feedback_forms_id_fk";
--> statement-breakpoint
ALTER TABLE "form_answers" ALTER COLUMN "form_id" DROP NOT NULL;--> statement-breakpoint

