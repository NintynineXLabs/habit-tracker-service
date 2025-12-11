import { z } from "@hono/zod-openapi";
import { selectUserSchema } from "../users/users.schema";

export const googleLoginSchema = z.object({
  token: z.string().openapi({
    description: "Google ID Token",
    example: "eyJhbGciOiJSUzI1NiIsImtpZCI6IjZm...",
  }),
});

export const authResponseSchema = z
  .object({
    token: z.string().openapi({
      description: "JWT Token",
    }),
    user: selectUserSchema,
  })
  .openapi({
    description: "Auth response with JWT and user data",
  });
