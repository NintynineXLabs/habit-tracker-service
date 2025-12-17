import { pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from '@hono/zod-openapi';
import { toOpenApi } from '../../utils/zod-helper';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  googleId: text('google_id').unique(),
  googleRefreshToken: text('google_refresh_token'),
  refreshToken: text('refresh_token'),
  picture: text('picture'),
});

export const insertUserSchema = toOpenApi(createInsertSchema(users), {
  description: 'Schema for creating a user',
  example: {
    name: 'John Doe',
    email: 'john@example.com',
  },
});

export const selectUserSchema = toOpenApi(createSelectSchema(users), {
  description: 'Schema for selecting a user',
});

export type User = z.infer<typeof selectUserSchema>;
export type NewUser = z.infer<typeof insertUserSchema>;
