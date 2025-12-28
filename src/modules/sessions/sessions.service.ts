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
    .innerJoin(
      weeklySessions,
      eq(sessionItems.weeklySessionId, weeklySessions.id),
    )
    .where(and(...conditions));
};

export const createSessionItem = async (
  data: NewSessionItem,
  creatorInfo: { userId: string; email: string },
) => {
  // Create the session item
  const result = await db.insert(sessionItems).values(data).returning();
  const sessionItem = result[0];

  if (sessionItem) {
    // Automatically add the creator as an owner collaborator
    await db.insert(sessionCollaborators).values({
      sessionItemId: sessionItem.id,
      collaboratorUserId: creatorInfo.userId,
      status: 'accepted',
      email: creatorInfo.email,
      role: 'owner',
      invitedAt: new Date(),
      joinedAt: new Date(),
    });
  }

  return sessionItem;
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

// Add collaborator by email - will lookup user or create pending invitation
export const addCollaboratorByEmail = async (
  sessionItemId: string,
  email: string,
) => {
  // Check if collaborator already exists for this session item and email
  const existingCollaborator = await db.query.sessionCollaborators.findFirst({
    where: (collaborators, { eq, and, isNull }) =>
      and(
        eq(collaborators.sessionItemId, sessionItemId),
        eq(collaborators.email, email),
        isNull(collaborators.deletedAt),
      ),
  });

  if (existingCollaborator) {
    return { collaborator: existingCollaborator, alreadyExists: true };
  }

  // Lookup user by email
  const existingUser = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.email, email),
  });

  // Create collaborator entry
  const result = await db
    .insert(sessionCollaborators)
    .values({
      sessionItemId,
      collaboratorUserId: existingUser?.id || null, // Null if user not registered
      email,
      status: 'invited',
      role: 'member',
      invitedAt: new Date(),
      joinedAt: null,
    })
    .returning();

  return { collaborator: result[0], alreadyExists: false };
};

// Get collaborators by session item
export const getCollaboratorsBySessionItem = async (sessionItemId: string) => {
  return await db.query.sessionCollaborators.findMany({
    where: (collaborators, { eq, isNull }) =>
      and(
        eq(collaborators.sessionItemId, sessionItemId),
        isNull(collaborators.deletedAt),
      ),
    with: {
      collaboratorUser: true,
    },
  });
};

// Remove collaborator (soft delete)
export const removeCollaborator = async (collaboratorId: string) => {
  const result = await db
    .update(sessionCollaborators)
    .set({ deletedAt: new Date() })
    .where(eq(sessionCollaborators.id, collaboratorId))
    .returning();
  return result[0];
};

// Update collaborator status (accept/reject invitation)
export const updateCollaboratorStatus = async (
  collaboratorId: string,
  status: 'accepted' | 'rejected',
  userId?: string,
) => {
  const updateData: Record<string, unknown> = { status };

  if (status === 'accepted') {
    updateData.joinedAt = new Date();
    if (userId) {
      updateData.collaboratorUserId = userId;
    }
  }

  const result = await db
    .update(sessionCollaborators)
    .set(updateData)
    .where(eq(sessionCollaborators.id, collaboratorId))
    .returning();
  return result[0];
};

// Get pending invitations for a user by email
export const getPendingInvitationsForUser = async (email: string) => {
  return await db.query.sessionCollaborators.findMany({
    where: (collaborators, { eq, and, isNull }) =>
      and(
        eq(collaborators.email, email),
        eq(collaborators.status, 'invited'),
        isNull(collaborators.deletedAt),
      ),
    with: {
      sessionItem: {
        with: {
          habitMaster: true,
          session: true, // Relation name is 'session' not 'weeklySession'
        },
      },
    },
    orderBy: (collaborators, { desc }) => [desc(collaborators.invitedAt)],
  });
};
