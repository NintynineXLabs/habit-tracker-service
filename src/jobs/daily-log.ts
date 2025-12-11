import { db } from "../db";
import { weeklySessions, sessionItems, dailyLogs, dailyLogsProgress } from "../db/schema";
import { eq } from "drizzle-orm";

export async function generateDailyLogs() {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 (Sunday) to 6 (Saturday)
  const dateStr = today.toISOString().split("T")[0]!; // YYYY-MM-DD

  console.log(`Running daily log generation for day ${dayOfWeek} (${dateStr})...`);

  // 1. Find all weekly sessions for today
  const sessions = await db.select().from(weeklySessions).where(eq(weeklySessions.dayOfWeek, dayOfWeek));

  console.log(`Found ${sessions.length} sessions for today.`);

  for (const session of sessions) {
    // 2. Get items for each session
    const items = await db.select().from(sessionItems).where(eq(sessionItems.sessionId, session.id));

    for (const item of items) {
      // 3. Create daily log entry
      // Check if already exists to avoid duplicates (optional but good practice)
      // For simplicity, we'll just insert. In a real app, you might want a unique constraint or check.

      const [newLog] = await db
        .insert(dailyLogs)
        .values({
          userId: session.userId,
          date: dateStr,
          sessionItemId: item.id,
          habitMasterId: item.habitMasterId,
          sessionName: session.name,
          startTime: item.startTime,
          durationMinutes: item.durationMinutes,
        })
        .returning();

      if (newLog) {
        // 4. Create initial progress entry
        await db.insert(dailyLogsProgress).values({
          dailyLogId: newLog.id,
          isCompleted: false,
          timerSeconds: 0,
        });
      }
    }
  }

  console.log("Daily log generation completed.");
}
