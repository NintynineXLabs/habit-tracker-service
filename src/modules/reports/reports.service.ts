import { and, eq, isNull, sql, gte, lte } from 'drizzle-orm';
import { db } from '../../db';
import { dailyLogs } from '../daily-logs/daily-logs.schema';
import {
  sessionItems,
  sessionCollaborators,
} from '../sessions/sessions.schema';
import { habitMasters } from '../habits/habits.schema';
import { users } from '../users/users.schema';
import { getDynamicMotivation } from '../motivation/motivation.service';
import type {
  ReportMeta,
  WeeklyActivity,
  CategoryDistribution,
  ConsistencyHeatmap,
  WeeklySummaryResponse,
  Achievement,
  StatusBreakdown,
  TimeInsights,
  SocialContext,
  DailySummaryResponse,
  CollaboratorSummary,
} from './reports.schema';

// =====================
// HELPER FUNCTIONS
// =====================

/**
 * Day names for labeling
 */
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Format date to YYYY-MM-DD string
 */
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0]!;
};

/**
 * Get the day name from a date
 */
const getDayName = (date: Date): string => {
  return DAY_NAMES[date.getDay()]!;
};

/**
 * Generate array of dates for the last N days (including today)
 */
const getDateRange = (referenceDate: string, days: number): string[] => {
  const dates: string[] = [];
  const refDate = new Date(referenceDate);

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(refDate);
    date.setDate(refDate.getDate() - i);
    dates.push(formatDate(date));
  }

  return dates;
};

/**
 * Determine time period from HH:MM format
 */
const getTimePeriod = (
  time: string,
): 'morning' | 'afternoon' | 'evening' | 'night' => {
  const hour = parseInt(time.split(':')[0] || '0', 10);

  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
};

/**
 * Get label for time period
 */
const getTimePeriodLabel = (
  period: 'morning' | 'afternoon' | 'evening' | 'night',
): string => {
  const labels = {
    morning: 'Pagi (06:00 - 12:00)',
    afternoon: 'Siang (12:00 - 17:00)',
    evening: 'Sore (17:00 - 21:00)',
    night: 'Malam (21:00 - 06:00)',
  };
  return labels[period];
};

// =====================
// WEEKLY SUMMARY SERVICES
// =====================

/**
 * Get Meta information for the report
 * Includes referenceDate, totalCompletedToday, completionRateToday
 */
export const getReportMeta = async (
  userId: string,
  date: string,
): Promise<ReportMeta> => {
  // Get total tasks today
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

  const totalTasks = Number(totalResult[0]?.count || 0);

  // Get completed tasks today
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

  const totalCompletedToday = Number(completedResult[0]?.count || 0);

  // Calculate completion rate
  const completionRateToday =
    totalTasks === 0 ? 0 : Math.round((totalCompletedToday / totalTasks) * 100);

  return {
    referenceDate: date,
    totalCompletedToday,
    completionRateToday,
  };
};

/**
 * Get Weekly Activity data (Rolling 7 days)
 * Returns labels, dates, and data arrays for bar chart
 */
export const getWeeklyActivity = async (
  userId: string,
  referenceDate: string,
): Promise<WeeklyActivity> => {
  // Generate 7 days range
  const dates = getDateRange(referenceDate, 7);
  const startDate = dates[0]!;
  const endDate = dates[dates.length - 1]!;

  // Query completed counts per date
  const completedCounts = await db
    .select({
      date: dailyLogs.date,
      count: sql<number>`count(*)`,
    })
    .from(dailyLogs)
    .where(
      and(
        eq(dailyLogs.userId, userId),
        gte(dailyLogs.date, startDate),
        lte(dailyLogs.date, endDate),
        eq(dailyLogs.status, 'completed'),
        isNull(dailyLogs.deletedAt),
      ),
    )
    .groupBy(dailyLogs.date);

  // Create a map for quick lookup
  const countMap = new Map<string, number>();
  for (const row of completedCounts) {
    countMap.set(row.date, Number(row.count));
  }

  // Build response arrays with zero-filling
  const labels: string[] = [];
  const data: number[] = [];

  for (const dateStr of dates) {
    const date = new Date(dateStr);
    labels.push(getDayName(date));
    data.push(countMap.get(dateStr) || 0);
  }

  return {
    labels,
    dates,
    data,
  };
};

