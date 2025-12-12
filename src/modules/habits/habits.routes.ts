import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import {
  insertHabitMasterSchema,
  selectHabitMasterSchema,
} from './habits.schema';
import {
  getHabitMasters,
  createHabitMasterController,
} from './habits.controller';

const app = new OpenAPIHono();

const getHabitMastersRoute = createRoute({
  method: 'get',
  path: '/',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.array(selectHabitMasterSchema),
        },
      },
      description: 'Retrieve habit masters',
    },
  },
});

app.openapi(getHabitMastersRoute, getHabitMasters);

const createHabitMasterRoute = createRoute({
  method: 'post',
  path: '/',
  request: {
    body: {
      content: {
        'application/json': {
          schema: insertHabitMasterSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: selectHabitMasterSchema,
        },
      },
      description: 'Create a habit master',
    },
  },
});

app.openapi(createHabitMasterRoute, createHabitMasterController);

export default app;
