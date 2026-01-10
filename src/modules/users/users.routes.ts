import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import {
  insertUserSchema,
  selectUserSchema,
  updateUserSchema,
} from './users.schema';
import {
  getUsers,
  createUserController,
  getMe,
  updateUserController,
  getPublicProfileController,
} from './users.controller';

const app = new OpenAPIHono();

const getUsersRoute = createRoute({
  method: 'get',
  path: '/',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.array(selectUserSchema),
        },
      },
      description: 'Retrieve all users',
    },
  },
});

const getMeRoute = createRoute({
  method: 'get',
  path: '/me',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: selectUserSchema,
        },
      },
      description: 'Retrieve my profile',
    },
    404: {
      description: 'User not found',
    },
  },
});

const updateUserRoute = createRoute({
  method: 'patch',
  path: '/me',
  request: {
    body: {
      content: {
        'application/json': {
          schema: updateUserSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: selectUserSchema,
        },
      },
      description: 'Update my profile',
    },
  },
});

app.openapi(getUsersRoute, getUsers);
app.openapi(getMeRoute, getMe);
app.openapi(updateUserRoute, updateUserController);

const getPublicProfileRoute = createRoute({
  method: 'get',
  path: '/:id/public',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: selectUserSchema,
        },
      },
      description: 'Retrieve public profile',
    },
    404: {
      description: 'User not found',
    },
  },
});

app.openapi(getPublicProfileRoute, getPublicProfileController);

const createUserRoute = createRoute({
  method: 'post',
  path: '/',
  request: {
    body: {
      content: {
        'application/json': {
          schema: insertUserSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: selectUserSchema,
        },
      },
      description: 'Create a user',
    },
  },
});

app.openapi(createUserRoute, createUserController);

export default app;
