import {
  boolean,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { users } from '../users/users.schema';

import { z } from '@hono/zod-openapi';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { toOpenApi } from '../../utils/zod-helper';

export const notificationTypeEnum = pgEnum('notification_type', [
  'COLLAB_INVITE',
  'COLLAB_ACCEPTED',
  'SYSTEM_INFO',
]);

export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  type: notificationTypeEnum('type').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  isRead: boolean('is_read').default(false).notNull(),
  metadata: jsonb('metadata'), // { sessionItemId: "...", inviterName: "..." }
  createdAt: timestamp('created_at').defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const insertNotificationSchema = toOpenApi(
  createInsertSchema(notifications),
  {
    description: 'Schema for creating a notification',
  },
);

export const selectNotificationSchema = toOpenApi(
  createSelectSchema(notifications),
  {
    description: 'Schema for selecting a notification',
  },
);

export type Notification = z.infer<typeof selectNotificationSchema>;
export type NewNotification = z.infer<typeof insertNotificationSchema>;
