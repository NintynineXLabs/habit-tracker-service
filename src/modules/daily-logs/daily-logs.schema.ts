import {
  pgTable,
  text,
  integer,
  boolean,
  uuid,
  timestamp,
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from '@hono/zod-openapi';
import { users } from '../users/users.schema';
import { habitMasters } from '../habits/habits.schema';
import { sessionItems } from '../sessions/sessions.schema';

export const dailyLogs = pgTable('daily_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  date: text('date').notNull(), // ISO date string YYYY-MM-DD
  sessionItemId: uuid('session_item_id').references(() => sessionItems.id),
  habitMasterId: uuid('habit_master_id')
    .references(() => habitMasters.id)
    .notNull(),
  sessionName: text('session_name'),
  startTime: text('start_time'),
  durationMinutes: integer('duration_minutes'),
});

export const dailyLogsProgress = pgTable('daily_logs_progress', {
  id: uuid('id').primaryKey().defaultRandom(),
  dailyLogId: uuid('daily_log_id')
    .references(() => dailyLogs.id)
    .notNull(),
  isCompleted: boolean('is_completed').default(false).notNull(),
  completedAt: timestamp('completed_at'),
  timerSeconds: integer('timer_seconds').default(0),
});

import { toOpenApi } from '../../utils/zod-helper';

export const insertDailyLogSchema = toOpenApi(createInsertSchema(dailyLogs), {
  description: 'Schema for creating a daily log',
  example: {
    userId: '123e4567-e89b-12d3-a456-426614174000',
    date: '2023-01-01',
    habitMasterId: '123e4567-e89b-12d3-a456-426614174000',
  },
});

export const selectDailyLogSchema = toOpenApi(createSelectSchema(dailyLogs), {
  description: 'Schema for selecting a daily log',
});

export const insertDailyLogProgressSchema = toOpenApi(
  createInsertSchema(dailyLogsProgress),
  {
    description: 'Schema for creating a daily log progress',
    example: {
      dailyLogId: '123e4567-e89b-12d3-a456-426614174000',
      isCompleted: true,
    },
  },
);

export const selectDailyLogProgressSchema = toOpenApi(
  createSelectSchema(dailyLogsProgress),
  {
    description: 'Schema for selecting a daily log progress',
  },
);

export type DailyLog = z.infer<typeof selectDailyLogSchema>;
export type NewDailyLog = z.infer<typeof insertDailyLogSchema>;

export type DailyLogProgress = z.infer<typeof selectDailyLogProgressSchema>;
export type NewDailyLogProgress = z.infer<typeof insertDailyLogProgressSchema>;
