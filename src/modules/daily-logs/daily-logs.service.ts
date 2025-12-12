import { eq } from 'drizzle-orm';
import { db } from '../../db';
import {
  dailyLogs,
  dailyLogsProgress,
  type NewDailyLog,
  type NewDailyLogProgress,
} from './daily-logs.schema';

// Daily Logs
export const getAllDailyLogs = async () => {
  return await db.select().from(dailyLogs);
};

export const getDailyLogsByUserId = async (userId: string) => {
  return await db.select().from(dailyLogs).where(eq(dailyLogs.userId, userId));
};

export const createDailyLog = async (data: NewDailyLog) => {
  const result = await db.insert(dailyLogs).values(data).returning();
  return result[0];
};

// Daily Logs Progress
export const getAllDailyLogsProgress = async () => {
  return await db.select().from(dailyLogsProgress);
};

export const createDailyLogProgress = async (data: NewDailyLogProgress) => {
  const result = await db.insert(dailyLogsProgress).values(data).returning();
  return result[0];
};
