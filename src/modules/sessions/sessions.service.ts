import { eq } from 'drizzle-orm';
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
