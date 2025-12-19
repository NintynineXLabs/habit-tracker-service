import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import {
  createDailyLogController,
  createDailyLogProgressController,
  getMyDailyLogs,
} from './daily-logs.controller';
import {
  createDailyLogRequestSchema,
  insertDailyLogProgressSchema,
  selectDailyLogProgressSchema,
  selectDailyLogSchema,
} from './daily-logs.schema';

const app = new OpenAPIHono();

// Daily Logs
const getMyDailyLogsRoute = createRoute({
  method: 'get',
  path: '/me',
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

const createDailyLogRoute = createRoute({
  method: 'post',
  path: '/',
  request: {
    body: {
      content: {
        'application/json': {
          schema: createDailyLogRequestSchema,
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
