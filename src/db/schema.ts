import { relations } from 'drizzle-orm';

import { users } from '../modules/users/users.schema';
import {
  habitMasters,
  habitTemplates,
  templateItems,
} from '../modules/habits/habits.schema';
import {
  weeklySessions,
  sessionItems,
  sessionCollaborators,
  collaboratorRoleEnum,
  collaboratorStatusEnum,
  sessionItemTypeEnum,
  goalTypeEnum,
} from '../modules/sessions/sessions.schema';
import {
  dailyLogs,
  dailyLogStatusEnum,
} from '../modules/daily-logs/daily-logs.schema';
import { motivationalMessages } from '../modules/motivation/motivation.schema';
import {
  notifications,
  notificationTypeEnum,
} from '../modules/notifications/notifications.schema';

export {
  users,
  habitMasters,
  habitTemplates,
  templateItems,
  weeklySessions,
  sessionItems,
  sessionCollaborators,
  dailyLogs,
  motivationalMessages,
  notifications,
  notificationTypeEnum,
  collaboratorRoleEnum,
  collaboratorStatusEnum,
  sessionItemTypeEnum,
  goalTypeEnum,
  dailyLogStatusEnum,
};

export const usersRelations = relations(users, ({ many }) => ({
  habitMasters: many(habitMasters),
  weeklySessions: many(weeklySessions),
  dailyLogs: many(dailyLogs),
  notifications: many(notifications),
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
      fields: [sessionItems.weeklySessionId],
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
    fields: [dailyLogs.weeklySessionId],
    references: [weeklySessions.id],
  }),
  sessionItem: one(sessionItems, {
    fields: [dailyLogs.sessionItemId],
    references: [sessionItems.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));
export const habitTemplatesRelations = relations(
  habitTemplates,
  ({ many }) => ({
    items: many(templateItems),
  }),
);

export const templateItemsRelations = relations(templateItems, ({ one }) => ({
  template: one(habitTemplates, {
    fields: [templateItems.templateId],
    references: [habitTemplates.id],
  }),
}));
