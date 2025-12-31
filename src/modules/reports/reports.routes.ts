import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import {
  getWeeklySummaryController,
  getDailySummaryController,
} from './reports.controller';
import {
  weeklySummaryResponseSchema,
  dailySummaryResponseSchema,
} from './reports.schema';

const app = new OpenAPIHono();

// GET /reports/weekly - Get weekly summary report
const getWeeklySummaryRoute = createRoute({
  method: 'get',
  path: '/weekly',
  request: {
    query: z.object({
      date: z.string().optional().openapi({
        description: 'Reference date in YYYY-MM-DD format (defaults to today)',
        example: '2025-02-24',
      }),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: weeklySummaryResponseSchema,
        },
      },
      description:
        'Weekly summary report with meta, activity chart, category distribution, and consistency heatmap',
    },
  },
});

// GET /reports/daily - Get daily summary report
const getDailySummaryRoute = createRoute({
  method: 'get',
  path: '/daily',
  request: {
    query: z.object({
      date: z.string().openapi({
        description: 'Date in YYYY-MM-DD format',
        example: '2024-12-29',
      }),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: dailySummaryResponseSchema,
        },
      },
      description:
        'Daily summary report with achievement, breakdown, insights, and social context',
    },
    400: {
      content: {
        'application/json': {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
      description: 'Bad request - date parameter is required',
    },
  },
});

app.openapi(getWeeklySummaryRoute, getWeeklySummaryController);
app.openapi(getDailySummaryRoute, getDailySummaryController);

export default app;
