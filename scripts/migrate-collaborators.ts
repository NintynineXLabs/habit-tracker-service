import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!);

async function migrate() {
  try {
    // Create enum types for session_collaborators
    await sql`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'collaborator_status') THEN
          CREATE TYPE "public"."collaborator_status" AS ENUM('invited', 'accepted', 'rejected');
        END IF;
      END $$;
    `;
    console.log('✓ Created collaborator_status enum');

    await sql`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'collaborator_role') THEN
          CREATE TYPE "public"."collaborator_role" AS ENUM('owner', 'member');
        END IF;
      END $$;
    `;
    console.log('✓ Created collaborator_role enum');

    // Create enum types for session_items
    await sql`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'session_item_type') THEN
          CREATE TYPE "public"."session_item_type" AS ENUM('task', 'timer');
        END IF;
      END $$;
    `;
    console.log('✓ Created session_item_type enum');

    await sql`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'goal_type') THEN
          CREATE TYPE "public"."goal_type" AS ENUM('individu', 'collaborative');
        END IF;
      END $$;
    `;
    console.log('✓ Created goal_type enum');

    // Create enum for daily_log_status
    await sql`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'daily_log_status') THEN
          CREATE TYPE "public"."daily_log_status" AS ENUM('pending', 'inprogress', 'completed', 'failed', 'skipped');
        END IF;
      END $$;
    `;
    console.log('✓ Created daily_log_status enum');

    // Add new columns to session_collaborators if they don't exist
    await sql`
      ALTER TABLE "session_collaborators" 
      ADD COLUMN IF NOT EXISTS "status" "collaborator_status" DEFAULT 'invited' NOT NULL
    `;
    console.log('✓ Added session_collaborators.status column');

    await sql`
      ALTER TABLE "session_collaborators" 
      ADD COLUMN IF NOT EXISTS "email" text DEFAULT '' NOT NULL
    `;
    console.log('✓ Added session_collaborators.email column');

    await sql`
      ALTER TABLE "session_collaborators" 
      ADD COLUMN IF NOT EXISTS "role" "collaborator_role" DEFAULT 'member' NOT NULL
    `;
    console.log('✓ Added session_collaborators.role column');

    await sql`
      ALTER TABLE "session_collaborators" 
      ADD COLUMN IF NOT EXISTS "invited_at" timestamp DEFAULT now()
    `;
    console.log('✓ Added session_collaborators.invited_at column');

    await sql`
      ALTER TABLE "session_collaborators" 
      ADD COLUMN IF NOT EXISTS "joined_at" timestamp
    `;
    console.log('✓ Added session_collaborators.joined_at column');

    // Migrate session_items.type from text to enum
    await sql`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'session_items' AND column_name = 'type' AND data_type = 'text'
        ) THEN
          -- Add temporary column
          ALTER TABLE "session_items" ADD COLUMN IF NOT EXISTS "type_new" "session_item_type" DEFAULT 'task';
          
          -- Copy data, mapping old values to new enum
          UPDATE "session_items" SET "type_new" = 
            CASE 
              WHEN "type" = 'timer' THEN 'timer'::"session_item_type"
              ELSE 'task'::"session_item_type"
            END;
          
          -- Drop old column and rename new one
          ALTER TABLE "session_items" DROP COLUMN "type";
          ALTER TABLE "session_items" RENAME COLUMN "type_new" TO "type";
          ALTER TABLE "session_items" ALTER COLUMN "type" SET NOT NULL;
          ALTER TABLE "session_items" ALTER COLUMN "type" SET DEFAULT 'task';
        END IF;
      END $$;
    `;
    console.log('✓ Migrated session_items.type to enum');

    // Add goal_type column to session_items
    await sql`
      ALTER TABLE "session_items" 
      ADD COLUMN IF NOT EXISTS "goal_type" "goal_type" DEFAULT 'individu' NOT NULL
    `;
    console.log('✓ Added session_items.goal_type column');

    // Migrate daily_logs.type to daily_logs.session_item_type (rename and convert to enum)
    await sql`
      DO $$
      BEGIN
        -- Check if 'type' column exists (old name)
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'daily_logs' AND column_name = 'type'
        ) THEN
          -- Add new column with enum type
          ALTER TABLE "daily_logs" ADD COLUMN IF NOT EXISTS "session_item_type" "session_item_type" DEFAULT 'task';
          
          -- Copy data, mapping old values to new enum
          UPDATE "daily_logs" SET "session_item_type" = 
            CASE 
              WHEN "type" = 'timer' THEN 'timer'::"session_item_type"
              ELSE 'task'::"session_item_type"
            END;
          
          -- Drop old column
          ALTER TABLE "daily_logs" DROP COLUMN "type";
          ALTER TABLE "daily_logs" ALTER COLUMN "session_item_type" SET NOT NULL;
          ALTER TABLE "daily_logs" ALTER COLUMN "session_item_type" SET DEFAULT 'task';
        END IF;
      END $$;
    `;
    console.log('✓ Migrated daily_logs.type to session_item_type enum');

    // Migrate daily_logs.status from text to enum
    await sql`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'daily_logs' AND column_name = 'status' AND data_type = 'text'
        ) THEN
          -- Add temporary column
          ALTER TABLE "daily_logs" ADD COLUMN IF NOT EXISTS "status_new" "daily_log_status" DEFAULT 'pending';
          
          -- Copy data, mapping old values to new enum
          UPDATE "daily_logs" SET "status_new" = 
            CASE 
              WHEN "status" = 'inprogress' THEN 'inprogress'::"daily_log_status"
              WHEN "status" = 'completed' THEN 'completed'::"daily_log_status"
              WHEN "status" = 'failed' THEN 'failed'::"daily_log_status"
              WHEN "status" = 'skipped' THEN 'skipped'::"daily_log_status"
              ELSE 'pending'::"daily_log_status"
            END;
          
          -- Drop old column and rename new one
          ALTER TABLE "daily_logs" DROP COLUMN "status";
          ALTER TABLE "daily_logs" RENAME COLUMN "status_new" TO "status";
          ALTER TABLE "daily_logs" ALTER COLUMN "status" SET NOT NULL;
          ALTER TABLE "daily_logs" ALTER COLUMN "status" SET DEFAULT 'pending';
        END IF;
      END $$;
    `;
    console.log('✓ Migrated daily_logs.status to enum');

    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

migrate();
