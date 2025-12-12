import type { Context } from 'hono';
import {
  getAllDailyLogs,
  createDailyLog,
  getDailyLogsByUserId,
  getAllDailyLogsProgress,
  createDailyLogProgress,
} from './daily-logs.service';
import type { NewDailyLog, NewDailyLogProgress } from './daily-logs.schema';

// Daily Logs
export const getDailyLogs = async (c: Context) => {
  const result = await getAllDailyLogs();
  return c.json(result, 200);
};

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
export const getDailyLogsProgress = async (c: Context) => {
  const result = await getAllDailyLogsProgress();
  return c.json(result, 200);
};

export const createDailyLogProgressController = async (c: Context) => {
  const data = await c.req.json();
  const result = await createDailyLogProgress(data as NewDailyLogProgress);
  return c.json(result, 200);
};
