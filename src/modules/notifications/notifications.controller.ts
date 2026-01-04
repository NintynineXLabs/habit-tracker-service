import type { Context } from 'hono';
import * as notificationService from './notifications.service';

export const getNotifications = async (c: Context) => {
  const user = c.get('user');
  const unreadOnly = c.req.query('unreadOnly') === 'true';
  const page = parseInt(c.req.query('page') || '1', 10);
  const limit = parseInt(c.req.query('limit') || '10', 10);

  const result = await notificationService.getUserNotifications(user.sub, {
    page,
    limit,
    unreadOnly,
  });
  return c.json(result, 200);
};

export const markAsRead = async (c: Context) => {
  const user = c.get('user');
  const id = parseInt(c.req.param('id'));

  if (isNaN(id)) {
    return c.json({ error: 'Invalid ID' }, 400);
  }

  await notificationService.markNotificationAsRead(id, user.sub);
  return c.json({ success: true });
};

export const getUnreadCount = async (c: Context) => {
  const user = c.get('user');
  const count = await notificationService.getUnreadCount(user.sub);
  return c.json({ data: { count } }, 200);
};

export const markAllAsRead = async (c: Context) => {
  const user = c.get('user');
  await notificationService.markAllNotificationsAsRead(user.sub);
  return c.json({ message: 'All notifications marked as read' }, 200);
};

export const deleteNotification = async (c: Context) => {
  const user = c.get('user');
  const id = parseInt(c.req.param('id'));

  if (isNaN(id)) {
    return c.json({ error: 'Invalid ID' }, 400);
  }

  await notificationService.deleteNotification(id, user.sub);
  return c.json({ success: true });
};

export const deleteAllNotifications = async (c: Context) => {
  const user = c.get('user');
  await notificationService.deleteAllNotifications(user.sub);
  return c.json({ success: true }, 200);
};
