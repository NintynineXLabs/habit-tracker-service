import { describe, it, expect } from 'bun:test';
import app from './app';

describe('App', () => {
  it('should return OpenAPI JSON at /doc', async () => {
    const res = await app.request('/doc');
    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json.openapi).toBe('3.0.0');
    expect(json.info.title).toBe('Habit Tracker API');
  });

  it('should return Swagger UI at /ui', async () => {
    const res = await app.request('/ui');
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text.toLowerCase()).toContain('<!doctype html>');
    // Scalar UI usually contains this
    expect(text).toContain('Scalar.createApiReference');
  });
});
