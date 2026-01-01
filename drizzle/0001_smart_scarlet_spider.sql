CREATE TABLE "daily_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"date" text NOT NULL,
	"weekly_session_id" uuid,
	"session_item_id" uuid NOT NULL,
	"weekly_session_name" text,
	"weekly_session_description" text,
	"session_item_type" "session_item_type" DEFAULT 'task' NOT NULL,
	"start_time" text,
	"duration_minutes" integer,
	"status" "daily_log_status" DEFAULT 'pending' NOT NULL,
	"status_updated_at" timestamp,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "habit_masters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" text,
	"icon_name" text,
	"icon_background_color" text,
	"icon_color" text,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "motivational_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"message" text NOT NULL,
	"min_percentage" integer DEFAULT 0 NOT NULL,
	"max_percentage" integer DEFAULT 100 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "notification_type" NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "session_collaborators" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_item_id" uuid NOT NULL,
	"collaborator_user_id" uuid,
	"status" "collaborator_status" DEFAULT 'invited' NOT NULL,
	"email" text NOT NULL,
	"role" "collaborator_role" DEFAULT 'member' NOT NULL,
	"invited_at" timestamp DEFAULT now(),
	"joined_at" timestamp,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "session_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"weekly_session_id" uuid NOT NULL,
	"habit_master_id" uuid NOT NULL,
	"start_time" text NOT NULL,
	"duration_minutes" integer,
	"type" "session_item_type" DEFAULT 'task' NOT NULL,
	"goal_type" "goal_type" DEFAULT 'individu' NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"google_id" text,
	"google_refresh_token" text,
	"refresh_token" text,
	"picture" text,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_google_id_unique" UNIQUE("google_id")
);
--> statement-breakpoint
CREATE TABLE "weekly_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"day_of_week" integer NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "daily_logs" ADD CONSTRAINT "daily_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_logs" ADD CONSTRAINT "daily_logs_weekly_session_id_weekly_sessions_id_fk" FOREIGN KEY ("weekly_session_id") REFERENCES "public"."weekly_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_logs" ADD CONSTRAINT "daily_logs_session_item_id_session_items_id_fk" FOREIGN KEY ("session_item_id") REFERENCES "public"."session_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "habit_masters" ADD CONSTRAINT "habit_masters_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_collaborators" ADD CONSTRAINT "session_collaborators_session_item_id_session_items_id_fk" FOREIGN KEY ("session_item_id") REFERENCES "public"."session_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_collaborators" ADD CONSTRAINT "session_collaborators_collaborator_user_id_users_id_fk" FOREIGN KEY ("collaborator_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_items" ADD CONSTRAINT "session_items_weekly_session_id_weekly_sessions_id_fk" FOREIGN KEY ("weekly_session_id") REFERENCES "public"."weekly_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_items" ADD CONSTRAINT "session_items_habit_master_id_habit_masters_id_fk" FOREIGN KEY ("habit_master_id") REFERENCES "public"."habit_masters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weekly_sessions" ADD CONSTRAINT "weekly_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;