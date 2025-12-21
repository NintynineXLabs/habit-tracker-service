import { relations } from 'drizzle-orm';

import { users } from '../modules/users/users.schema';
import { habitMasters } from '../modules/habits/habits.schema';
import {
  weeklySessions,
  sessionItems,
  sessionCollaborators,
} from '../modules/sessions/sessions.schema';
import { dailyLogs } from '../modules/daily-logs/daily-logs.schema';

export {
  users,
  habitMasters,
  weeklySessions,
  sessionItems,
  sessionCollaborators,
  dailyLogs,
};

export const usersRelations = relations(users, ({ many }) => ({
  habitMasters: many(habitMasters),
  weeklySessions: many(weeklySessions),
  dailyLogs: many(dailyLogs),
}));

export const habitMastersRelations = relations(
  habitMasters,
  ({ one, many }) => ({
    user: one(users, {
      fields: [habitMasters.userId],
      references: [users.id],
    }),
    sessionItems: many(sessionItems),
  }),
);

export const weeklySessionsRelations = relations(
  weeklySessions,
  ({ one, many }) => ({
    user: one(users, {
      fields: [weeklySessions.userId],
      references: [users.id],
    }),
    sessionItems: many(sessionItems),
  }),
);

export const sessionItemsRelations = relations(
  sessionItems,
  ({ one, many }) => ({
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
  }),
);

export const sessionCollaboratorsRelations = relations(
  sessionCollaborators,
  ({ one }) => ({
    sessionItem: one(sessionItems, {
      fields: [sessionCollaborators.sessionItemId],
      references: [sessionItems.id],
    }),
    collaboratorUser: one(users, {
      fields: [sessionCollaborators.collaboratorUserId],
      references: [users.id],
    }),
  }),
);

export const dailyLogsRelations = relations(dailyLogs, ({ one }) => ({
  user: one(users, {
    fields: [dailyLogs.userId],
    references: [users.id],
  }),
  session: one(weeklySessions, {
    fields: [dailyLogs.sessionId],
    references: [weeklySessions.id],
  }),
  sessionItem: one(sessionItems, {
    fields: [dailyLogs.sessionItemId],
    references: [sessionItems.id],
  }),
}));
