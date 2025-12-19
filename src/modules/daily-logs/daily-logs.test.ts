import { describe, it, expect, mock } from 'bun:test';
import { OpenAPIHono } from '@hono/zod-openapi';
import originalApp from './daily-logs.routes';

// Mock the service to avoid DB connection
mock.module('./daily-logs.service', () => ({
  getDailyLogsByUserId: async () => [],
  syncDailyLogsForUser: async () => [],
  upsertDailyLogProgress: async (data: any) => ({ id: '123', ...data }),
  createDailyLog: async (data: any) => ({ id: '123', ...data }),
}));

const app = new OpenAPIHono();

// Mock auth middleware for testing
app.use('*', async (c, next) => {
  (c as any).set('user', { sub: 'user-123' });
  await next();
});

// Mount original routes
app.route('/', originalApp);

describe('Daily Logs Module', () => {
  it('should return 200 on GET /me', async () => {
    const res = await app.request('/me');
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual([]);
  });

  it('should return 200 on POST /progress', async () => {
    const res = await app.request('/progress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dailyLogId: '123e4567-e89b-12d3-a456-426614174000',
        isCompleted: true,
      }),
    });
    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json.id).toBe('123');
  });

  it('should generate OpenAPI document', () => {
    const doc = originalApp.getOpenAPI31Document({
      openapi: '3.1.0',
      info: {
        title: 'Daily Logs API',
        version: '1.0.0',
      },
    });
    expect(doc).toBeDefined();
    expect(doc.paths).toBeDefined();
    expect(doc.paths?.['/me']).toBeDefined();
    expect(doc.paths?.['/progress']).toBeDefined();
  });
});
