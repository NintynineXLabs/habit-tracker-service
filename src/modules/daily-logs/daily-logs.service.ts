import { db } from '../../db';
import {
  dailyLogs,
  dailyLogsProgress,
  type NewDailyLog,
  type NewDailyLogProgress,
} from './daily-logs.schema';

// Daily Logs
export const getDailyLogsByUserId = async (userId: string) => {
  return await db.query.dailyLogs.findMany({
    where: (dailyLogs, { eq }) => eq(dailyLogs.userId, userId),
    with: {
      sessionItem: {
        with: {
          habitMaster: true,
          collaborators: {
            where: (collaborators, { isNull }) =>
              isNull(collaborators.deletedAt),
            with: {
              collaboratorUser: true,
            },
          },
        },
      },
      habitMaster: true,
      progress: true,
    },
  });
};

export const createDailyLog = async (data: NewDailyLog) => {
  const result = await db.insert(dailyLogs).values(data).returning();
  return result[0];
};

// Daily Logs Progress
export const createDailyLogProgress = async (data: NewDailyLogProgress) => {
  const result = await db.insert(dailyLogsProgress).values(data).returning();
  return result[0];
};
