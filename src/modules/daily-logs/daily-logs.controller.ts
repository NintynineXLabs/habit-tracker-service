import type { Context } from 'hono';
import type { UpdateDailyLogProgress } from './daily-logs.schema';
import {
  getDailyLogsByUserId,
  syncDailyLogsForUser,
  upsertDailyLogProgress,
} from './daily-logs.service';

// Daily Logs
export const getMyDailyLogs = async (c: Context) => {
  const user = c.get('user');
  const date = c.req.query('date') || new Date().toISOString().split('T')[0]!;

  // Trigger sync to ensure logs exist for this date
  await syncDailyLogsForUser(user.sub, date);

  const result = await getDailyLogsByUserId(user.sub, date);
  return c.json(result, 200);
};

// Daily Logs Progress
export const createDailyLogProgressController = async (c: Context) => {
  const data = await c.req.json();
  const result = await upsertDailyLogProgress(data as UpdateDailyLogProgress);
  return c.json(result, 200);
};
