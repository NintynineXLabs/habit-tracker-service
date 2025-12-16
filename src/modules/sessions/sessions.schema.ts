import { pgTable, text, integer, uuid } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from '@hono/zod-openapi';
import { users } from '../users/users.schema';
import { habitMasters } from '../habits/habits.schema';
import { toOpenApi } from '../../utils/zod-helper';

export const weeklySessions = pgTable('weekly_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  name: text('name').notNull(),
  description: text('description'),
  dayOfWeek: integer('day_of_week').notNull(),
});

export const sessionItems = pgTable('session_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id')
    .references(() => weeklySessions.id)
    .notNull(),
  habitMasterId: uuid('habit_master_id')
    .references(() => habitMasters.id)
    .notNull(),
  startTime: text('start_time').notNull(),
  durationMinutes: integer('duration_minutes').notNull(),
  type: text('type').notNull(),
});

export const sessionCollaborators = pgTable('session_collaborators', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionItemId: uuid('session_item_id')
    .references(() => sessionItems.id)
    .notNull(),
  collaboratorUserId: uuid('collaborator_user_id')
    .references(() => users.id)
    .notNull(),
});

export const insertWeeklySessionSchema = toOpenApi(
  createInsertSchema(weeklySessions),
  {
    description: 'Schema for inserting a weekly session (internal)',
  },
);

export const createWeeklySessionRequestSchema = toOpenApi(
  createInsertSchema(weeklySessions).omit({ userId: true }),
  {
    description: 'Schema for creating a weekly session request',
    example: {
      name: 'Morning Routine',
      description: 'My morning routine',
      dayOfWeek: 1,
    },
  },
);

export const updateWeeklySessionRequestSchema = toOpenApi(
  createInsertSchema(weeklySessions).omit({ userId: true, id: true }).partial(),
  {
    description: 'Schema for updating a weekly session request',
    example: {
      name: 'Updated Morning Routine',
      description: 'Updated description',
      dayOfWeek: 2,
    },
  },
);

export const selectWeeklySessionSchema = toOpenApi(
  createSelectSchema(weeklySessions),
  {
    description: 'Schema for selecting a weekly session',
  },
);

export const insertSessionItemSchema = toOpenApi(
  createInsertSchema(sessionItems),
  {
    description: 'Schema for creating a session item',
    example: {
      sessionId: '123e4567-e89b-12d3-a456-426614174000',
      habitMasterId: '123e4567-e89b-12d3-a456-426614174000',
      startTime: '08:00',
      durationMinutes: 30,
      type: 'fixed',
    },
  },
);

export const selectSessionItemSchema = toOpenApi(
  createSelectSchema(sessionItems),
  {
    description: 'Schema for selecting a session item',
  },
);

export const insertSessionCollaboratorSchema = toOpenApi(
  createInsertSchema(sessionCollaborators),
  {
    description: 'Schema for creating a session collaborator',
    example: {
      sessionItemId: '123e4567-e89b-12d3-a456-426614174000',
      collaboratorUserId: '123e4567-e89b-12d3-a456-426614174000',
    },
  },
);

export const selectSessionCollaboratorSchema = toOpenApi(
  createSelectSchema(sessionCollaborators),
  {
    description: 'Schema for selecting a session collaborator',
  },
);

export type WeeklySession = z.infer<typeof selectWeeklySessionSchema>;
export type NewWeeklySession = typeof weeklySessions.$inferInsert;

export type SessionItem = z.infer<typeof selectSessionItemSchema>;
export type NewSessionItem = z.infer<typeof insertSessionItemSchema>;

export type SessionCollaborator = z.infer<
  typeof selectSessionCollaboratorSchema
>;
export type NewSessionCollaborator = z.infer<
  typeof insertSessionCollaboratorSchema
>;

// Schema for weekly sessions with full nested data
export const selectWeeklySessionWithDetailsSchema = toOpenApi(
  selectWeeklySessionSchema.extend({
    sessionItems: z.array(
      selectSessionItemSchema.extend({
        habitMaster: z
          .object({
            id: z.string(),
            name: z.string(),
            description: z.string().nullable(),
            category: z.string().nullable(),
            iconName: z.string().nullable(),
            iconBackgroundColor: z.string().nullable(),
            iconColor: z.string().nullable(),
          })
          .nullable(),
        collaborators: z.array(
          selectSessionCollaboratorSchema.extend({
            collaboratorUser: z
              .object({
                id: z.string(),
                name: z.string(),
                email: z.string(),
                picture: z.string().nullable(),
              })
              .nullable(),
          }),
        ),
      }),
    ),
  }),
  {
    description:
      'Schema for selecting a weekly session with all nested details',
  },
);
