import type { Context } from 'hono';
import {
  getAllHabitMasters,
  createHabitMaster,
  getHabitMastersByUserId,
} from './habits.service';
import type { NewHabitMaster } from './habits.schema';

export const getHabitMasters = async (c: Context) => {
  const result = await getAllHabitMasters();
  return c.json(result, 200);
};

export const getMyHabitMasters = async (c: Context) => {
  const user = c.get('user');
  const result = await getHabitMastersByUserId(user.sub);
  return c.json(result, 200);
};

export const createHabitMasterController = async (c: Context) => {
  const user = c.get('user');
  const data = await c.req.json();
  const newHabit: NewHabitMaster = {
    ...data,
    userId: user.sub,
  };
  const result = await createHabitMaster(newHabit);
  return c.json(result, 200);
};
