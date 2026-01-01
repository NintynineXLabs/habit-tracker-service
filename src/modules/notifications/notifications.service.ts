import { eq, desc, and, count } from 'drizzle-orm';
import { db } from '../../db';
import { notifications } from './notifications.schema';

export type NewNotification = typeof notifications.$inferInsert;

export const createNotification = async (data: NewNotification) => {
  const result = await db.insert(notifications).values(data).returning();
  return result[0];
};

export interface PaginationOptions {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

export const getUserNotifications = async (
  userId: string,
  options: PaginationOptions = {},
) => {
  const { page = 1, limit = 10, unreadOnly = false } = options;
  const offset = (page - 1) * limit;

  const whereCondition = unreadOnly
    ? and(eq(notifications.userId, userId), eq(notifications.isRead, false))
    : eq(notifications.userId, userId);

  // Get total count
  const totalResult = await db
    .select({ count: count() })
    .from(notifications)
    .where(whereCondition);
  const total = totalResult[0]?.count || 0;

  // Get paginated data
  const data = await db
    .select()
    .from(notifications)
    .where(whereCondition)
    .orderBy(desc(notifications.createdAt))
    .limit(limit)
    .offset(offset);

  const hasMore = offset + data.length < total;

  return {
    data,
    meta: {
      page,
      limit,
      total,
      hasMore,
      nextPage: hasMore ? page + 1 : null,
    },
  };
};

export const markNotificationAsRead = async (id: number, userId: string) => {
  const result = await db
    .update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
    .returning();
  return result[0];
};

export const getUnreadCount = async (userId: string) => {
  const result = await db
    .select({ count: count() })
    .from(notifications)
    .where(
      and(eq(notifications.userId, userId), eq(notifications.isRead, false)),
    );
  return result[0]?.count || 0;
};

export const markAllNotificationsAsRead = async (userId: string) => {
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(
      and(eq(notifications.userId, userId), eq(notifications.isRead, false)),
    );
};

// Optional: Delete old notifications (cleanup)
export const deleteOldNotifications = async (_days: number = 30) => {
  // Implementation for cleanup if needed later
};
