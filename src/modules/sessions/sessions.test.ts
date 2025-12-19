import { describe, it, expect, mock } from 'bun:test';
import app from './sessions.routes';

// Mock service
mock.module('./sessions.service', () => ({
  createWeeklySession: async (data: any) => ({ id: '123', ...data }),
  createSessionItem: async (data: any) => ({ id: '123', ...data }),
  createSessionCollaborator: async (data: any) => ({ id: '123', ...data }),
}));

describe('Sessions Module', () => {
  it('should return 200 on GET /weekly', async () => {
    const res = await app.request('/weekly');
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual([]);
  });

  it('should generate OpenAPI document', () => {
    const doc = app.getOpenAPI31Document({
      openapi: '3.1.0',
      info: { title: 'Sessions API', version: '1.0.0' },
    });
    expect(doc.paths?.['/weekly']).toBeDefined();
    expect(doc.paths?.['/items']).toBeDefined();
    expect(doc.paths?.['/collaborators']).toBeDefined();
  });
});
