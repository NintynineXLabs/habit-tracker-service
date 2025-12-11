import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { insertUserSchema } from "./users.schema";
import { getUsers, createUserController } from "./users.controller";

const app = new Hono();

app.get("/", getUsers);
app.post("/", zValidator("json", insertUserSchema), createUserController);

export default app;
