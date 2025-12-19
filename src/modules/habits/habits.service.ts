import { eq, isNull, and } from 'drizzle-orm';
import { db } from '../../db';
import { habitMasters, type NewHabitMaster } from './habits.schema';
import type { UpdateHabitRequest } from './habits.schema';

export const getHabitMastersByUserId = async (userId: string) => {
  return await db
    .select()
    .from(habitMasters)
    .where(
      and(eq(habitMasters.userId, userId), isNull(habitMasters.deletedAt)),
    );
};

export const createHabitMaster = async (data: NewHabitMaster) => {
  const result = await db.insert(habitMasters).values(data).returning();
  return result[0];
};

export const updateHabitMaster = async (
  id: string,
  data: UpdateHabitRequest,
) => {
  const result = await db
    .update(habitMasters)
    .set(data)
    .where(eq(habitMasters.id, id))
    .returning();
  return result[0];
};

export const deleteHabitMaster = async (id: string) => {
  const result = await db
    .update(habitMasters)
    .set({ deletedAt: new Date() })
    .where(eq(habitMasters.id, id))
    .returning();
  return result[0];
};
