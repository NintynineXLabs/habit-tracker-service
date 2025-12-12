import type { Context } from 'hono';
import {
  getAllWeeklySessions,
  createWeeklySession,
  getAllSessionItems,
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

export const createWeeklySessionController = async (c: Context) => {
  const data = await c.req.json();
  const result = await createWeeklySession(data as NewWeeklySession);
  return c.json(result, 200);
};

// Session Items
export const getSessionItems = async (c: Context) => {
  const result = await getAllSessionItems();
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
