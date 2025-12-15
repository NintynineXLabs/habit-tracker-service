import type { Context } from 'hono';
import {
  getAllWeeklySessions,
  createWeeklySession,
  getWeeklySessionsByUserId,
  getAllSessionItems,
  getSessionItemsByUserId,
  createSessionItem,
  getAllSessionCollaborators,
  createSessionCollaborator,
} from './sessions.service';
import type {
  NewWeeklySession,
  NewSessionItem,
  NewSessionCollaborator,
} from './sessions.schema';

// Weekly Sessions
export const getWeeklySessions = async (c: Context) => {
  const result = await getAllWeeklySessions();
  return c.json(result, 200);
};

export const getMyWeeklySessions = async (c: Context) => {
  const user = c.get('user');
  const result = await getWeeklySessionsByUserId(user.sub);
  return c.json(result, 200);
};

export const createWeeklySessionController = async (c: Context) => {
  const user = c.get('user');
  const data = await c.req.json();
  const newSession: NewWeeklySession = {
    ...data,
    userId: user.sub,
  };
  const result = await createWeeklySession(newSession);
  return c.json(result, 200);
};

// Session Items
export const getSessionItems = async (c: Context) => {
  const result = await getAllSessionItems();
  return c.json(result, 200);
};

export const getMySessionItems = async (c: Context) => {
  const user = c.get('user');
  const dayOfWeekParam = c.req.query('dayOfWeek');
  const dayOfWeek = dayOfWeekParam ? parseInt(dayOfWeekParam, 10) : undefined;
  const result = await getSessionItemsByUserId(user.sub, dayOfWeek);
  return c.json(result, 200);
};

export const createSessionItemController = async (c: Context) => {
  const data = await c.req.json();
  const result = await createSessionItem(data as NewSessionItem);
  return c.json(result, 200);
};

// Session Collaborators
export const getSessionCollaborators = async (c: Context) => {
  const result = await getAllSessionCollaborators();
  return c.json(result, 200);
};

export const createSessionCollaboratorController = async (c: Context) => {
  const data = await c.req.json();
  const result = await createSessionCollaborator(
    data as NewSessionCollaborator,
  );
  return c.json(result, 200);
};
