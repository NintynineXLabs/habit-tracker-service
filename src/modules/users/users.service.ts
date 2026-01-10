import { eq } from 'drizzle-orm';
import { db } from '../../db';
import { users, type NewUser, type UpdateUser } from './users.schema';

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

export const updateUser = async (userId: string, data: UpdateUser) => {
  const result = await db
    .update(users)
    .set(data)
    .where(eq(users.id, userId))
    .returning();
  return result[0];
};

export const getPublicProfile = async (userId: string) => {
  const user = await getUserById(userId);
  if (!user) return null;

  if (!user.isPublic) {
    return {
      id: user.id,
      name: user.name,
      picture: user.picture,
      isPublic: false,
    };
  }

  return {
    ...user,
    isPublic: true,
  };
};
