import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { getDailyProgressSummaryController } from './motivation.controller';

const app = new OpenAPIHono();

// Response schema for the daily progress summary
const dailyProgressSummarySchema = z
  .object({
    date: z.string().openapi({ example: '2023-10-27' }),
    stats: z.object({
      total: z.number().openapi({ example: 5 }),
      completed: z.number().openapi({ example: 3 }),
      remaining: z.number().openapi({ example: 2 }),
      percentage: z.number().openapi({ example: 60 }),
    }),
    motivation: z.object({
      message: z
        .string()
        .openapi({ example: 'Awesome! You are more than halfway there.' }),
      colorInfo: z.enum(['success', 'info', 'neutral']).openapi({
        example: 'info',
        description:
          'UI hint for styling: success (100%), info (1-99%), neutral (0%)',
      }),
    }),
  })
  .openapi({ description: 'Daily progress summary with motivation message' });

const getDailyProgressSummaryRoute = createRoute({
  method: 'get',
  path: '/summary',
  request: {
    query: z.object({
      date: z.string().openapi({
        description: 'Date in YYYY-MM-DD format',
        example: '2023-10-27',
      }),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: dailyProgressSummarySchema,
        },
      },
      description: 'Retrieve daily progress summary with motivational message',
    },
    400: {
      content: {
        'application/json': {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
      description: 'Bad Request - Date is required',
    },
  },
});

app.openapi(getDailyProgressSummaryRoute, getDailyProgressSummaryController);

export default app;
