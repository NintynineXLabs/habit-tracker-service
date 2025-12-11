import type { Context } from "hono";
import { getAllDailyLogs, createDailyLog, getAllDailyLogsProgress, createDailyLogProgress } from "./daily-logs.service";
import type { NewDailyLog, NewDailyLogProgress } from "./daily-logs.schema";

// Daily Logs
export const getDailyLogs = async (c: Context) => {
  const result = await getAllDailyLogs();
  return c.json(result);
};

export const createDailyLogController = async (c: Context) => {
  const data = (c as any).req.valid("json") as NewDailyLog;
  const result = await createDailyLog(data);
  return c.json(result);
};

// Daily Logs Progress
export const getDailyLogsProgress = async (c: Context) => {
  const result = await getAllDailyLogsProgress();
  return c.json(result);
};

export const createDailyLogProgressController = async (c: Context) => {
  const data = (c as any).req.valid("json") as NewDailyLogProgress;
  const result = await createDailyLogProgress(data);
  return c.json(result);
};
