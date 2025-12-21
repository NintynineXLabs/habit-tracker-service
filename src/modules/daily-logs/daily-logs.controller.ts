import type { Context } from 'hono';
import type {
  UpdateDailyLogProgress,
  UpdateDailyLogRequest,
} from './daily-logs.schema';
import {
  getDailyLogsByUserId,
  softDeleteDailyLog,
  syncDailyLogsForUser,
  updateDailyLog,
  upsertDailyLogProgress,
} from './daily-logs.service';

// Daily Logs
export const getMyDailyLogs = async (c: Context) => {
  const user = c.get('user');
  const date = c.req.query('date')!;

  // Trigger sync to ensure logs exist for this date
  await syncDailyLogsForUser(user.sub, date);

  const result = await getDailyLogsByUserId(user.sub, date);
  return c.json(result, 200);
};

export const updateDailyLogController = async (c: Context) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const data = await c.req.json();
  const result = await updateDailyLog(
    id,
    user.sub,
    data as UpdateDailyLogRequest,
  );
  return c.json(result, 200);
};

export const deleteDailyLogController = async (c: Context) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const result = await softDeleteDailyLog(id, user.sub);
  return c.json(result, 200);
};

// Daily Logs Progress
export const createDailyLogProgressController = async (c: Context) => {
  const data = await c.req.json();
  const result = await upsertDailyLogProgress(data as UpdateDailyLogProgress);
  return c.json(result, 200);
};
