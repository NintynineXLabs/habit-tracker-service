import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import {
  createDailyLogProgressController,
  getMyDailyLogs,
} from './daily-logs.controller';
import {
  selectDailyLogSchema,
  updateDailyLogProgressSchema,
} from './daily-logs.schema';

const app = new OpenAPIHono();

// Daily Logs
const getMyDailyLogsRoute = createRoute({
  method: 'get',
  path: '/me',
  request: {
    query: z.object({
      date: z.string().optional().openapi({
        description: 'Date in YYYY-MM-DD format',
        example: '2023-01-01',
      }),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.array(selectDailyLogSchema),
        },
      },
      description: 'Retrieve my daily logs',
    },
  },
});

app.openapi(getMyDailyLogsRoute, getMyDailyLogs);

// Daily Logs Progress
const createDailyLogProgressRoute = createRoute({
  method: 'post',
  path: '/progress',
  request: {
    body: {
      content: {
        'application/json': {
          schema: updateDailyLogProgressSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: selectDailyLogSchema,
        },
      },
      description: 'Create a daily log progress',
    },
  },
});

app.openapi(createDailyLogProgressRoute, createDailyLogProgressController);

export default app;
