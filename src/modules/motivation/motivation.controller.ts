import type { Context } from 'hono';
import { getDailyProgressSummary } from './motivation.service';

export const getDailyProgressSummaryController = async (c: Context) => {
  const user = c.get('user');
  const date = c.req.query('date');

  if (!date) {
    return c.json({ error: 'Date is required' }, 400);
  }

  const result = await getDailyProgressSummary(user.sub, date);
  return c.json(result, 200);
};
