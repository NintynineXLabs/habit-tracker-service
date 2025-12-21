import {
  pgTable,
  pgEnum,
  text,
  integer,
  uuid,
  timestamp,
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from '@hono/zod-openapi';
import { users } from '../users/users.schema';
import { sessionItems, weeklySessions } from '../sessions/sessions.schema';

export const dailyLogStatusEnum = pgEnum('daily_log_status', [
  'pending',
  'inprogress',
  'completed',
  'failed',
  'skipped',
]);

export const dailyLogs = pgTable('daily_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  date: text('date').notNull(), // ISO date string YYYY-MM-DD
  sessionId: uuid('session_id').references(() => weeklySessions.id),
  sessionItemId: uuid('session_item_id')
    .references(() => sessionItems.id)
    .notNull(),
  sessionName: text('session_name'),
  startTime: text('start_time'),
  durationMinutes: integer('duration_minutes'),
  // Progress fields
  status: dailyLogStatusEnum('status').default('pending').notNull(),
  statusUpdatedAt: timestamp('status_updated_at'),
  timerSeconds: integer('timer_seconds').default(0).notNull(),
  deletedAt: timestamp('deleted_at'),
});

import { toOpenApi } from '../../utils/zod-helper';

export const insertDailyLogSchema = toOpenApi(createInsertSchema(dailyLogs), {
  description: 'Schema for inserting a daily log (internal)',
});

export const selectDailyLogSchema = toOpenApi(createSelectSchema(dailyLogs), {
  description: 'Schema for selecting a daily log',
});

export const updateDailyLogProgressSchema = z.object({
  dailyLogId: z.string().uuid(),
  status: z.enum(['pending', 'inprogress', 'completed', 'failed', 'skipped']),
  timerSeconds: z.number().int().min(0),
});

export const updateDailyLogRequestSchema = z.object({
  startTime: z.string().optional(),
  durationMinutes: z.number().int().min(0).optional(),
});

export type DailyLog = z.infer<typeof selectDailyLogSchema>;
export type NewDailyLog = typeof dailyLogs.$inferInsert;

export type UpdateDailyLogProgress = z.infer<
  typeof updateDailyLogProgressSchema
>;

export type UpdateDailyLogRequest = z.infer<typeof updateDailyLogRequestSchema>;
