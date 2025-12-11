import { Hono } from "hono";
import { logger } from "hono/logger";
import usersRoutes from "./modules/users/users.routes";
import habitsRoutes from "./modules/habits/habits.routes";
import sessionsRoutes from "./modules/sessions/sessions.routes";
import dailyLogsRoutes from "./modules/daily-logs/daily-logs.routes";
import authRoutes from "./modules/auth/auth.routes";
import { authMiddleware } from "./middlewares/auth.middleware";

const app = new Hono();

app.use("*", logger());

// Mount Auth Module (Public)
app.route("/auth", authRoutes);

// Apply Auth Middleware to Protected Routes
app.use("/*", async (c, next) => {
  if (c.req.path.startsWith("/auth") || c.req.path === "/health") {
    await next();
  } else {
    await authMiddleware(c, next);
  }
});

// Mount Modules
app.route("/users", usersRoutes);
app.route("/habit-masters", habitsRoutes);
app.route("/sessions", sessionsRoutes); // Note: This will prefix /sessions/weekly, /sessions/items, etc.
app.route("/daily-logs", dailyLogsRoutes);

export default app;
