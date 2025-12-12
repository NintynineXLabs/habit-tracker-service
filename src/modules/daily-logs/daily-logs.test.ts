import { describe, it, expect, mock } from 'bun:test';
import app from './daily-logs.routes';

// Mock the service to avoid DB connection
mock.module('./daily-logs.service', () => ({
  getAllDailyLogs: async () => [],
  createDailyLog: async (data: any) => ({ id: '123', ...data }),
  getAllDailyLogsProgress: async () => [],
  createDailyLogProgress: async (data: any) => ({ id: '123', ...data }),
}));

describe('Daily Logs Module', () => {
  it('should return 200 on GET /', async () => {
    const res = await app.request('/');
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual([]);
  });

  it('should generate OpenAPI document', () => {
    const doc = app.getOpenAPI31Document({
      openapi: '3.1.0',
      info: {
        title: 'Daily Logs API',
        version: '1.0.0',
      },
    });
    expect(doc).toBeDefined();
    expect(doc.paths).toBeDefined();
    expect(doc.paths?.['/']).toBeDefined();
    expect(doc.paths?.['/progress']).toBeDefined();
  });
});
