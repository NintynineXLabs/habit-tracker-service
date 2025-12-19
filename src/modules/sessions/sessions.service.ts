import { eq, and } from 'drizzle-orm';
import { db } from '../../db';
import {
  weeklySessions,
  sessionItems,
  sessionCollaborators,
  type NewWeeklySession,
  type NewSessionItem,
  type NewSessionCollaborator,
} from './sessions.schema';

// Weekly Sessions
export const getWeeklySessionsByUserId = async (
  userId: string,
  dayOfWeek?: number,
) => {
  return await db.query.weeklySessions.findMany({
    where: (weeklySessions, { eq, and, isNull }) => {
      const conditions = [
        eq(weeklySessions.userId, userId),
        isNull(weeklySessions.deletedAt),
      ];

      if (dayOfWeek !== undefined) {
        conditions.push(eq(weeklySessions.dayOfWeek, dayOfWeek));
      }

      return and(...conditions);
    },
    with: {
      sessionItems: {
        where: (sessionItems, { isNull }) => isNull(sessionItems.deletedAt),
        orderBy: (sessionItems, { asc }) => [asc(sessionItems.startTime)],
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
    },
  });
};

export const createWeeklySession = async (data: NewWeeklySession) => {
  const result = await db.insert(weeklySessions).values(data).returning();
  return result[0];
};

export const updateWeeklySession = async (
  id: string,
  data: Partial<NewWeeklySession>,
) => {
  const result = await db
    .update(weeklySessions)
    .set(data)
    .where(eq(weeklySessions.id, id))
    .returning();
  return result[0];
};

export const deleteWeeklySession = async (id: string) => {
  await db
    .update(weeklySessions)
    .set({ deletedAt: new Date() })
    .where(eq(weeklySessions.id, id))
    .returning();
};

// Session Items
export const getSessionItemsByUserId = async (
  userId: string,
  dayOfWeek?: number,
) => {
  const conditions = [eq(weeklySessions.userId, userId)];

  if (dayOfWeek !== undefined) {
    conditions.push(eq(weeklySessions.dayOfWeek, dayOfWeek));
  }

  return await db
    .select({
      sessionItem: sessionItems,
      weeklySession: weeklySessions,
    })
    .from(sessionItems)
    .innerJoin(weeklySessions, eq(sessionItems.sessionId, weeklySessions.id))
    .where(and(...conditions));
};

export const createSessionItem = async (data: NewSessionItem) => {
  const result = await db.insert(sessionItems).values(data).returning();
  return result[0];
};

export const updateSessionItem = async (
  id: string,
  data: Partial<NewSessionItem>,
) => {
  const result = await db
    .update(sessionItems)
    .set(data)
    .where(eq(sessionItems.id, id))
    .returning();
  return result[0];
};

export const deleteSessionItem = async (id: string) => {
  await db
    .update(sessionItems)
    .set({ deletedAt: new Date() })
    .where(eq(sessionItems.id, id))
    .returning();
};

// Session Collaborators
export const createSessionCollaborator = async (
  data: NewSessionCollaborator,
) => {
  const result = await db.insert(sessionCollaborators).values(data).returning();
  return result[0];
};
