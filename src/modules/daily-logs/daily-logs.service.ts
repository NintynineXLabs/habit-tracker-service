import { eq } from 'drizzle-orm';
import { db } from '../../db';
import { dailyLogs, type UpdateDailyLogProgress } from './daily-logs.schema';

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
            where: (cols: any, { isNull }: any) => isNull(cols.deletedAt),
            with: {
              collaboratorUser: true,
            },
          },
        },
      },
      habitMaster: true,
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

  // 3. Get day of week from date string (YYYY-MM-DD)
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
        where: (items: any, { isNull }: any) => isNull(items.deletedAt),
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
        sessionId: session.id,
        sessionItemId: item.id,
        habitMasterId: item.habitMasterId,
        sessionName: session.name,
        startTime: item.startTime,
        durationMinutes: item.durationMinutes,
        isCompleted: false,
        timerSeconds: 0,
      });
    }
  }

  return await getDailyLogsByUserId(userId, date);
};

// Daily Logs Progress
export const upsertDailyLogProgress = async (data: UpdateDailyLogProgress) => {
  const result = await db
    .update(dailyLogs)
    .set({
      isCompleted: data.isCompleted,
      completedAt: data.completedAt ? new Date(data.completedAt) : null,
      timerSeconds: data.timerSeconds,
    })
    .where(eq(dailyLogs.id, data.dailyLogId))
    .returning();

  return result[0];
};
