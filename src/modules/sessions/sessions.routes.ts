import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import {
  createWeeklySessionRequestSchema,
  insertSessionItemSchema,
  insertSessionCollaboratorSchema,
  selectWeeklySessionSchema,
  selectSessionItemSchema,
  selectSessionCollaboratorSchema,
  selectWeeklySessionWithDetailsSchema,
} from './sessions.schema';
import {
  getWeeklySessions,
  getMyWeeklySessions,
  createWeeklySessionController,
  getSessionItems,
  getMySessionItems,
  createSessionItemController,
  getSessionCollaborators,
  createSessionCollaboratorController,
} from './sessions.controller';

const app = new OpenAPIHono();

// Weekly Sessions
const getWeeklySessionsRoute = createRoute({
  method: 'get',
  path: '/weekly',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.array(selectWeeklySessionSchema),
        },
      },
      description: 'Retrieve all weekly sessions',
    },
  },
});

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

app.openapi(getWeeklySessionsRoute, getWeeklySessions);
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

// Session Items
const getSessionItemsRoute = createRoute({
  method: 'get',
  path: '/items',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.array(selectSessionItemSchema),
        },
      },
      description: 'Retrieve session items',
    },
  },
});

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

app.openapi(getSessionItemsRoute, getSessionItems);
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

// Session Collaborators
const getSessionCollaboratorsRoute = createRoute({
  method: 'get',
  path: '/collaborators',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.array(selectSessionCollaboratorSchema),
        },
      },
      description: 'Retrieve session collaborators',
    },
  },
});

app.openapi(getSessionCollaboratorsRoute, getSessionCollaborators);

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
