import type { Context } from 'hono';
import type { NewDailyLog, NewDailyLogProgress } from './daily-logs.schema';
import {
  createDailyLog,
  createDailyLogProgress,
  getDailyLogsByUserId,
} from './daily-logs.service';

// Daily Logs
export const getMyDailyLogs = async (c: Context) => {
  const user = c.get('user');
  const result = await getDailyLogsByUserId(user.sub);
  return c.json(result, 200);
};

export const createDailyLogController = async (c: Context) => {
  const user = c.get('user');
  const data = await c.req.json();
  const newLog: NewDailyLog = {
    ...data,
    userId: user.sub,
  };
  const result = await createDailyLog(newLog);
  return c.json(result, 200);
};

// Daily Logs Progress
export const createDailyLogProgressController = async (c: Context) => {
  const data = await c.req.json();
  const result = await createDailyLogProgress(data as NewDailyLogProgress);
  return c.json(result, 200);
};
