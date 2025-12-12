import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import {
  insertWeeklySessionSchema,
  insertSessionItemSchema,
  insertSessionCollaboratorSchema,
  selectWeeklySessionSchema,
  selectSessionItemSchema,
  selectSessionCollaboratorSchema,
} from './sessions.schema';
import {
  getWeeklySessions,
  createWeeklySessionController,
  getSessionItems,
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
      description: 'Retrieve weekly sessions',
    },
  },
});

app.openapi(getWeeklySessionsRoute, getWeeklySessions);

const createWeeklySessionRoute = createRoute({
  method: 'post',
  path: '/weekly',
  request: {
    body: {
      content: {
        'application/json': {
          schema: insertWeeklySessionSchema,
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

app.openapi(getSessionItemsRoute, getSessionItems);

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
