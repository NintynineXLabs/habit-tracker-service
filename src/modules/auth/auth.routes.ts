import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { googleLogin, refreshAppToken } from './auth.controller';
import {
  googleLoginSchema,
  authResponseSchema,
  refreshTokenSchema,
  refreshResponseSchema,
} from './auth.schema';

const app = new OpenAPIHono();

const googleLoginRoute = createRoute({
  method: 'post',
  path: '/google',
  request: {
    body: {
      content: {
        'application/json': {
          schema: googleLoginSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: authResponseSchema,
        },
      },
      description: 'Google Login',
    },
    400: {
      description: 'Bad Request',
    },
    401: {
      description: 'Unauthorized',
    },
  },
});

const refreshRoute = createRoute({
  method: 'post',
  path: '/refresh',
  request: {
    body: {
      content: {
        'application/json': {
          schema: refreshTokenSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: refreshResponseSchema,
        },
      },
      description: 'Refresh Token',
    },
    400: {
      description: 'Bad Request',
    },
    401: {
      description: 'Unauthorized',
    },
  },
});

app.openapi(googleLoginRoute, googleLogin);
app.openapi(refreshRoute, refreshAppToken);

export default app;
