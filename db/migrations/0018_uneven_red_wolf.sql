ALTER TABLE "form_answers" ADD COLUMN "form_user_id" uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "form_answers" ADD CONSTRAINT "form_answers_form_user_id_user_feedback_forms_id_fk" FOREIGN KEY ("form_user_id") REFERENCES "public"."user_feedback_forms"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
