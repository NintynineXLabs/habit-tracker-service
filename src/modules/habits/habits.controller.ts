import type { Context } from "hono";
import { getAllHabitMasters, createHabitMaster } from "./habits.service";
import type { NewHabitMaster } from "./habits.schema";

export const getHabitMasters = async (c: Context) => {
  const result = await getAllHabitMasters();
  return c.json(result);
};

export const createHabitMasterController = async (c: Context) => {
  const data = (c as any).req.valid("json") as NewHabitMaster;
  const result = await createHabitMaster(data);
  return c.json(result);
};
