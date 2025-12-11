import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { insertDailyLogSchema, insertDailyLogProgressSchema } from "./daily-logs.schema";
import {
  getDailyLogs,
  createDailyLogController,
  getDailyLogsProgress,
  createDailyLogProgressController,
} from "./daily-logs.controller";

const app = new Hono();

// Daily Logs
app.get("/", getDailyLogs);
app.post("/", zValidator("json", insertDailyLogSchema), createDailyLogController);

// Daily Logs Progress
app.get("/progress", getDailyLogsProgress);
app.post("/progress", zValidator("json", insertDailyLogProgressSchema), createDailyLogProgressController);

export default app;
