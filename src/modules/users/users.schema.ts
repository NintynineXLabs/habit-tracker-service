import { pgTable, text, uuid, boolean } from 'drizzle-orm/pg-core';
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
  isPublic: boolean('is_public').default(false),
  bio: text('bio'),
});

export const insertUserSchema = toOpenApi(createInsertSchema(users), {
  description: 'Schema for creating a user',
  example: {
    name: 'John Doe',
    email: 'john@example.com',
  },
});

export const updateUserSchema = toOpenApi(
  createInsertSchema(users).partial().pick({
    name: true,
    picture: true,
    isPublic: true,
    bio: true,
  }),
  {
    description: 'Schema for updating a user',
    example: {
      isPublic: true,
      bio: 'Hello world',
    },
  },
);

export const selectUserSchema = toOpenApi(createSelectSchema(users), {
  description: 'Schema for selecting a user',
});

export type User = z.infer<typeof selectUserSchema>;
export type NewUser = z.infer<typeof insertUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
