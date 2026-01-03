import { and, eq, isNull } from 'drizzle-orm';
import { db } from '../../db';
import {
  dailyLogs,
  type UpdateDailyLogProgress,
  type UpdateDailyLogRequest,
} from './daily-logs.schema';
import { sessionCollaborators } from '../sessions/sessions.schema';

// Daily Logs
export const getDailyLogsByUserId = async (userId: string, date: string) => {
  return await db.query.dailyLogs.findMany({
    where: (dailyLogs, { eq, and, isNull }) =>
      and(
        eq(dailyLogs.userId, userId),
        eq(dailyLogs.date, date),
        isNull(dailyLogs.deletedAt),
      ),
    orderBy: (dailyLogs, { asc }) => [asc(dailyLogs.startTime)],
    with: {
      sessionItem: {
        columns: {
          id: true,
          weeklySessionId: true,
          habitMasterId: true,
          startTime: true,
          durationMinutes: true,
          type: true,
          goalType: true,
          deletedAt: true,
        },
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

// Group Progress for Collaborative Goals
export const getGroupProgress = async (sessionItemId: string, date: string) => {
  // 1. Get all accepted collaborators (the "attendance list")
  const allCollaborators = await db.query.sessionCollaborators.findMany({
    where: and(
      eq(sessionCollaborators.sessionItemId, sessionItemId),
      eq(sessionCollaborators.status, 'accepted'),
      isNull(sessionCollaborators.deletedAt),
    ),
    with: {
      collaboratorUser: true,
    },
  });

  // 2. Get today's daily logs for this session item
  const todaysLogs = await db.query.dailyLogs.findMany({
    where: and(
      eq(dailyLogs.sessionItemId, sessionItemId),
      eq(dailyLogs.date, date),
      isNull(dailyLogs.deletedAt),
    ),
  });

  // 3. Map collaborators with their status (handles lazy loading)
  // Loop based on Collaborator, not Log, so users who haven't opened the app still appear
  const members = allCollaborators.map((collab) => {
    // Find if this collaborator has a log today
    const userLog = todaysLogs.find(
      (log) => log.userId === collab.collaboratorUserId,
    );

    return {
      userId: collab.collaboratorUserId,
      name: collab.collaboratorUser?.name ?? null,
      email: collab.collaboratorUser?.email ?? collab.email,
      picture: collab.collaboratorUser?.picture ?? null,
      role: collab.role,
      // If log found, use its status. If not (lazy load), default to 'pending'
      status: userLog?.status ?? 'pending',
      completedAt: userLog?.statusUpdatedAt ?? null,
    };
  });

  // 4. Calculate statistics from the mapping result
  const totalMembers = members.length;
  const completedMembers = members.filter(
    (m) => m.status === 'completed',
  ).length;

  return {
    summary: {
      totalMembers,
      completedMembers,
      isGroupComplete: totalMembers > 0 && totalMembers === completedMembers,
      percentage:
        totalMembers === 0
          ? 0
          : Math.round((completedMembers / totalMembers) * 100),
    },
    members,
  };
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

  // === DUAL SOURCE TRIGGER ===

  // Source A: Get user's own weekly sessions for this day
  const ownSessions = await db.query.weeklySessions.findMany({
    where: (weeklySessions, { eq, and, isNull }) =>
      and(
        eq(weeklySessions.userId, userId),
        eq(weeklySessions.dayOfWeek, dayOfWeek),
        isNull(weeklySessions.deletedAt),
      ),
    with: {
      sessionItems: {
        where: (items, { isNull }) => isNull(items.deletedAt),
      },
    },
  });

  // Source B: Get collaborative session items where user is an accepted collaborator
  const collaborativeItems = await db.query.sessionCollaborators.findMany({
    where: (collaborators, { eq, and, isNull }) =>
      and(
        eq(collaborators.collaboratorUserId, userId),
        eq(collaborators.status, 'accepted'),
        isNull(collaborators.deletedAt),
      ),
    with: {
      sessionItem: {
        with: {
          session: true, // Parent weekly session to check dayOfWeek
        },
      },
    },
  });

  // Filter collaborative items to only include those on the target day
  // and exclude items from own sessions (to avoid duplicates)
  const ownSessionIds = new Set(ownSessions.map((s) => s.id));
  const collabSessionItems = collaborativeItems
    .filter((collab) => {
      const session = collab.sessionItem?.session;
      if (!session) return false;
      // Skip if this belongs to user's own session
      if (ownSessionIds.has(session.id)) return false;
      // Check if the weekly session is on the target day
      return session.dayOfWeek === dayOfWeek;
    })
    .map((collab) => ({
      item: collab.sessionItem!,
      session: collab.sessionItem!.session!,
    }));

  // === MERGE AND CREATE LOGS ===

  // 4a. Create daily logs for own session items
  for (const session of ownSessions) {
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

  // 4b. Create daily logs for collaborative session items
  for (const { item, session } of collabSessionItems) {
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
