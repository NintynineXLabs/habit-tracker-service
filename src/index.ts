import { zValidator } from "@hono/zod-validator";
import { createInsertSchema } from "drizzle-zod";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { db } from "./db";
import {
  dailyLogs,
  dailyLogsProgress,
  habitMasters,
  sessionCollaborators,
  sessionItems,
  users,
  weeklySessions,
} from "./db/schema";

const app = new Hono();

app.use("*", logger());

// Schemas
const insertUserSchema = createInsertSchema(users);
const insertHabitMasterSchema = createInsertSchema(habitMasters);
const insertWeeklySessionSchema = createInsertSchema(weeklySessions);
const insertSessionItemSchema = createInsertSchema(sessionItems);
const insertSessionCollaboratorSchema = createInsertSchema(sessionCollaborators);
const insertDailyLogSchema = createInsertSchema(dailyLogs);
const insertDailyLogProgressSchema = createInsertSchema(dailyLogsProgress);

// Routes

// Users
app.get("/users", async (c) => {
  const result = await db.select().from(users);
  return c.json(result);
});

app.post("/users", zValidator("json", insertUserSchema), async (c) => {
  const data = c.req.valid("json");
  const result = await db.insert(users).values(data).returning();
  return c.json(result[0]);
});

// Habit Masters
app.get("/habit-masters", async (c) => {
  const result = await db.select().from(habitMasters);
  return c.json(result);
});

app.post("/habit-masters", zValidator("json", insertHabitMasterSchema), async (c) => {
  const data = c.req.valid("json");
  const result = await db.insert(habitMasters).values(data).returning();
  return c.json(result[0]);
});

// Weekly Sessions
app.get("/weekly-sessions", async (c) => {
  const result = await db.select().from(weeklySessions);
  return c.json(result);
});

app.post("/weekly-sessions", zValidator("json", insertWeeklySessionSchema), async (c) => {
  const data = c.req.valid("json");
  const result = await db.insert(weeklySessions).values(data).returning();
  return c.json(result[0]);
});

// Session Items
app.get("/session-items", async (c) => {
  const result = await db.select().from(sessionItems);
  return c.json(result);
});

app.post("/session-items", zValidator("json", insertSessionItemSchema), async (c) => {
  const data = c.req.valid("json");
  const result = await db.insert(sessionItems).values(data).returning();
  return c.json(result[0]);
});

// Session Collaborators
app.get("/session-collaborators", async (c) => {
  const result = await db.select().from(sessionCollaborators);
  return c.json(result);
});

app.post("/session-collaborators", zValidator("json", insertSessionCollaboratorSchema), async (c) => {
  const data = c.req.valid("json");
  const result = await db.insert(sessionCollaborators).values(data).returning();
  return c.json(result[0]);
});

// Daily Logs
app.get("/daily-logs", async (c) => {
  const result = await db.select().from(dailyLogs);
  return c.json(result);
});

app.post("/daily-logs", zValidator("json", insertDailyLogSchema), async (c) => {
  const data = c.req.valid("json");
  const result = await db.insert(dailyLogs).values(data).returning();
  return c.json(result[0]);
});

// Daily Logs Progress
app.get("/daily-logs-progress", async (c) => {
  const result = await db.select().from(dailyLogsProgress);
  return c.json(result);
});

app.post("/daily-logs-progress", zValidator("json", insertDailyLogProgressSchema), async (c) => {
  const data = c.req.valid("json");
  const result = await db.insert(dailyLogsProgress).values(data).returning();
  return c.json(result[0]);
});

console.log("Server is running on port 3000");

// Schedule daily log generation at 00:00 every day
import { Cron } from "croner";
import { generateDailyLogs } from "./jobs/daily-log";

new Cron("0 0 * * *", async () => {
  await generateDailyLogs();
});

// Run immediately on startup for testing (optional, remove in production if not needed)
// generateDailyLogs();

export default {
  port: 3000,
  fetch: app.fetch,
};
