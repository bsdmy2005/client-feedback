
DO $$ BEGIN
 ALTER TABLE "feedback_form_templates" ADD CONSTRAINT "feedback_form_templates_client_id_clients_client_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("client_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
