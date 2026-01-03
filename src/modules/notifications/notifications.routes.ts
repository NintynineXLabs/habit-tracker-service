import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { selectNotificationSchema } from './notifications.schema';
import {
  getNotifications,
  getUnreadCount,
  markAllAsRead,
  markAsRead,
  deleteNotification,
} from './notifications.controller';

const app = new OpenAPIHono();

const getNotificationsRoute = createRoute({
  method: 'get',
  path: '/',
  request: {
    query: z.object({
      unreadOnly: z
        .string()
        .optional()
        .transform((val) => val === 'true'),
      page: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 1)),
      limit: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 10)),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            data: z.array(selectNotificationSchema),
            meta: z.object({
              page: z.number(),
              limit: z.number(),
              total: z.number(),
              hasMore: z.boolean(),
              nextPage: z.number().nullable(),
            }),
          }),
        },
      },
      description: 'Retrieve paginated notifications for the current user',
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

const deleteNotificationRoute = createRoute({
  method: 'delete',
  path: '/:id',
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
      description: 'Delete notification',
    },
    400: {
      description: 'Invalid ID',
    },
  },
});

app.openapi(getNotificationsRoute, getNotifications);
app.openapi(getUnreadCountRoute, getUnreadCount);
app.openapi(markAsReadRoute, markAsRead);
app.openapi(markAllAsReadRoute, markAllAsRead);
app.openapi(deleteNotificationRoute, deleteNotification);

export default app;