/**
 * Get Category Distribution (Pie Chart data)
 * Groups completed tasks by habit category over the last 7 days
 */
export const getCategoryDistribution = async (
  userId: string,
  referenceDate: string,
): Promise<CategoryDistribution> => {
  // Generate 7 days range
  const dates = getDateRange(referenceDate, 7);
  const startDate = dates[0]!;
  const endDate = dates[dates.length - 1]!;

  // Query category counts with joins
  const categoryCounts = await db
    .select({
      category: habitMasters.category,
      count: sql<number>`count(*)`,
    })
    .from(dailyLogs)
    .innerJoin(sessionItems, eq(dailyLogs.sessionItemId, sessionItems.id))
    .innerJoin(habitMasters, eq(sessionItems.habitMasterId, habitMasters.id))
    .where(
      and(
        eq(dailyLogs.userId, userId),
        gte(dailyLogs.date, startDate),
        lte(dailyLogs.date, endDate),
        eq(dailyLogs.status, 'completed'),
        isNull(dailyLogs.deletedAt),
      ),
    )
    .groupBy(habitMasters.category);

  // Transform to response format with fallback for null category
  const distribution: CategoryDistribution = categoryCounts.map((row) => ({
    name: row.category || 'Uncategorized',
    value: Number(row.count),
  }));

  // Sort by value descending
  distribution.sort((a, b) => b.value - a.value);

  return distribution;
};

/**
 * Get Consistency Heatmap (Calendar Chart data)
 * Returns quality score (0-10) for each day of the current month
 */
export const getConsistencyHeatmap = async (
  userId: string,
  referenceDate: string,
): Promise<ConsistencyHeatmap> => {
  // Get the start and end of the current month
  const refDate = new Date(referenceDate);
  const startOfMonth = new Date(refDate.getFullYear(), refDate.getMonth(), 1);
  const endOfMonth = new Date(refDate.getFullYear(), refDate.getMonth() + 1, 0);

  const startDate = formatDate(startOfMonth);
  const endDate = formatDate(endOfMonth);

  // Query total and completed counts per date
  const dailyCounts = await db
    .select({
      date: dailyLogs.date,
      total: sql<number>`count(*)`,
      completed: sql<number>`sum(case when ${dailyLogs.status} = 'completed' then 1 else 0 end)`,
    })
    .from(dailyLogs)
    .where(
      and(
        eq(dailyLogs.userId, userId),
        gte(dailyLogs.date, startDate),
        lte(dailyLogs.date, endDate),
        isNull(dailyLogs.deletedAt),
      ),
    )
    .groupBy(dailyLogs.date);

  // Calculate score for each day
  const heatmap: ConsistencyHeatmap = [];

  for (const row of dailyCounts) {
    const total = Number(row.total);
    const completed = Number(row.completed);

    // Only include days with tasks
    if (total > 0) {
      const score = Math.round((completed / total) * 10);
      heatmap.push([row.date, score]);
    }
  }

  // Sort by date
  heatmap.sort((a, b) => a[0].localeCompare(b[0]));

  return heatmap;
};

/**
 * Get complete Weekly Summary Report
 */
export const getWeeklySummaryReport = async (
  userId: string,
  date: string,
): Promise<WeeklySummaryResponse> => {
  // Get all sections in parallel
  const [meta, weeklyActivity, categoryDistribution, consistencyHeatmap] =
    await Promise.all([
      getReportMeta(userId, date),
      getWeeklyActivity(userId, date),
      getCategoryDistribution(userId, date),
      getConsistencyHeatmap(userId, date),
    ]);

  return {
    meta,
    weeklyActivity,
    categoryDistribution,
    consistencyHeatmap,
  };
};

// =====================
// DAILY SUMMARY SERVICES
// =====================

/**
 * Get achievement summary for a user on a specific date
 * Includes completion rate and total focus time
 */
