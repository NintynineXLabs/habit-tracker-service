import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import {
  createHabitRequestSchema,
  selectHabitMasterSchema,
} from './habits.schema';
import {
  getHabitMasters,
  createHabitMasterController,
  getMyHabitMasters,
  updateHabitMasterController,
  deleteHabitMasterController,
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

const updateHabitMasterRoute = createRoute({
  method: 'put',
  path: '/{id}',
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
    body: {
      content: {
        'application/json': {
          schema: createHabitRequestSchema.partial(),
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
      description: 'Update a habit master',
    },
    404: {
      description: 'Habit not found or unauthorized',
    },
  },
});

app.openapi(updateHabitMasterRoute, updateHabitMasterController);

const deleteHabitMasterRoute = createRoute({
  method: 'delete',
  path: '/{id}',
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
      description: 'Habit deleted successfully',
    },
    404: {
      description: 'Habit not found or unauthorized',
    },
  },
});

app.openapi(deleteHabitMasterRoute, deleteHabitMasterController);

export default app;
