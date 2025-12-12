import type { Context } from 'hono';
import { getAllHabitMasters, createHabitMaster } from './habits.service';
import type { NewHabitMaster } from './habits.schema';

export const getHabitMasters = async (c: Context) => {
  const result = await getAllHabitMasters();
  return c.json(result, 200);
};

export const createHabitMasterController = async (c: Context) => {
  const data = await c.req.json();
  const result = await createHabitMaster(data as NewHabitMaster);
  return c.json(result, 200);
};
