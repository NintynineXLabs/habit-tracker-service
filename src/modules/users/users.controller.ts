import type { Context } from 'hono';
import { getAllUsers, createUser, getUserById } from './users.service';
import type { NewUser } from './users.schema';

export const getUsers = async (c: Context) => {
  const result = await getAllUsers();
  return c.json(result, 200);
};

export const getMe = async (c: Context) => {
  const user = c.get('user');
  const result = await getUserById(user.sub);
  if (!result) {
    return c.json({ error: 'User not found' }, 404);
  }
  return c.json(result, 200);
};

export const createUserController = async (c: Context) => {
  const data = await c.req.json();
  const result = await createUser(data as NewUser);
  return c.json(result, 200);
};
