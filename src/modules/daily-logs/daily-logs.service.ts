import { eq } from 'drizzle-orm';
import { db } from '../../db';
import {
  dailyLogs,
  dailyLogsProgress,
  type NewDailyLogProgress,
} from './daily-logs.schema';

// Daily Logs
export const getDailyLogsByUserId = async (userId: string, date?: string) => {
  return await db.query.dailyLogs.findMany({
    where: (dailyLogs, { eq, and }) => {
      const conditions = [eq(dailyLogs.userId, userId)];
      if (date) {
        conditions.push(eq(dailyLogs.date, date));
      }
      return and(...conditions);
    },
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

export const syncDailyLogsForUser = async (userId: string, date: string) => {
  // 1. Check if logs already exist for this user and date
  const existingLogs = await db.query.dailyLogs.findMany({
    where: (dailyLogs, { eq, and }) =>
      and(eq(dailyLogs.userId, userId), eq(dailyLogs.date, date)),
  });

  if (existingLogs.length > 0) {
    return existingLogs;
  }

  // 2. Get day of week from date string (YYYY-MM-DD)
  // We use a regex to avoid timezone issues with new Date(dateStr)
  const [year, month, day] = date.split('-').map(Number);
  const dateObj = new Date(year!, month! - 1, day);
  const dayOfWeek = dateObj.getDay();

  // 3. Find weekly sessions for this user on this day
  const sessions = await db.query.weeklySessions.findMany({
    where: (weeklySessions, { eq, and, isNull }) =>
      and(
        eq(weeklySessions.userId, userId),
        eq(weeklySessions.dayOfWeek, dayOfWeek),
        isNull(weeklySessions.deletedAt),
      ),
    with: {
      sessionItems: {
        where: (sessionItems, { isNull }) => isNull(sessionItems.deletedAt),
      },
    },
  });

  // 4. Create daily logs and initial progress
  for (const session of sessions) {
    for (const item of session.sessionItems) {
      const [newLog] = await db
        .insert(dailyLogs)
        .values({
          userId,
          date,
          sessionItemId: item.id,
          habitMasterId: item.habitMasterId,
          sessionName: session.name,
          startTime: item.startTime,
          durationMinutes: item.durationMinutes,
        })
        .returning();

      if (newLog) {
        await db.insert(dailyLogsProgress).values({
          dailyLogId: newLog.id,
          isCompleted: false,
          timerSeconds: 0,
        });
      }
    }
  }

  return await getDailyLogsByUserId(userId, date);
};

// Daily Logs Progress
export const upsertDailyLogProgress = async (data: NewDailyLogProgress) => {
  const existing = await db.query.dailyLogsProgress.findFirst({
    where: (progress, { eq }) => eq(progress.dailyLogId, data.dailyLogId),
  });

  if (existing) {
    const result = await db
      .update(dailyLogsProgress)
      .set({
        isCompleted: data.isCompleted,
        completedAt: data.completedAt,
        timerSeconds: data.timerSeconds,
      })
      .where(eq(dailyLogsProgress.id, existing.id))
      .returning();
    return result[0];
  } else {
    const result = await db.insert(dailyLogsProgress).values(data).returning();
    return result[0];
  }
};
