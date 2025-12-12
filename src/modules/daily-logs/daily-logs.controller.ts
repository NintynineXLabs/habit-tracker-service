import type { Context } from 'hono';
import {
  getAllDailyLogs,
  createDailyLog,
  getAllDailyLogsProgress,
  createDailyLogProgress,
} from './daily-logs.service';
import type { NewDailyLog, NewDailyLogProgress } from './daily-logs.schema';

// Daily Logs
export const getDailyLogs = async (c: Context) => {
  const result = await getAllDailyLogs();
  return c.json(result, 200);
};

export const createDailyLogController = async (c: Context) => {
  const data = await c.req.json();
  const result = await createDailyLog(data as NewDailyLog);
  return c.json(result, 200);
};

// Daily Logs Progress
export const getDailyLogsProgress = async (c: Context) => {
  const result = await getAllDailyLogsProgress();
  // We need to cast result to any because of Date vs string mismatch in OpenAPI types
  // The schema expects Date (from z.date()), but c.json serializes to string
  return c.json(result as any, 200);
};

export const createDailyLogProgressController = async (c: Context) => {
  const data = await c.req.json();
  const result = await createDailyLogProgress(data as NewDailyLogProgress);
  return c.json(result as any, 200);
};
