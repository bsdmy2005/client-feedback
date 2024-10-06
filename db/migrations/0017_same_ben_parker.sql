ALTER TABLE "user_feedback_forms" DROP CONSTRAINT "user_feedback_forms_template_id_feedback_forms_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_feedback_forms" ADD CONSTRAINT "user_feedback_forms_template_id_feedback_form_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."feedback_form_templates"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
