import { pgTable, text, uuid, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from '@hono/zod-openapi';
import { users } from '../users/users.schema';
import { toOpenApi } from '../../utils/zod-helper';

export const habitMasters = pgTable('habit_masters', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category'),
  iconName: text('icon_name'),
  iconBackgroundColor: text('icon_background_color'),
  iconColor: text('icon_color'),
  deletedAt: timestamp('deleted_at'),
});

export const insertHabitMasterSchema = toOpenApi(
  createInsertSchema(habitMasters),
  {
    description: 'Schema for inserting a habit master (internal)',
  },
);

export const createHabitRequestSchema = toOpenApi(
  createInsertSchema(habitMasters).omit({ userId: true }),
  {
    description: 'Schema for creating a habit master request',
    example: {
      name: 'Reading',
      description: 'Read a book for 30 minutes',
      category: 'Personal Development',
      iconName: 'target',
      iconBackgroundColor: '#6366f1',
      iconColor: '#ffffff',
    },
  },
);

export const selectHabitMasterSchema = toOpenApi(
  createSelectSchema(habitMasters),
  {
    description: 'Schema for selecting a habit master',
  },
);

export type HabitMaster = z.infer<typeof selectHabitMasterSchema>;
export type NewHabitMaster = typeof habitMasters.$inferInsert;
export type UpdateHabitRequest = Partial<Omit<NewHabitMaster, 'userId'>>;

export const habitTemplates = pgTable('habit_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category'),
  iconName: text('icon_name'),
  iconBackgroundColor: text('icon_background_color'),
  iconColor: text('icon_color'),
  deletedAt: timestamp('deleted_at'),
});

export const templateItems = pgTable('template_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  templateId: uuid('template_id')
    .references(() => habitTemplates.id)
    .notNull(),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category'),
  iconName: text('icon_name'),
  iconBackgroundColor: text('icon_background_color'),
  iconColor: text('icon_color'),
  deletedAt: timestamp('deleted_at'),
});

export const selectHabitTemplateSchema = toOpenApi(
  createSelectSchema(habitTemplates, {
    deletedAt: z.string().nullable(),
  }),
  {
    description: 'Schema for selecting a habit template',
  },
);

export const selectTemplateItemSchema = toOpenApi(
  createSelectSchema(templateItems, {
    deletedAt: z.string().nullable(),
  }),
  {
    description: 'Schema for selecting a template item',
  },
);

export type HabitTemplate = z.infer<typeof selectHabitTemplateSchema>;
export type TemplateItem = z.infer<typeof selectTemplateItemSchema>;
