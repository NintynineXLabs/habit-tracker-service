import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import {
  createSessionCollaboratorController,
  createSessionItemController,
  createWeeklySessionController,
  deleteSessionItemController,
  deleteWeeklySessionController,
  getMySessionItems,
  getMyWeeklySessions,
  updateSessionItemController,
  updateWeeklySessionController,
} from './sessions.controller';
import {
  createWeeklySessionRequestSchema,
  insertSessionCollaboratorSchema,
  insertSessionItemSchema,
  selectSessionCollaboratorSchema,
  selectSessionItemSchema,
  selectWeeklySessionSchema,
  selectWeeklySessionWithDetailsSchema,
  updateWeeklySessionRequestSchema,
} from './sessions.schema';

const app = new OpenAPIHono();

// Weekly Sessions
const getMyWeeklySessionsRoute = createRoute({
  method: 'get',
  path: '/weekly/me',
  request: {
    query: z.object({
      dayOfWeek: z.string().optional().openapi({
        description: 'Filter by day of week (0-6, where 0 is Sunday)',
        example: '1',
      }),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.array(selectWeeklySessionWithDetailsSchema),
        },
      },
      description:
        'Retrieve my weekly sessions with full details and optional day filter',
    },
  },
});

app.openapi(getMyWeeklySessionsRoute, getMyWeeklySessions);

const createWeeklySessionRoute = createRoute({
  method: 'post',
  path: '/weekly',
  request: {
    body: {
      content: {
        'application/json': {
          schema: createWeeklySessionRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: selectWeeklySessionSchema,
        },
      },
      description: 'Create a weekly session',
    },
  },
});

app.openapi(createWeeklySessionRoute, createWeeklySessionController);

const updateWeeklySessionRoute = createRoute({
  method: 'patch',
  path: '/weekly/{id}',
  request: {
    params: z.object({
      id: z.string().openapi({
        description: 'Weekly session ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
      }),
    }),
    body: {
      content: {
        'application/json': {
          schema: updateWeeklySessionRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: selectWeeklySessionSchema,
        },
      },
      description: 'Update a weekly session',
    },
  },
});

app.openapi(updateWeeklySessionRoute, updateWeeklySessionController);

const deleteWeeklySessionRoute = createRoute({
  method: 'delete',
  path: '/weekly/{id}',
  request: {
    params: z.object({
      id: z.string().openapi({
        description: 'Weekly session ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
      }),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
          }),
        },
      },
      description: 'Delete a weekly session',
    },
  },
});

app.openapi(deleteWeeklySessionRoute, deleteWeeklySessionController);

// Session Items
const getMySessionItemsRoute = createRoute({
  method: 'get',
  path: '/items/me',
  request: {
    query: z.object({
      dayOfWeek: z.string().optional().openapi({
        description: 'Filter by day of week (0-6, where 0 is Sunday)',
        example: '1',
      }),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.array(
            z.object({
              sessionItem: selectSessionItemSchema,
              weeklySession: selectWeeklySessionSchema,
            }),
          ),
        },
      },
      description: 'Retrieve my session items with optional day of week filter',
    },
  },
});

app.openapi(getMySessionItemsRoute, getMySessionItems);

const createSessionItemRoute = createRoute({
  method: 'post',
  path: '/items',
  request: {
    body: {
      content: {
        'application/json': {
          schema: insertSessionItemSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: selectSessionItemSchema,
        },
      },
      description: 'Create a session item',
    },
  },
});

app.openapi(createSessionItemRoute, createSessionItemController);

const updateSessionItemRoute = createRoute({
  method: 'patch',
  path: '/items/{id}',
  request: {
    params: z.object({
      id: z.string().openapi({
        description: 'Session item ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
      }),
    }),
    body: {
      content: {
        'application/json': {
          schema: insertSessionItemSchema.partial(),
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: selectSessionItemSchema,
        },
      },
      description: 'Update a session item',
    },
  },
});

app.openapi(updateSessionItemRoute, updateSessionItemController);

const deleteSessionItemRoute = createRoute({
  method: 'delete',
  path: '/items/{id}',
  request: {
    params: z.object({
      id: z.string().openapi({
        description: 'Session item ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
      }),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
          }),
        },
      },
      description: 'Delete a session item',
    },
  },
});

app.openapi(deleteSessionItemRoute, deleteSessionItemController);

// Session Collaborators
const createSessionCollaboratorRoute = createRoute({
  method: 'post',
  path: '/collaborators',
  request: {
    body: {
      content: {
        'application/json': {
          schema: insertSessionCollaboratorSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: selectSessionCollaboratorSchema,
        },
      },
      description: 'Create a session collaborator',
    },
  },
});

app.openapi(
  createSessionCollaboratorRoute,
  createSessionCollaboratorController,
);

export default app;
