import { eq } from 'drizzle-orm';
import { db } from '../../db';
import { users, type NewUser } from './users.schema';

export const getAllUsers = async () => {
  return await db.select().from(users);
};

export const getUserById = async (userId: string) => {
  const result = await db.select().from(users).where(eq(users.id, userId));
  return result[0];
};

export const createUser = async (data: NewUser) => {
  const result = await db.insert(users).values(data).returning();
  return result[0];
};
