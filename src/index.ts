import { Cron } from "croner";
import { generateDailyLogs } from "./jobs/daily-log";
import app from "./app";

// Schedule daily log generation at 00:00 every day
new Cron("0 0 * * *", async () => {
  await generateDailyLogs();
});

// Run immediately on startup for testing (optional, remove in production if not needed)
// generateDailyLogs();

console.log(`Server is running on port ${process.env.PORT || 8000}`);

export default {
  port: process.env.PORT || 8000,
  fetch: app.fetch,
};
