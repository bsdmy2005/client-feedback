ALTER TABLE "feedback_form_templates" DROP CONSTRAINT "feedback_form_templates_client_id_clients_client_id_fk";
--> statement-breakpoint
ALTER TABLE "feedback_form_templates" ALTER COLUMN "start_date" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "membership" SET DEFAULT 'free';--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "role" SET DEFAULT 'user';--> statement-breakpoint
ALTER TABLE "feedback_form_templates" ADD COLUMN "question_ids" text[];--> statement-breakpoint
UPDATE "feedback_form_templates" SET "question_ids" = '{}' WHERE "question_ids" IS NULL;--> statement-breakpoint
ALTER TABLE "feedback_form_templates" ALTER COLUMN "question_ids" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "last_payment_amount" numeric;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "last_payment_date" timestamp;--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN IF EXISTS "stripe_customer_id";--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN IF EXISTS "stripe_subscription_id";