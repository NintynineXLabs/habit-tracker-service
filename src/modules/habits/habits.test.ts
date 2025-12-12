import { describe, it, expect, mock } from 'bun:test';
import app from './habits.routes';

// Mock service
mock.module('./habits.service', () => ({
  getAllHabitMasters: async () => [],
  getHabitMastersByUserId: async () => [],
  createHabitMaster: async (data: any) => ({ id: '123', ...data }),
}));

describe('Habits Module', () => {
  it('should return 200 on GET /', async () => {
    const res = await app.request('/');
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual([]);
  });

  it('should return 200 on GET /me', async () => {
    // Mock middleware for user injection
    app.use('/me', async (c, next) => {
      c.set('user' as any, { sub: 'test-user-id' });
      await next();
    });
    const res = await app.request('/me');
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual([]);
  });

  it('should generate OpenAPI document', () => {
    const doc = app.getOpenAPI31Document({
      openapi: '3.1.0',
      info: { title: 'Habits API', version: '1.0.0' },
    });
    expect(doc.paths?.['/']).toBeDefined();
  });
});
