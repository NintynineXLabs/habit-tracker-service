import { z } from '@hono/zod-openapi';

// Helper to convert drizzle-zod schema to openapi schema
// We need to wrap it in z.object(schema.shape) to get the .openapi() method
// because drizzle-zod uses standard zod which doesn't have .openapi()
export const toOpenApi = <T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  metadata: any,
) => {
  return z.object(schema.shape).openapi(metadata);
};
