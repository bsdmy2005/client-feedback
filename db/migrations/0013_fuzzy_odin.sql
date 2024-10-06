DO $$ BEGIN
 CREATE TYPE "public"."feedback_form_status" AS ENUM('pending', 'active', 'overdue', 'closed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- First, drop the default constraint on the status column
ALTER TABLE "feedback_forms" 
  ALTER COLUMN "status" DROP DEFAULT;

-- Convert existing status values to the new enum type
ALTER TABLE "feedback_forms" 
  ALTER COLUMN "status" TYPE feedback_form_status 
  USING (
    CASE
      WHEN status::text = 'pending' THEN 'pending'::feedback_form_status
      WHEN status::text = 'active' THEN 'active'::feedback_form_status
      WHEN status::text = 'overdue' THEN 'overdue'::feedback_form_status
      WHEN status::text = 'closed' THEN 'closed'::feedback_form_status
      ELSE 'pending'::feedback_form_status
    END
  );

-- Set the default value for the status column
ALTER TABLE "feedback_forms" 
  ALTER COLUMN "status" SET DEFAULT 'pending'::feedback_form_status;