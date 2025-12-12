import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import {
  insertDailyLogSchema,
  insertDailyLogProgressSchema,
  selectDailyLogSchema,
  selectDailyLogProgressSchema,
} from './daily-logs.schema';
import {
  getDailyLogs,
  createDailyLogController,
  getDailyLogsProgress,
  createDailyLogProgressController,
} from './daily-logs.controller';

const app = new OpenAPIHono();

// Daily Logs
const getDailyLogsRoute = createRoute({
  method: 'get',
  path: '/',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.array(selectDailyLogSchema),
        },
      },
      description: 'Retrieve daily logs',
    },
  },
});

app.openapi(getDailyLogsRoute, getDailyLogs);

const createDailyLogRoute = createRoute({
  method: 'post',
  path: '/',
  request: {
    body: {
      content: {
        'application/json': {
          schema: insertDailyLogSchema,
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
      description: 'Create a daily log',
    },
  },
});

app.openapi(createDailyLogRoute, createDailyLogController);

// Daily Logs Progress
const getDailyLogsProgressRoute = createRoute({
  method: 'get',
  path: '/progress',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.array(selectDailyLogProgressSchema),
        },
      },
      description: 'Retrieve daily logs progress',
    },
  },
});

app.openapi(getDailyLogsProgressRoute, getDailyLogsProgress);

const createDailyLogProgressRoute = createRoute({
  method: 'post',
  path: '/progress',
  request: {
    body: {
      content: {
        'application/json': {
          schema: insertDailyLogProgressSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: selectDailyLogProgressSchema,
        },
      },
      description: 'Create a daily log progress',
    },
  },
});

app.openapi(createDailyLogProgressRoute, createDailyLogProgressController);

export default app;
