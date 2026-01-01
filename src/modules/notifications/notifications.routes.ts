import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { selectNotificationSchema } from './notifications.schema';
import {
  getNotifications,
  getUnreadCount,
  markAllAsRead,
  markAsRead,
} from './notifications.controller';

const app = new OpenAPIHono();

const getNotificationsRoute = createRoute({
  method: 'get',
  path: '/',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            data: z.array(selectNotificationSchema),
          }),
        },
      },
      description: 'Retrieve all notifications for the current user',
    },
  },
});

const markAsReadRoute = createRoute({
  method: 'patch',
  path: '/:id/read',
  request: {
    params: z.object({
      id: z.string().transform((val) => parseInt(val, 10)),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
          }),
        },
      },
      description: 'Mark notification as read',
    },
    400: {
      description: 'Invalid ID',
    },
  },
});

const getUnreadCountRoute = createRoute({
  method: 'get',
  path: '/unread-count',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            data: z.object({
              count: z.number(),
            }),
          }),
        },
      },
      description: 'Get unread notification count',
    },
  },
});

const markAllAsReadRoute = createRoute({
  method: 'post',
  path: '/mark-all-read',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
      description: 'Mark all notifications as read',
    },
  },
});

app.openapi(getNotificationsRoute, getNotifications);
app.openapi(getUnreadCountRoute, getUnreadCount);
app.openapi(markAsReadRoute, markAsRead);
app.openapi(markAllAsReadRoute, markAllAsRead);

export default app;
