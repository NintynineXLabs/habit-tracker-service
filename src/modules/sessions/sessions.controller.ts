import type { Context } from "hono";
import {
  getAllWeeklySessions,
  createWeeklySession,
  getAllSessionItems,
  createSessionItem,
  getAllSessionCollaborators,
  createSessionCollaborator,
} from "./sessions.service";
import type { NewWeeklySession, NewSessionItem, NewSessionCollaborator } from "./sessions.schema";

// Weekly Sessions
export const getWeeklySessions = async (c: Context) => {
  const result = await getAllWeeklySessions();
  return c.json(result);
};

export const createWeeklySessionController = async (c: Context) => {
  const data = (c as any).req.valid("json") as NewWeeklySession;
  const result = await createWeeklySession(data);
  return c.json(result);
};

// Session Items
export const getSessionItems = async (c: Context) => {
  const result = await getAllSessionItems();
  return c.json(result);
};

export const createSessionItemController = async (c: Context) => {
  const data = (c as any).req.valid("json") as NewSessionItem;
  const result = await createSessionItem(data);
  return c.json(result);
};

// Session Collaborators
export const getSessionCollaborators = async (c: Context) => {
  const result = await getAllSessionCollaborators();
  return c.json(result);
};

export const createSessionCollaboratorController = async (c: Context) => {
  const data = (c as any).req.valid("json") as NewSessionCollaborator;
  const result = await createSessionCollaborator(data);
  return c.json(result);
};
