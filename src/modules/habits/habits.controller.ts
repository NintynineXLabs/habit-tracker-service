import type { Context } from 'hono';
import {
  getAllHabitMasters,
  createHabitMaster,
  getHabitMastersByUserId,
  updateHabitMaster,
  deleteHabitMaster,
} from './habits.service';
import type { NewHabitMaster, UpdateHabitRequest } from './habits.schema';

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

export const updateHabitMasterController = async (c: Context) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const data: UpdateHabitRequest = await c.req.json();

  // Get the existing habit to verify ownership
  const habits = await getHabitMastersByUserId(user.sub);
  const habit = habits.find((h) => h.id === id);

  if (!habit) {
    return c.json({ error: 'Habit not found or unauthorized' }, 404);
  }

  const result = await updateHabitMaster(id, data);
  return c.json(result, 200);
};

export const deleteHabitMasterController = async (c: Context) => {
  const user = c.get('user');
  const id = c.req.param('id');

  // Get the existing habit to verify ownership
  const habits = await getHabitMastersByUserId(user.sub);
  const habit = habits.find((h) => h.id === id);

  if (!habit) {
    return c.json({ error: 'Habit not found or unauthorized' }, 404);
  }

  await deleteHabitMaster(id);
  return c.json({ message: 'Habit deleted successfully' }, 200);
};
