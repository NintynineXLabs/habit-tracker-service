import { and, eq } from 'drizzle-orm';
import { db } from '../../db';
import {
  dailyLogs,
  type UpdateDailyLogProgress,
  type UpdateDailyLogRequest,
} from './daily-logs.schema';

// Daily Logs
export const getDailyLogsByUserId = async (userId: string, date: string) => {
  return await db.query.dailyLogs.findMany({
    where: (dailyLogs, { eq, and, isNull }) =>
      and(
        eq(dailyLogs.userId, userId),
        eq(dailyLogs.date, date),
        isNull(dailyLogs.deletedAt),
      ),
    orderBy: (dailyLogs, { asc }) => [
      asc(dailyLogs.weeklySessionId),
      asc(dailyLogs.startTime),
    ],
    with: {
      sessionItem: {
        with: {
          habitMaster: true,
          collaborators: {
            where: (cols, { isNull }) => isNull(cols.deletedAt),
            with: {
              collaboratorUser: true,
            },
          },
        },
      },
    },
  });
};

export const syncDailyLogsForUser = async (userId: string, date: string) => {
  // 1. Check if logs already exist for this user and date
  const existingLogs = await db.query.dailyLogs.findMany({
    where: (dailyLogs, { eq, and }) =>
      and(eq(dailyLogs.userId, userId), eq(dailyLogs.date, date)),
  });

  const existingSessionItemIds = new Set(
    existingLogs
      .map((log) => log.sessionItemId)
      .filter((id): id is string => id !== null),
  );

  // 2. Validate date: only allow sync for today and tomorrow
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const todayStr = today.toISOString().split('T')[0]!;
  const tomorrowStr = tomorrow.toISOString().split('T')[0]!;

  if (date !== todayStr && date !== tomorrowStr) {
    return await getDailyLogsByUserId(userId, date);
  }

  const [year, month, day] = date.split('-').map(Number);
  const dateObj = new Date(year!, month! - 1, day);
  const dayOfWeek = dateObj.getDay();

  const sessions = await db.query.weeklySessions.findMany({
    where: (weeklySessions, { eq, and }) =>
      and(
        eq(weeklySessions.userId, userId),
        eq(weeklySessions.dayOfWeek, dayOfWeek),
      ),
    with: {
      sessionItems: {
        where: (items, { isNull }) => isNull(items.deletedAt),
      },
    },
  });

  // 4. Create daily logs for new items
  for (const session of sessions) {
    for (const item of session.sessionItems) {
      // Skip if log already exists for this session item
      if (existingSessionItemIds.has(item.id)) {
        continue;
      }

      await db.insert(dailyLogs).values({
        userId,
        date,
        weeklySessionId: session.id,
        sessionItemId: item.id,
        weeklySessionName: session.name,
        weeklySessionDescription: session.description,
        sessionItemType: item.type,
        startTime: item.startTime,
        durationMinutes: item.durationMinutes,
        status: 'pending',
      });
    }
  }

  return await getDailyLogsByUserId(userId, date);
};

export const updateDailyLog = async (
  id: string,
  userId: string,
  data: UpdateDailyLogRequest,
) => {
  const result = await db
    .update(dailyLogs)
    .set({
      startTime: data.startTime,
      durationMinutes: data.durationMinutes,
    })
    .where(and(eq(dailyLogs.id, id), eq(dailyLogs.userId, userId)))
    .returning();

  return result[0];
};

export const softDeleteDailyLog = async (id: string, userId: string) => {
  const result = await db
    .update(dailyLogs)
    .set({
      deletedAt: new Date(),
    })
    .where(and(eq(dailyLogs.id, id), eq(dailyLogs.userId, userId)))
    .returning();

  return result[0];
};

// Daily Logs Progress
export const upsertDailyLogProgress = async (data: UpdateDailyLogProgress) => {
  const result = await db
    .update(dailyLogs)
    .set({
      status: data.status,
      statusUpdatedAt: new Date(),
    })
    .where(eq(dailyLogs.id, data.dailyLogId))
    .returning();

  return result[0];
};
