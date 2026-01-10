import type { Context } from 'hono';
import {
  getWeeklySummaryReport,
  getDailySummaryReport,
} from './reports.service';
import { getTodayInTimezone } from '../../utils/date-helper';

/**
 * Controller for getting weekly summary report
 * GET /reports/weekly?date=YYYY-MM-DD&timezone=Asia/Jakarta
 */
export const getWeeklySummaryController = async (c: Context) => {
  const user = c.get('user');
  const dateParam = c.req.query('date');
  const timezone = c.req.query('timezone');

  const userId = c.req.query('userId') || user.sub;

  // Use timezone-aware today if no date provided
  const date = dateParam || getTodayInTimezone(timezone);

  const summary = await getWeeklySummaryReport(userId, date);

  return c.json(summary, 200);
};

/**
 * Controller for getting daily summary report
 * GET /reports/daily?date=YYYY-MM-DD
 */
export const getDailySummaryController = async (c: Context) => {
  const user = c.get('user');
  const date = c.req.query('date');

  if (!date) {
    return c.json({ error: 'Date parameter is required' }, 400);
  }

  const userId = c.req.query('userId') || user.sub;

  const summary = await getDailySummaryReport(userId, date);

  return c.json(summary, 200);
};
