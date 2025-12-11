import { pgTable, text, integer, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "../users/users.schema";
import { habitMasters } from "../habits/habits.schema";

export const weeklySessions = pgTable("weekly_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  name: text("name").notNull(),
  description: text("description"),
  dayOfWeek: integer("day_of_week").notNull(),
});

export const sessionItems = pgTable("session_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id")
    .references(() => weeklySessions.id)
    .notNull(),
  habitMasterId: uuid("habit_master_id")
    .references(() => habitMasters.id)
    .notNull(),
  startTime: text("start_time").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  type: text("type").notNull(),
});

export const sessionCollaborators = pgTable("session_collaborators", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionItemId: uuid("session_item_id")
    .references(() => sessionItems.id)
    .notNull(),
  collaboratorUserId: uuid("collaborator_user_id")
    .references(() => users.id)
    .notNull(),
});

export const insertWeeklySessionSchema = createInsertSchema(weeklySessions);
export const selectWeeklySessionSchema = createSelectSchema(weeklySessions);

export const insertSessionItemSchema = createInsertSchema(sessionItems);
export const selectSessionItemSchema = createSelectSchema(sessionItems);

export const insertSessionCollaboratorSchema = createInsertSchema(sessionCollaborators);
export const selectSessionCollaboratorSchema = createSelectSchema(sessionCollaborators);

export type WeeklySession = z.infer<typeof selectWeeklySessionSchema>;
export type NewWeeklySession = z.infer<typeof insertWeeklySessionSchema>;

export type SessionItem = z.infer<typeof selectSessionItemSchema>;
export type NewSessionItem = z.infer<typeof insertSessionItemSchema>;

export type SessionCollaborator = z.infer<typeof selectSessionCollaboratorSchema>;
export type NewSessionCollaborator = z.infer<typeof insertSessionCollaboratorSchema>;
