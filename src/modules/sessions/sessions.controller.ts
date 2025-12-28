import type { Context } from 'hono';
import {
  createWeeklySession,
  updateWeeklySession,
  deleteWeeklySession,
  getWeeklySessionsByUserId,
  getSessionItemsByUserId,
  createSessionItem,
  updateSessionItem,
  deleteSessionItem,
  createSessionCollaborator,
} from './sessions.service';
import type {
  NewWeeklySession,
  NewSessionItem,
  NewSessionCollaborator,
} from './sessions.schema';

export const getMyWeeklySessions = async (c: Context) => {
  const user = c.get('user');
  const dayOfWeekParam = c.req.query('dayOfWeek');
  const dayOfWeek = dayOfWeekParam ? parseInt(dayOfWeekParam, 10) : undefined;
  const result = await getWeeklySessionsByUserId(user.sub, dayOfWeek);
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

export const updateWeeklySessionController = async (c: Context) => {
  const id = c.req.param('id');
  const data = await c.req.json();
  const result = await updateWeeklySession(id, data);
  return c.json(result, 200);
};

export const deleteWeeklySessionController = async (c: Context) => {
  const id = c.req.param('id');
  await deleteWeeklySession(id);
  return c.json({ success: true }, 200);
};

// Session Items
export const getMySessionItems = async (c: Context) => {
  const user = c.get('user');
  const dayOfWeekParam = c.req.query('dayOfWeek');
  const dayOfWeek = dayOfWeekParam ? parseInt(dayOfWeekParam, 10) : undefined;
  const result = await getSessionItemsByUserId(user.sub, dayOfWeek);
  return c.json(result, 200);
};

export const createSessionItemController = async (c: Context) => {
  const user = c.get('user');
  const data = await c.req.json();
  const result = await createSessionItem(data as NewSessionItem, {
    userId: user.sub,
    email: user.email,
  });
  return c.json(result, 200);
};

export const updateSessionItemController = async (c: Context) => {
  const id = c.req.param('id');
  const data = await c.req.json();
  const result = await updateSessionItem(id, data);
  return c.json(result, 200);
};

export const deleteSessionItemController = async (c: Context) => {
  const id = c.req.param('id');
  await deleteSessionItem(id);
  return c.json({ success: true }, 200);
};

// Session Collaborators
export const createSessionCollaboratorController = async (c: Context) => {
  const data = await c.req.json();
  const result = await createSessionCollaborator(
    data as NewSessionCollaborator,
  );
  return c.json(result, 200);
};
