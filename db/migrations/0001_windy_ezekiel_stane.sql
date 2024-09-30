DO $$ BEGIN
 CREATE TYPE "public"."question_theme" AS ENUM('competition', 'environment', 'personal', 'bus_dev');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "question_theme" "question_theme" NOT NULL;--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "client_id" uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "questions" ADD CONSTRAINT "questions_client_id_clients_client_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("client_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
