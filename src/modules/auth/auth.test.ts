import { describe, it, expect, mock } from 'bun:test';
import app from './auth.routes';

// Mock Google Auth Library
mock.module('google-auth-library', () => {
  return {
    OAuth2Client: class {
      async verifyIdToken() {
        return {
          getPayload: () => ({
            sub: 'test-google-id',
            email: 'test@example.com',
            name: 'Test User',
            picture: 'http://example.com/pic.jpg',
          }),
        };
      }
    },
  };
});

// Mock service
mock.module('./auth.service', () => ({
  verifyGoogleToken: async () => ({
    sub: 'test-google-id',
    email: 'test@example.com',
    name: 'Test User',
    picture: 'http://example.com/pic.jpg',
  }),
  exchangeGoogleCode: async () => ({
    id_token: 'fake-id-token',
    refresh_token: 'fake-refresh-token',
  }),
  findOrCreateUser: async (payload: any, refreshToken?: string) => ({
    id: '123',
    email: payload.email,
    name: payload.name,
    googleRefreshToken: refreshToken,
  }),
  generateAccessToken: async () => 'fake-access-token',
  generateRefreshToken: async () => 'fake-refresh-token',
  verifyRefreshToken: async (token: string) =>
    token === 'valid-refresh-token' ? { sub: '123' } : null,
}));

describe('Auth Module', () => {
  it('should return tokens on POST /google with token', async () => {
    const res = await app.request('/google', {
      method: 'POST',
      body: JSON.stringify({ token: 'fake-token' }),
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body).toHaveProperty('accessToken');
    expect(body).toHaveProperty('refreshToken');
    expect(body).toHaveProperty('user');
  });

  it('should return tokens on POST /google with code', async () => {
    const res = await app.request('/google', {
      method: 'POST',
      body: JSON.stringify({ code: 'fake-code' }),
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body).toHaveProperty('accessToken');
    expect(body).toHaveProperty('refreshToken');
    expect(body.user).toHaveProperty(
      'googleRefreshToken',
      'fake-refresh-token',
    );
  });

  it('should return 400 if token and code are missing', async () => {
    const res = await app.request('/google', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res.status).toBe(400);
  });

  it('should return new access token on POST /refresh', async () => {
    const res = await app.request('/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: 'valid-refresh-token' }),
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body).toHaveProperty('accessToken', 'fake-access-token');
  });

  it('should return 401 on POST /refresh with invalid token', async () => {
    const res = await app.request('/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: 'invalid-token' }),
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res.status).toBe(401);
  });

  it('should generate OpenAPI document', () => {
    const doc = app.getOpenAPI31Document({
      openapi: '3.1.0',
      info: { title: 'Auth API', version: '1.0.0' },
    });
    expect(doc.paths?.['/google']).toBeDefined();
    expect(doc.paths?.['/refresh']).toBeDefined();
  });
});
