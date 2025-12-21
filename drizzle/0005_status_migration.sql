-- Migration: Add status enum to daily_logs (with data migration)
-- This migration preserves existing data by converting is_completed to status

-- Step 1: Create the enum type
CREATE TYPE "daily_log_status" AS ENUM ('pending', 'inprogress', 'completed', 'failed', 'skipped');

-- Step 2: Add new columns
ALTER TABLE "daily_logs" ADD COLUMN "status" "daily_log_status";
ALTER TABLE "daily_logs" ADD COLUMN "status_updated_at" timestamp;

-- Step 3: Migrate existing data
UPDATE "daily_logs" 
SET "status" = CASE 
  WHEN "is_completed" = true THEN 'completed'::"daily_log_status"
  ELSE 'pending'::"daily_log_status"
END,
"status_updated_at" = "completed_at";

-- Step 4: Set NOT NULL and default after data migration
ALTER TABLE "daily_logs" ALTER COLUMN "status" SET NOT NULL;
ALTER TABLE "daily_logs" ALTER COLUMN "status" SET DEFAULT 'pending';

-- Step 5: Drop old columns
ALTER TABLE "daily_logs" DROP COLUMN "is_completed";
ALTER TABLE "daily_logs" DROP COLUMN "completed_at";
