import type { Context } from 'hono';
import { getAllUsers, createUser } from './users.service';
import type { NewUser } from './users.schema';

export const getUsers = async (c: Context) => {
  const result = await getAllUsers();
  return c.json(result, 200);
};

export const createUserController = async (c: Context) => {
  const data = await c.req.json();
  const result = await createUser(data as NewUser);
  return c.json(result, 200);
};