export const getAchievementSummary = async (
  userId: string,
  date: string,
): Promise<Achievement> => {
  // Get total tasks count
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

  const totalTasks = Number(totalResult[0]?.count || 0);

  // Get completed tasks count
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

  const completedTasks = Number(completedResult[0]?.count || 0);

  // Get total focus time (sum of durationMinutes)
  const focusResult = await db
    .select({
      total: sql<number>`coalesce(sum(${dailyLogs.durationMinutes}), 0)`,
    })
    .from(dailyLogs)
    .where(
      and(
        eq(dailyLogs.userId, userId),
        eq(dailyLogs.date, date),
        isNull(dailyLogs.deletedAt),
      ),
    );

  const totalFocusMinutes = Number(focusResult[0]?.total || 0);

  // Calculate completion rate
  const completionRate =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return {
    completionRate,
    totalTasks,
    completedTasks,
    totalFocusMinutes,
  };
};

/**
 * Get status breakdown for a user on a specific date
 * Breakdown by status (completed, skipped, failed, etc.) and by type (task, timer)
 */
export const getStatusBreakdown = async (
  userId: string,
  date: string,
): Promise<StatusBreakdown> => {
  // Get counts by status
  const statusCounts = await db
    .select({
      status: dailyLogs.status,
      count: sql<number>`count(*)`,
    })
    .from(dailyLogs)
    .where(
      and(
        eq(dailyLogs.userId, userId),
        eq(dailyLogs.date, date),
        isNull(dailyLogs.deletedAt),
      ),
    )
    .groupBy(dailyLogs.status);

  // Get counts by type
  const typeCounts = await db
    .select({
      type: dailyLogs.sessionItemType,
      count: sql<number>`count(*)`,
    })
    .from(dailyLogs)
    .where(
      and(
        eq(dailyLogs.userId, userId),
        eq(dailyLogs.date, date),
        isNull(dailyLogs.deletedAt),
      ),
    )
    .groupBy(dailyLogs.sessionItemType);

  // Map status counts
  const byStatus = {
    completed: 0,
    skipped: 0,
    failed: 0,
    inprogress: 0,
    pending: 0,
  };

  for (const row of statusCounts) {
    if (row.status && row.status in byStatus) {
      byStatus[row.status as keyof typeof byStatus] = Number(row.count);
    }
  }

  // Map type counts
  const byType = {
    task: 0,
    timer: 0,
  };

  for (const row of typeCounts) {
    if (row.type && row.type in byType) {
      byType[row.type as keyof typeof byType] = Number(row.count);
    }
  }

  return {
    byStatus,
    byType,
  };
};

/**
 * Get time insights for a user on a specific date
 * Includes most productive time and longest activity
 */
export const getTimeInsights = async (
  userId: string,
  date: string,
): Promise<TimeInsights> => {
  // Get completed tasks with start time for productive time analysis
  const completedWithTime = await db
    .select({
      startTime: dailyLogs.startTime,
    })
    .from(dailyLogs)
    .where(
      and(
        eq(dailyLogs.userId, userId),
        eq(dailyLogs.date, date),
        eq(dailyLogs.status, 'completed'),
        isNull(dailyLogs.deletedAt),
      ),
    );

  // Count completions by time period
  const periodCounts: Record<string, number> = {
    morning: 0,
    afternoon: 0,
    evening: 0,
    night: 0,
  };

  for (const row of completedWithTime) {
    if (row.startTime) {
      const period = getTimePeriod(row.startTime);
      if (period in periodCounts) {
        periodCounts[period] = (periodCounts[period] ?? 0) + 1;
      }
    }
  }

  // Find most productive time period
  let mostProductiveTime: 'morning' | 'afternoon' | 'evening' | 'night' | null =
    null;
  let maxCount = 0;

  for (const [period, count] of Object.entries(periodCounts)) {
    if (count > maxCount) {
      maxCount = count;
      mostProductiveTime = period as
        | 'morning'
        | 'afternoon'
        | 'evening'
        | 'night';
    }
  }

  // Get longest activity
  const longestResult = await db
    .select({
      sessionItemId: dailyLogs.sessionItemId,
      durationMinutes: dailyLogs.durationMinutes,
      habitName: habitMasters.name,
    })
    .from(dailyLogs)
    .leftJoin(sessionItems, eq(dailyLogs.sessionItemId, sessionItems.id))
    .leftJoin(habitMasters, eq(sessionItems.habitMasterId, habitMasters.id))
    .where(
      and(
        eq(dailyLogs.userId, userId),
        eq(dailyLogs.date, date),
        isNull(dailyLogs.deletedAt),
      ),
    )
    .orderBy(sql`${dailyLogs.durationMinutes} desc nulls last`)
    .limit(1);

  const longest = longestResult[0];

  return {
    mostProductiveTime,
    mostProductiveTimeLabel: mostProductiveTime
      ? getTimePeriodLabel(mostProductiveTime)
      : null,
    longestActivity:
      longest && longest.durationMinutes
        ? {
            name: longest.habitName || 'Unknown Activity',
            durationMinutes: longest.durationMinutes,
            sessionItemId: longest.sessionItemId,
          }
        : null,
  };
};

