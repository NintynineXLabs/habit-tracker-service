import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { insertWeeklySessionSchema, insertSessionItemSchema, insertSessionCollaboratorSchema } from "./sessions.schema";
import {
  getWeeklySessions,
  createWeeklySessionController,
  getSessionItems,
  createSessionItemController,
  getSessionCollaborators,
  createSessionCollaboratorController,
} from "./sessions.controller";

const app = new Hono();

// Weekly Sessions
app.get("/weekly", getWeeklySessions);
app.post("/weekly", zValidator("json", insertWeeklySessionSchema), createWeeklySessionController);

// Session Items
app.get("/items", getSessionItems);
app.post("/items", zValidator("json", insertSessionItemSchema), createSessionItemController);

// Session Collaborators
app.get("/collaborators", getSessionCollaborators);
app.post("/collaborators", zValidator("json", insertSessionCollaboratorSchema), createSessionCollaboratorController);

export default app;
