CREATE TABLE IF NOT EXISTS "template_questions" (
	"template_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	CONSTRAINT "template_questions_template_id_question_id_pk" PRIMARY KEY("template_id","question_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "template_questions" ADD CONSTRAINT "template_questions_template_id_feedback_form_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."feedback_form_templates"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "template_questions" ADD CONSTRAINT "template_questions_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
