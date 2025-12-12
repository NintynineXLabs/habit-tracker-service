import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import {
  createHabitRequestSchema,
  selectHabitMasterSchema,
} from './habits.schema';
import {
  getHabitMasters,
  createHabitMasterController,
  getMyHabitMasters,
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
      description: 'Retrieve all habit masters',
    },
  },
});

const getMyHabitMastersRoute = createRoute({
  method: 'get',
  path: '/me',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.array(selectHabitMasterSchema),
        },
      },
      description: 'Retrieve my habit masters',
    },
  },
});

app.openapi(getHabitMastersRoute, getHabitMasters);
app.openapi(getMyHabitMastersRoute, getMyHabitMasters);

const createHabitMasterRoute = createRoute({
  method: 'post',
  path: '/',
  request: {
    body: {
      content: {
        'application/json': {
          schema: createHabitRequestSchema,
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
