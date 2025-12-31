import { OpenAPIHono } from '@hono/zod-openapi';
import { Scalar } from '@scalar/hono-api-reference';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import usersRoutes from './modules/users/users.routes';
import habitsRoutes from './modules/habits/habits.routes';
import sessionsRoutes from './modules/sessions/sessions.routes';
import dailyLogsRoutes from './modules/daily-logs/daily-logs.routes';
import motivationRoutes from './modules/motivation/motivation.routes';
import reportsRoutes from './modules/reports/reports.routes';
import authRoutes from './modules/auth/auth.routes';
import { authMiddleware } from './middlewares/auth.middleware';
import { db } from './db';
import { sql } from 'drizzle-orm';

const app = new OpenAPIHono();

// CORS Configuration for Development
app.use(
  '*',
  cors({
    origin: ['http://localhost:3000'],
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  }),
);

app.use('*', logger());

// OpenAPI Documentation
app.doc('/doc', {
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'Habit Tracker API',
  },
});

// Swagger UI
app.get(
  '/scalar',
  Scalar({
    url: '/doc',
    theme: 'purple',
  }),
);

// Mount Auth Module (Public)
app.route('/auth', authRoutes);

// Health Check
app.get('/health', async (c) => {
  try {
    // Check database connection
    await db.execute(sql`select 1`);

    return c.json({
      status: 'ok',
      message: 'Service is healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return c.json(
      {
        status: 'error',
        message: 'Service is unhealthy',
        database: 'disconnected',
        timestamp: new Date().toISOString(),
      },
      500,
    );
  }
});

// Apply Auth Middleware to Protected Routes
app.use('/*', async (c, next) => {
  const publicPaths = ['/auth', '/health', '/doc', '/scalar'];
  if (publicPaths.some((path) => c.req.path.startsWith(path))) {
    return await next();
  } else {
    return await authMiddleware(c, next);
  }
});

// Mount Modules
app.route('/users', usersRoutes);
app.route('/habits', habitsRoutes);
app.route('/sessions', sessionsRoutes); // Note: This will prefix /sessions/weekly, /sessions/items, etc.
app.route('/daily-logs', dailyLogsRoutes);
app.route('/motivation', motivationRoutes);
app.route('/reports', reportsRoutes);

export default app;
