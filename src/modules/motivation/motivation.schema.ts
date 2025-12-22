import {
  pgTable,
  text,
  integer,
  uuid,
  boolean,
  timestamp,
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from '@hono/zod-openapi';
import { toOpenApi } from '../../utils/zod-helper';

// Table Definition
export const motivationalMessages = pgTable('motivational_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  message: text('message').notNull(),
  minPercentage: integer('min_percentage').notNull().default(0),
  maxPercentage: integer('max_percentage').notNull().default(100),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Zod Schemas for Validation & OpenAPI
export const insertMotivationSchema = toOpenApi(
  createInsertSchema(motivationalMessages),
  {
    description: 'Schema to add a new motivational message',
    example: {
      message: 'Great job! You are halfway there.',
      minPercentage: 40,
      maxPercentage: 60,
    },
  },
);

export const selectMotivationSchema = toOpenApi(
  createSelectSchema(motivationalMessages),
  {
    description: 'Schema for selecting a motivational message',
  },
);

export type MotivationalMessage = z.infer<typeof selectMotivationSchema>;
export type NewMotivationalMessage = z.infer<typeof insertMotivationSchema>;
