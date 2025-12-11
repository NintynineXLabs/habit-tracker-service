import { pgTable, text, integer, boolean, uuid, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
});

export const usersRelations = relations(users, ({ many }) => ({
  habitMasters: many(habitMasters),
  weeklySessions: many(weeklySessions),
  dailyLogs: many(dailyLogs),
}));

export const habitMasters = pgTable("habit_masters", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category"),
});

export const habitMastersRelations = relations(habitMasters, ({ one, many }) => ({
  user: one(users, {
    fields: [habitMasters.userId],
    references: [users.id],
  }),
  sessionItems: many(sessionItems),
  dailyLogs: many(dailyLogs),
}));

export const weeklySessions = pgTable("weekly_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  name: text("name").notNull(),
  description: text("description"),
  dayOfWeek: integer("day_of_week").notNull(),
});

export const weeklySessionsRelations = relations(weeklySessions, ({ one, many }) => ({
  user: one(users, {
    fields: [weeklySessions.userId],
    references: [users.id],
  }),
  sessionItems: many(sessionItems),
}));

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

export const sessionItemsRelations = relations(sessionItems, ({ one, many }) => ({
  session: one(weeklySessions, {
    fields: [sessionItems.sessionId],
    references: [weeklySessions.id],
  }),
  habitMaster: one(habitMasters, {
    fields: [sessionItems.habitMasterId],
    references: [habitMasters.id],
  }),
  collaborators: many(sessionCollaborators),
  dailyLogs: many(dailyLogs),
}));

export const sessionCollaborators = pgTable("session_collaborators", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionItemId: uuid("session_item_id")
    .references(() => sessionItems.id)
    .notNull(),
  collaboratorUserId: uuid("collaborator_user_id")
    .references(() => users.id)
    .notNull(),
});

export const sessionCollaboratorsRelations = relations(sessionCollaborators, ({ one }) => ({
  sessionItem: one(sessionItems, {
    fields: [sessionCollaborators.sessionItemId],
    references: [sessionItems.id],
  }),
  user: one(users, {
    fields: [sessionCollaborators.collaboratorUserId],
    references: [users.id],
  }),
}));

export const dailyLogs = pgTable("daily_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  date: text("date").notNull(), // ISO date string YYYY-MM-DD
  sessionItemId: uuid("session_item_id").references(() => sessionItems.id),
  habitMasterId: uuid("habit_master_id")
    .references(() => habitMasters.id)
    .notNull(),
  sessionName: text("session_name"),
  startTime: text("start_time"),
  durationMinutes: integer("duration_minutes"),
});

export const dailyLogsRelations = relations(dailyLogs, ({ one, many }) => ({
  user: one(users, {
    fields: [dailyLogs.userId],
    references: [users.id],
  }),
  sessionItem: one(sessionItems, {
    fields: [dailyLogs.sessionItemId],
    references: [sessionItems.id],
  }),
  habitMaster: one(habitMasters, {
    fields: [dailyLogs.habitMasterId],
    references: [habitMasters.id],
  }),
  progress: many(dailyLogsProgress),
}));

export const dailyLogsProgress = pgTable("daily_logs_progress", {
  id: uuid("id").primaryKey().defaultRandom(),
  dailyLogId: uuid("daily_log_id")
    .references(() => dailyLogs.id)
    .notNull(),
  isCompleted: boolean("is_completed").default(false).notNull(),
  completedAt: timestamp("completed_at"),
  timerSeconds: integer("timer_seconds").default(0),
});

export const dailyLogsProgressRelations = relations(dailyLogsProgress, ({ one }) => ({
  dailyLog: one(dailyLogs, {
    fields: [dailyLogsProgress.dailyLogId],
    references: [dailyLogs.id],
  }),
}));
