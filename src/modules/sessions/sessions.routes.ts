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
  addCollaboratorController,
  getCollaboratorsController,
  removeCollaboratorController,
  updateCollaboratorStatusController,
  getMyPendingInvitationsController,
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

// Add collaborator by email
const addCollaboratorRoute = createRoute({
  method: 'post',
  path: '/collaborators/invite',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            sessionItemId: z.string().uuid().openapi({
              description: 'Session item ID to add collaborator to',
              example: '123e4567-e89b-12d3-a456-426614174000',
            }),
            email: z.string().email().openapi({
              description: 'Email of the collaborator to invite',
              example: 'collaborator@example.com',
            }),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        'application/json': {
          schema: z.object({
            message: z.string(),
            collaborator: selectSessionCollaboratorSchema,
          }),
        },
      },
      description: 'Collaborator invited successfully',
    },
    200: {
      content: {
        'application/json': {
          schema: z.object({
            message: z.string(),
            collaborator: selectSessionCollaboratorSchema,
          }),
        },
      },
      description: 'Collaborator already exists',
    },
    400: {
      content: {
        'application/json': {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
      description: 'Bad request',
    },
  },
});

app.openapi(addCollaboratorRoute, addCollaboratorController);

// Get collaborators for a session item
const getCollaboratorsRoute = createRoute({
  method: 'get',
  path: '/items/{sessionItemId}/collaborators',
  request: {
    params: z.object({
      sessionItemId: z.string().openapi({
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
            collaborators: z.array(selectSessionCollaboratorSchema),
          }),
        },
      },
      description: 'List of collaborators for the session item',
    },
    400: {
      content: {
        'application/json': {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
      description: 'Bad request',
    },
  },
});

app.openapi(getCollaboratorsRoute, getCollaboratorsController);

// Remove collaborator
const removeCollaboratorRoute = createRoute({
  method: 'delete',
  path: '/collaborators/{collaboratorId}',
  request: {
    params: z.object({
      collaboratorId: z.string().openapi({
        description: 'Collaborator ID to remove',
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
            collaborator: selectSessionCollaboratorSchema,
          }),
        },
      },
      description: 'Collaborator removed successfully',
    },
    400: {
      content: {
        'application/json': {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
      description: 'Bad request',
    },
  },
});

app.openapi(removeCollaboratorRoute, removeCollaboratorController);

// Update collaborator status (accept/reject)
const updateCollaboratorStatusRoute = createRoute({
  method: 'patch',
  path: '/collaborators/{collaboratorId}/status',
  request: {
    params: z.object({
      collaboratorId: z.string().openapi({
        description: 'Collaborator ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
      }),
    }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            status: z.enum(['accepted', 'rejected', 'left']).openapi({
              description: 'New status for the invitation',
              example: 'accepted',
            }),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            collaborator: selectSessionCollaboratorSchema,
          }),
        },
      },
      description: 'Collaborator status updated',
    },
    400: {
      content: {
        'application/json': {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
      description: 'Bad request',
    },
  },
});

app.openapi(updateCollaboratorStatusRoute, updateCollaboratorStatusController);

// Get my pending invitations
const getMyPendingInvitationsRoute = createRoute({
  method: 'get',
  path: '/invitations/pending',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            invitations: z.array(
              selectSessionCollaboratorSchema.extend({
                sessionItem: selectSessionItemSchema
                  .extend({
                    habitMaster: z
                      .object({
                        id: z.string(),
                        name: z.string(),
                        description: z.string().nullable(),
                        iconName: z.string().nullable(),
                        iconBackgroundColor: z.string().nullable(),
                        iconColor: z.string().nullable(),
                      })
                      .nullable(),
                    session: z
                      .object({
                        id: z.string(),
                        name: z.string(),
                        dayOfWeek: z.number(),
                      })
                      .nullable(),
                  })
                  .nullable(),
              }),
            ),
          }),
        },
      },
      description: 'List of pending invitations for the current user',
    },
    400: {
      content: {
        'application/json': {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
      description: 'Bad request',
    },
  },
});

app.openapi(getMyPendingInvitationsRoute, getMyPendingInvitationsController);

export default app;
