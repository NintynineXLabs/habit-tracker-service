import type { Context, Next } from "hono";

export const authMiddleware = async (c: Context, next: Next) => {
  // TODO: Implement authentication logic
  await next();
};
