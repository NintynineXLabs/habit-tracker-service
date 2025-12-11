import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { insertHabitMasterSchema } from "./habits.schema";
import { getHabitMasters, createHabitMasterController } from "./habits.controller";

const app = new Hono();

app.get("/", getHabitMasters);
app.post("/", zValidator("json", insertHabitMasterSchema), createHabitMasterController);

export default app;
