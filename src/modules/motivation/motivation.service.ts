import { and, eq, lte, gte, sql, isNull } from 'drizzle-orm';
import { db } from '../../db';
import { motivationalMessages } from './motivation.schema';
import { dailyLogs } from '../../db/schema';

/**
 * Fetches a random motivational message that fits the current progress percentage.
 * Falls back to default messages if no match is found in the database.
 */
export const getDynamicMotivation = async (
  percentage: number,
): Promise<string> => {
  // Query relevant active messages for the percentage range
  const eligibleMessages = await db
    .select()
    .from(motivationalMessages)
    .where(
      and(
        eq(motivationalMessages.isActive, true),
        lte(motivationalMessages.minPercentage, percentage),
        gte(motivationalMessages.maxPercentage, percentage),
      ),
    );

  // Fallback Defaults (if DB is empty or no match found)
  if (eligibleMessages.length === 0) {
    if (percentage === 100) return 'Outstanding! Goal achieved.';
    if (percentage === 0) return "Let's take the first step!";
    return "Keep going! You're making progress.";
  }

  // Random Pick (to provide variety)
  const randomIndex = Math.floor(Math.random() * eligibleMessages.length);
  return eligibleMessages[randomIndex]!.message;
};

/**
 * Calculates the user's daily progress and returns a summary with motivation.
 * Uses dailyLogs as single source of truth for consistency.
 */
export const getDailyProgressSummary = async (userId: string, date: string) => {
  // 1. Calculate Total (all dailyLogs for the day)
  const totalResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(dailyLogs)
    .where(
      and(
        eq(dailyLogs.userId, userId),
        eq(dailyLogs.date, date),
        isNull(dailyLogs.deletedAt),
      ),
    );

  const total = Number(totalResult[0]?.count || 0);

  // 2. Calculate Total Completed
  const completedResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(dailyLogs)
    .where(
      and(
        eq(dailyLogs.userId, userId),
        eq(dailyLogs.date, date),
        eq(dailyLogs.status, 'completed'),
        isNull(dailyLogs.deletedAt),
      ),
    );

  const totalCompleted = Number(completedResult[0]?.count || 0);

  // 3. Calculate Percentage (Safe division)
  const percentage =
    total === 0 ? 0 : Math.round((totalCompleted / total) * 100);

  // 4. Fetch Motivational Message
  const message = await getDynamicMotivation(percentage);

  // 5. Construct Response
  const colorInfo: 'success' | 'info' | 'neutral' =
    percentage === 100 ? 'success' : percentage > 0 ? 'info' : 'neutral';

  return {
    date,
    stats: {
      total,
      completed: totalCompleted,
      remaining: Math.max(0, total - totalCompleted),
      percentage,
    },
    motivation: {
      message,
      colorInfo,
    },
  };
};
