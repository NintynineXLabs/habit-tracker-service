import { and, eq, isNull, sql, gte, lte } from 'drizzle-orm';
import { db } from '../../db';
import { dailyLogs, DAILY_LOG_STATUS } from '../daily-logs/daily-logs.schema';
import {
  sessionItems,
  sessionCollaborators,
} from '../sessions/sessions.schema';
import { habitMasters } from '../habits/habits.schema';
import { users } from '../users/users.schema';
import type {
  ReportMeta,
  WeeklyActivity,
  CategoryDistribution,
  ConsistencyHeatmap,
  WeeklySummaryResponse,
  Achievement,
  StatusBreakdown,
  TimeInsights,
  DailySummaryResponse,
  CollaboratorSummary,
} from './reports.schema';
import {
  getDayName,
  getDateRange,
  getTimePeriod,
  getTimePeriodLabel,
} from '../../utils/date-helper';

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
        eq(dailyLogs.status, DAILY_LOG_STATUS[2]), // 'completed'
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
 * Returns labels, dates, completed counts, total counts, and completion rate
 */
export const getWeeklyActivity = async (
  userId: string,
  referenceDate: string,
): Promise<WeeklyActivity> => {
  // Generate 7 days range
  const dates = getDateRange(referenceDate, 7);
  const startDate = dates[0]!;
  const endDate = dates[dates.length - 1]!;

  // Single optimized query: get total and completed counts per date
  const dailyCounts = await db
    .select({
      date: dailyLogs.date,
      total: sql<number>`count(*)`,
      completed: sql<number>`sum(case when ${dailyLogs.status} = ${DAILY_LOG_STATUS[2]} then 1 else 0 end)`,
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

  // Create a map for quick lookup
  const countMap = new Map<string, { total: number; completed: number }>();
  for (const row of dailyCounts) {
    countMap.set(row.date, {
      total: Number(row.total),
      completed: Number(row.completed),
    });
  }

  // Build response arrays with zero-filling
  const labels: string[] = [];
  const data: number[] = [];
  const total: number[] = [];
  const completionRate: number[] = [];

  for (const dateStr of dates) {
    const date = new Date(dateStr);
    const counts = countMap.get(dateStr);

    labels.push(getDayName(date));
    data.push(counts?.completed || 0);
    total.push(counts?.total || 0);
    completionRate.push(
      counts && counts.total > 0
        ? Math.round((counts.completed / counts.total) * 100)
        : 0,
    );
  }

  return {
    labels,
    dates,
    data,
    total,
    completionRate,
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
        eq(dailyLogs.status, DAILY_LOG_STATUS[2]), // 'completed'
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
  // Generate 30 days range ending at referenceDate
  const dates = getDateRange(referenceDate, 30);
  const startDate = dates[0]!;
  const endDate = dates[dates.length - 1]!;

  // Query total and completed counts per date
  const dailyCounts = await db
    .select({
      date: dailyLogs.date,
      total: sql<number>`count(*)`,
      completed: sql<number>`sum(case when ${dailyLogs.status} = ${DAILY_LOG_STATUS[2]} then 1 else 0 end)`,
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

  // Create a map for quick lookup of query results
  const countMap = new Map<string, { total: number; completed: number }>();
  for (const row of dailyCounts) {
    countMap.set(row.date, {
      total: Number(row.total),
      completed: Number(row.completed),
    });
  }

  // Generate all dates in the range and build the heatmap
  const heatmap: ConsistencyHeatmap = [];

  for (const dateStr of dates) {
    const data = countMap.get(dateStr);

    let percentage = 0;
    if (data && data.total > 0) {
      percentage = Math.round((data.completed / data.total) * 100);
    }

    heatmap.push([dateStr, percentage]);
  }

  return heatmap;
};

/**
 * Get all-time collaborators for a user
 * Returns list of users who have collaborated across all collaborative sessions
 */
const getAllTimeCollaborators = async (
  userId: string,
): Promise<CollaboratorSummary[]> => {
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
        eq(sessionItems.goalType, 'collaborative'),
        eq(sessionCollaborators.status, 'accepted'),
        isNull(dailyLogs.deletedAt),
        isNull(sessionCollaborators.deletedAt),
      ),
    );

  // Group collaborators and count all completed activities together
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
        if (row.status === DAILY_LOG_STATUS[2]) {
          existing.completedTogether++;
        }
      } else {
        collaboratorMap.set(row.collaboratorUserId, {
          id: row.collaboratorUserId,
          name: row.userName || 'Unknown',
          email: row.userEmail || '',
          picture: row.userPicture,
          completedTogether: row.status === DAILY_LOG_STATUS[2] ? 1 : 0,
        });
      }
    }
  }

  return Array.from(collaboratorMap.values());
};

/**
 * Get complete Weekly Summary Report
 */
export const getWeeklySummaryReport = async (
  userId: string,
  date: string,
): Promise<WeeklySummaryResponse> => {
  // Get all sections in parallel
  const [
    weeklyActivity,
    categoryDistribution,
    consistencyHeatmap,
    collaborators,
  ] = await Promise.all([
    getWeeklyActivity(userId, date),
    getCategoryDistribution(userId, date),
    getConsistencyHeatmap(userId, date),
    getAllTimeCollaborators(userId),
  ]);

  return {
    weeklyActivity,
    categoryDistribution,
    consistencyHeatmap,
    collaborators,
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
        eq(dailyLogs.status, DAILY_LOG_STATUS[2]), // 'completed'
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
        eq(dailyLogs.status, DAILY_LOG_STATUS[2]), // 'completed'
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

  return {
    date,
    achievement,
    statusBreakdown,
    timeInsights,
  };
};