/**
 * Get social context for a user on a specific date
 * Includes collaborators worked with and daily motivational quote
 */
export const getSocialContext = async (
  userId: string,
  date: string,
  completionRate: number,
): Promise<SocialContext> => {
  // Find collaborators from completed collaborative tasks
  const collaboratorData = await db
    .select({
      collaboratorUserId: sessionCollaborators.collaboratorUserId,
      userName: users.name,
      userEmail: users.email,
      userPicture: users.picture,
      sessionItemId: dailyLogs.sessionItemId,
      status: dailyLogs.status,
    })
    .from(dailyLogs)
    .innerJoin(sessionItems, eq(dailyLogs.sessionItemId, sessionItems.id))
    .innerJoin(
      sessionCollaborators,
      eq(sessionItems.id, sessionCollaborators.sessionItemId),
    )
    .leftJoin(users, eq(sessionCollaborators.collaboratorUserId, users.id))
    .where(
      and(
        eq(dailyLogs.userId, userId),
        eq(dailyLogs.date, date),
        eq(sessionItems.goalType, 'collaborative'),
        eq(sessionCollaborators.status, 'accepted'),
        isNull(dailyLogs.deletedAt),
        isNull(sessionCollaborators.deletedAt),
      ),
    );

  // Group collaborators and count completed activities together
  const collaboratorMap = new Map<
    string,
    {
      id: string;
      name: string;
      email: string;
      picture: string | null;
      completedTogether: number;
    }
  >();

  for (const row of collaboratorData) {
    if (row.collaboratorUserId && row.collaboratorUserId !== userId) {
      const existing = collaboratorMap.get(row.collaboratorUserId);
      if (existing) {
        if (row.status === 'completed') {
          existing.completedTogether++;
        }
      } else {
        collaboratorMap.set(row.collaboratorUserId, {
          id: row.collaboratorUserId,
          name: row.userName || 'Unknown',
          email: row.userEmail || '',
          picture: row.userPicture,
          completedTogether: row.status === 'completed' ? 1 : 0,
        });
      }
    }
  }

  const collaborators: CollaboratorSummary[] = Array.from(
    collaboratorMap.values(),
  );

  // Get motivational quote based on completion rate
  const dailyQuote = await getDynamicMotivation(completionRate);

  // Determine color info based on completion rate
  const quoteColorInfo: 'success' | 'info' | 'neutral' =
    completionRate === 100
      ? 'success'
      : completionRate > 0
        ? 'info'
        : 'neutral';

  return {
    collaborators,
    dailyQuote,
    quoteColorInfo,
  };
};

/**
 * Get complete daily summary report for a user on a specific date
 */
export const getDailySummaryReport = async (
  userId: string,
  date: string,
): Promise<DailySummaryResponse> => {
  // Get all sections in parallel
  const [achievement, statusBreakdown, timeInsights] = await Promise.all([
    getAchievementSummary(userId, date),
    getStatusBreakdown(userId, date),
    getTimeInsights(userId, date),
  ]);

  // Social context needs completion rate from achievement
  const social = await getSocialContext(
    userId,
    date,
    achievement.completionRate,
  );

  return {
    date,
    achievement,
    statusBreakdown,
    timeInsights,
    social,
  };
};
