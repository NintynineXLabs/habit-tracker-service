import type { Context } from "hono";
import { getAllUsers, createUser } from "./users.service";
import type { NewUser } from "./users.schema";

export const getUsers = async (c: Context) => {
  const result = await getAllUsers();
  return c.json(result);
};

export const createUserController = async (c: Context) => {
  const data = (c as any).req.valid("json") as NewUser;
  const result = await createUser(data);
  return c.json(result);
};
