import type { Context } from 'hono';
import type {
  UpdateDailyLogProgress,
  UpdateDailyLogRequest,
} from './daily-logs.schema';
import {
  getDailyLogsByUserId,
  getGroupProgress,
  softDeleteDailyLog,
  syncDailyLogsForUser,
  updateDailyLog,
  upsertDailyLogProgress,
} from './daily-logs.service';

// Daily Logs
export const getMyDailyLogs = async (c: Context) => {
  const user = c.get('user');
  const date = c.req.query('date')!;

  // Trigger sync to ensure logs exist for this date
  await syncDailyLogsForUser(user.sub, date);

  const logs = await getDailyLogsByUserId(user.sub, date);

  // Enrich collaborative logs with group progress
  const enrichedLogs = await Promise.all(
    logs.map(async (log) => {
      const goalType = log.sessionItem?.goalType;

      if (goalType === 'collaborative' && log.sessionItemId) {
        const groupData = await getGroupProgress(log.sessionItemId, date);
        return {
          ...log,
          groupProgress: groupData.summary,
          collaboratorsStatus: groupData.members,
        };
      }

      return log;
    }),
  );

  return c.json(enrichedLogs, 200);
};

export const updateDailyLogController = async (c: Context) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const data = await c.req.json();
  const result = await updateDailyLog(
    id,
    user.sub,
    data as UpdateDailyLogRequest,
  );
  return c.json(result, 200);
};

export const deleteDailyLogController = async (c: Context) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const result = await softDeleteDailyLog(id, user.sub);
  return c.json(result, 200);
};

// Daily Logs Progress
export const createDailyLogProgressController = async (c: Context) => {
  const data = await c.req.json();
  const result = await upsertDailyLogProgress(data as UpdateDailyLogProgress);
  return c.json(result, 200);
};
