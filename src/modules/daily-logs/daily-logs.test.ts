import { describe, it, expect, mock } from 'bun:test';
import { OpenAPIHono } from '@hono/zod-openapi';
import originalApp from './daily-logs.routes';

// Mock the service to avoid DB connection
mock.module('./daily-logs.service', () => ({
  getDailyLogsByUserId: async () => [],
  syncDailyLogsForUser: async () => [],
  upsertDailyLogProgress: async (data: any) => ({ id: '123', ...data }),
  updateDailyLog: async (id: string, userId: string, data: any) => ({
    id,
    userId,
    ...data,
  }),
  softDeleteDailyLog: async (id: string, userId: string) => ({
    id,
    userId,
    deletedAt: new Date(),
  }),
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

  it('should return 200 on PATCH /:id', async () => {
    const id = '123e4567-e89b-12d3-a456-426614174000';
    const res = await app.request(`/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startTime: '09:00',
        durationMinutes: 45,
      }),
    });
    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json.id).toBe(id);
    expect(json.startTime).toBe('09:00');
    expect(json.durationMinutes).toBe(45);
  });

  it('should return 200 on DELETE /:id', async () => {
    const id = '123e4567-e89b-12d3-a456-426614174000';
    const res = await app.request(`/${id}`, {
      method: 'DELETE',
    });
    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json.id).toBe(id);
    expect(json.deletedAt).toBeDefined();
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
        timerSeconds: 0,
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
    expect(doc.paths?.['/:id']).toBeDefined();
    expect(doc.paths?.['/progress']).toBeDefined();
  });
});
