-- Create enum types for collaborator status and role
CREATE TYPE "public"."collaborator_status" AS ENUM('invited', 'accepted', 'rejected');
CREATE TYPE "public"."collaborator_role" AS ENUM('owner', 'member');

-- Add new columns to session_collaborators table
ALTER TABLE "session_collaborators" 
ADD COLUMN IF NOT EXISTS "status" "collaborator_status" DEFAULT 'invited' NOT NULL,
ADD COLUMN IF NOT EXISTS "email" text NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS "role" "collaborator_role" DEFAULT 'member' NOT NULL,
ADD COLUMN IF NOT EXISTS "invited_at" timestamp DEFAULT now(),
ADD COLUMN IF NOT EXISTS "joined_at" timestamp;
