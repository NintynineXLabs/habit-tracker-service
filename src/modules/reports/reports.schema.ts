import { z } from '@hono/zod-openapi';
import { toOpenApi } from '../../utils/zod-helper';

// =====================
// WEEKLY SUMMARY SCHEMAS
// =====================

// Meta schema
export const reportMetaSchema = z.object({
  referenceDate: z.string(),
  totalCompletedToday: z.number().int().min(0),
  completionRateToday: z.number().min(0).max(100),
});

// Weekly Activity schema (Bar Chart data)
export const weeklyActivitySchema = z.object({
  labels: z.array(z.string()), // ["Sat", "Sun", "Mon", ...]
  dates: z.array(z.string()), // ["2025-02-18", "2025-02-19", ...]
  data: z.array(z.number().int().min(0)), // [5, 2, 0, 8, ...]
});

// Category Distribution schema (Pie Chart data)
export const categoryItemSchema = z.object({
  name: z.string(),
  value: z.number().int().min(0),
});

export const categoryDistributionSchema = z.array(categoryItemSchema);

// Consistency Heatmap schema (Calendar Chart data)
// Format: [DateString, Score]
export const heatmapItemSchema = z.tuple([
  z.string(),
  z.number().int().min(0).max(10),
]);

export const consistencyHeatmapSchema = z.array(heatmapItemSchema);

// Main Weekly Summary Response Schema
export const weeklySummaryResponseSchema = toOpenApi(
  z.object({
    meta: reportMetaSchema,
    weeklyActivity: weeklyActivitySchema,
    categoryDistribution: categoryDistributionSchema,
    consistencyHeatmap: consistencyHeatmapSchema,
  }),
  {
    description:
      'Weekly Summary Report with meta, activity chart, category distribution, and consistency heatmap',
    example: {
      meta: {
        referenceDate: '2025-02-24',
        totalCompletedToday: 6,
        completionRateToday: 75,
      },
      weeklyActivity: {
        labels: ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        dates: [
          '2025-02-18',
          '2025-02-19',
          '2025-02-20',
          '2025-02-21',
          '2025-02-22',
          '2025-02-23',
          '2025-02-24',
        ],
        data: [5, 2, 0, 8, 4, 6, 6],
      },
      categoryDistribution: [
        { name: 'Work', value: 15 },
        { name: 'Health', value: 8 },
        { name: 'Study', value: 12 },
        { name: 'Other', value: 5 },
      ],
      consistencyHeatmap: [
        ['2025-02-01', 8],
        ['2025-02-02', 5],
        ['2025-02-03', 10],
        ['2025-02-04', 0],
      ],
    },
  },
);

// =====================
// DAILY SUMMARY SCHEMAS
// =====================

// Achievement schema
export const achievementSchema = z.object({
  completionRate: z.number().min(0).max(100),
  totalTasks: z.number().int().min(0),
  completedTasks: z.number().int().min(0),
  totalFocusMinutes: z.number().int().min(0),
});

// Status Breakdown schema
export const statusBreakdownSchema = z.object({
  byStatus: z.object({
    completed: z.number().int().min(0),
    skipped: z.number().int().min(0),
    failed: z.number().int().min(0),
    inprogress: z.number().int().min(0),
    pending: z.number().int().min(0),
  }),
  byType: z.object({
    task: z.number().int().min(0),
    timer: z.number().int().min(0),
  }),
});

// Longest Activity schema
export const longestActivitySchema = z
  .object({
    name: z.string(),
    durationMinutes: z.number().int().min(0),
    sessionItemId: z.string().uuid(),
  })
  .nullable();

// Time Insights schema
export const timeInsightsSchema = z.object({
  mostProductiveTime: z
    .enum(['morning', 'afternoon', 'evening', 'night'])
    .nullable(),
  mostProductiveTimeLabel: z.string().nullable(),
  longestActivity: longestActivitySchema,
});

// Collaborator Summary schema
export const collaboratorSummarySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string(),
  picture: z.string().nullable(),
  completedTogether: z.number().int().min(0),
});

// Social Context schema
export const socialContextSchema = z.object({
  collaborators: z.array(collaboratorSummarySchema),
  dailyQuote: z.string(),
  quoteColorInfo: z.enum(['success', 'info', 'neutral']),
});

// Main Daily Summary Response Schema
export const dailySummaryResponseSchema = toOpenApi(
  z.object({
    date: z.string(),
    achievement: achievementSchema,
    statusBreakdown: statusBreakdownSchema,
    timeInsights: timeInsightsSchema,
    social: socialContextSchema,
  }),
  {
    description:
      'Daily Summary Report with achievement, breakdown, insights, and social context',
    example: {
      date: '2024-12-29',
      achievement: {
        completionRate: 75,
        totalTasks: 8,
        completedTasks: 6,
        totalFocusMinutes: 180,
      },
      statusBreakdown: {
        byStatus: {
          completed: 6,
          skipped: 1,
          failed: 0,
          inprogress: 1,
          pending: 0,
        },
        byType: {
          task: 5,
          timer: 3,
        },
      },
      timeInsights: {
        mostProductiveTime: 'morning',
        mostProductiveTimeLabel: 'Pagi (06:00 - 12:00)',
        longestActivity: {
          name: 'Deep Work Session',
          durationMinutes: 60,
          sessionItemId: '123e4567-e89b-12d3-a456-426614174000',
        },
      },
      social: {
        collaborators: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            name: 'John Doe',
            email: 'john@example.com',
            picture: null,
            completedTogether: 2,
          },
        ],
        dailyQuote: "Great job! You're making progress.",
        quoteColorInfo: 'success',
      },
    },
  },
);

// =====================
// TYPES
// =====================

// Weekly Summary Types
export type ReportMeta = z.infer<typeof reportMetaSchema>;
export type WeeklyActivity = z.infer<typeof weeklyActivitySchema>;
export type CategoryItem = z.infer<typeof categoryItemSchema>;
export type CategoryDistribution = z.infer<typeof categoryDistributionSchema>;
export type HeatmapItem = z.infer<typeof heatmapItemSchema>;
export type ConsistencyHeatmap = z.infer<typeof consistencyHeatmapSchema>;
export type WeeklySummaryResponse = z.infer<typeof weeklySummaryResponseSchema>;

// Daily Summary Types
export type Achievement = z.infer<typeof achievementSchema>;
export type StatusBreakdown = z.infer<typeof statusBreakdownSchema>;
export type TimeInsights = z.infer<typeof timeInsightsSchema>;
export type LongestActivity = z.infer<typeof longestActivitySchema>;
export type CollaboratorSummary = z.infer<typeof collaboratorSummarySchema>;
export type SocialContext = z.infer<typeof socialContextSchema>;
export type DailySummaryResponse = z.infer<typeof dailySummaryResponseSchema>;
