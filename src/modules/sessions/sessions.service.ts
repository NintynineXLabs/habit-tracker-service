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
export const getAllWeeklySessions = async () => {
  return await db.select().from(weeklySessions);
};

export const getWeeklySessionsByUserId = async (userId: string) => {
  return await db
    .select()
    .from(weeklySessions)
    .where(eq(weeklySessions.userId, userId));
};

export const createWeeklySession = async (data: NewWeeklySession) => {
  const result = await db.insert(weeklySessions).values(data).returning();
  return result[0];
};

// Session Items
export const getAllSessionItems = async () => {
  return await db.select().from(sessionItems);
};

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

// Session Collaborators
export const getAllSessionCollaborators = async () => {
  return await db.select().from(sessionCollaborators);
};

export const createSessionCollaborator = async (
  data: NewSessionCollaborator,
) => {
  const result = await db.insert(sessionCollaborators).values(data).returning();
  return result[0];
};
