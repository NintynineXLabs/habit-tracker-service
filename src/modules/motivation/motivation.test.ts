import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { Hono } from 'hono';
import app from './motivation.routes';

// Define response types for testing
interface DailyProgressSummaryResponse {
  date: string;
  stats: {
    total: number;
    completed: number;
    remaining: number;
    percentage: number;
  };
  motivation: {
    message: string;
    colorInfo: 'success' | 'info' | 'neutral';
  };
}

interface ErrorResponse {
  error: string;
}

// Mock service
mock.module('./motivation.service', () => ({
  getDynamicMotivation: async (percentage: number) => {
    if (percentage === 100) return 'Perfect! You conquered the day.';
    if (percentage === 0) return "Let's take the first step!";
    return "Keep going! You're making progress.";
  },
  getDailyProgressSummary: async (_userId: string, date: string) => ({
    date,
    stats: {
      total: 5,
      completed: 3,
      remaining: 2,
      percentage: 60,
    },
    motivation: {
      message: 'Awesome! You are more than halfway there.',
      colorInfo: 'info' as const,
    },
  }),
}));

describe('Motivation Module', () => {
  let testApp: Hono;

  beforeEach(() => {
    testApp = new Hono();
    // Mock user middleware
    testApp.use('*', async (c, next) => {
      c.set('user' as never, { sub: 'test-user-id' });
      await next();
    });
    testApp.route('/', app);
  });

  it('should return 200 on GET /summary with valid date', async () => {
    const res = await testApp.request('/summary?date=2023-10-27');
    expect(res.status).toBe(200);

    const json = (await res.json()) as DailyProgressSummaryResponse;
    expect(json).toHaveProperty('date', '2023-10-27');
    expect(json).toHaveProperty('stats');
    expect(json.stats).toHaveProperty('total', 5);
    expect(json.stats).toHaveProperty('completed', 3);
    expect(json.stats).toHaveProperty('remaining', 2);
    expect(json.stats).toHaveProperty('percentage', 60);
    expect(json).toHaveProperty('motivation');
    expect(json.motivation).toHaveProperty('message');
    expect(json.motivation).toHaveProperty('colorInfo', 'info');
  });

  it('should return 400 on GET /summary without date', async () => {
    const res = await testApp.request('/summary');
    expect(res.status).toBe(400);

    const json = (await res.json()) as ErrorResponse;
    expect(json).toHaveProperty('error');
  });

  it('should generate OpenAPI document', () => {
    const doc = app.getOpenAPI31Document({
      openapi: '3.1.0',
      info: { title: 'Motivation API', version: '1.0.0' },
    });
    expect(doc.paths?.['/summary']).toBeDefined();
  });
});
