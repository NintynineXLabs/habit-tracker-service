import { z } from '@hono/zod-openapi';
import { selectUserSchema } from '../users/users.schema';

export const googleLoginSchema = z.object({
  token: z.string().optional().openapi({
    description: 'Google ID Token',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjZm...',
  }),
  code: z.string().optional().openapi({
    description: 'Google Authorization Code',
    example: '4/0A...',
  }),
});

export const authResponseSchema = z
  .object({
    accessToken: z.string().openapi({
      description: 'Access JWT Token',
    }),
    refreshToken: z.string().openapi({
      description: 'Refresh JWT Token',
    }),
    user: selectUserSchema,
  })
  .openapi({
    description: 'Auth response with tokens and user data',
  });

export const refreshTokenSchema = z.object({
  refreshToken: z.string().openapi({
    description: 'Refresh Token',
  }),
});

export const refreshResponseSchema = z.object({
  accessToken: z.string().openapi({
    description: 'New Access JWT Token',
  }),
});
