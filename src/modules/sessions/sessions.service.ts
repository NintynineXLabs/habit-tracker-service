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
import { habitMasters } from '../habits/habits.schema';
import { users } from '../users/users.schema';

// Weekly Sessions
export const getAllWeeklySessions = async () => {
  return await db.select().from(weeklySessions);
};

export const getWeeklySessionsByUserId = async (userId: string) => {
  const sessions = await db
    .select()
    .from(weeklySessions)
    .where(eq(weeklySessions.userId, userId));

  // For each session, fetch related items with habit masters and collaborators
  const sessionsWithDetails = await Promise.all(
    sessions.map(async (session) => {
      // Get session items with habit masters joined
      const items = await db
        .select()
        .from(sessionItems)
        .leftJoin(habitMasters, eq(sessionItems.habitMasterId, habitMasters.id))
        .where(eq(sessionItems.sessionId, session.id));

      // For each item, get collaborators with user info
      const itemsWithCollaborators = await Promise.all(
        items.map(async (item) => {
          const collaborators = await db
            .select()
            .from(sessionCollaborators)
            .leftJoin(
              users,
              eq(sessionCollaborators.collaboratorUserId, users.id),
            )
            .where(
              eq(sessionCollaborators.sessionItemId, item.session_items.id),
            );

          return {
            ...item.session_items,
            habitMaster: item.habit_masters,
            collaborators: collaborators.map((c) => ({
              ...c.session_collaborators,
              collaboratorUser: c.users,
            })),
          };
        }),
      );

      return {
        ...session,
        items: itemsWithCollaborators,
      };
    }),
  );

  return sessionsWithDetails;
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
