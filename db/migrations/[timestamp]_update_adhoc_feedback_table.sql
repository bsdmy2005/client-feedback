ALTER TABLE "adhoc_feedback" 
DROP COLUMN "feedback",
ADD COLUMN "conversation" jsonb NOT NULL,
ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;
