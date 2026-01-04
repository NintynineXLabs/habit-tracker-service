CREATE TYPE "public"."collaborator_role" AS ENUM('owner', 'member');--> statement-breakpoint
CREATE TYPE "public"."collaborator_status" AS ENUM('invited', 'accepted', 'rejected', 'left');--> statement-breakpoint
CREATE TYPE "public"."daily_log_status" AS ENUM('pending', 'inprogress', 'completed', 'failed', 'skipped');--> statement-breakpoint
CREATE TYPE "public"."goal_type" AS ENUM('individu', 'collaborative');--> statement-breakpoint
CREATE TYPE "public"."session_item_type" AS ENUM('task', 'timer');--> statement-breakpoint
CREATE TABLE "habit_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" text,
	"icon_name" text,
	"icon_background_color" text,
	"icon_color" text,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "template_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" text,
	"icon_name" text,
	"icon_background_color" text,
	"icon_color" text,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "template_items" ADD CONSTRAINT "template_items_template_id_habit_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."habit_templates"("id") ON DELETE no action ON UPDATE no action;