import { describe, it, expect, mock } from 'bun:test';
import app from './users.routes';

// Mock service
mock.module('./users.service', () => ({
  getAllUsers: async () => [],
  createUser: async (data: any) => ({ id: '123', ...data }),
}));

describe('Users Module', () => {
  it('should return 200 on GET /', async () => {
    const res = await app.request('/');
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual([]);
  });

  it('should generate OpenAPI document', () => {
    const doc = app.getOpenAPI31Document({
      openapi: '3.1.0',
      info: { title: 'Users API', version: '1.0.0' },
    });
    expect(doc.paths?.['/']).toBeDefined();
  });
});
