import { eq } from 'drizzle-orm';
import { db } from '../../db';
import { habitMasters, type NewHabitMaster } from './habits.schema';

export const getAllHabitMasters = async () => {
  return await db.select().from(habitMasters);
};

export const getHabitMastersByUserId = async (userId: string) => {
  return await db
    .select()
    .from(habitMasters)
    .where(eq(habitMasters.userId, userId));
};

export const createHabitMaster = async (data: NewHabitMaster) => {
  const result = await db.insert(habitMasters).values(data).returning();
  return result[0];
};
