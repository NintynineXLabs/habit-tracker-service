import type { Context } from 'hono';
import {
  createWeeklySession,
  updateWeeklySession,
  deleteWeeklySession,
  getWeeklySessionsByUserId,
  getSessionItemsByUserId,
  createSessionItem,
  updateSessionItem,
  deleteSessionItem,
  createSessionCollaborator,
  addCollaboratorByEmail,
  getCollaboratorsBySessionItem,
  removeCollaborator,
  updateCollaboratorStatus,
  getPendingInvitationsForUser,
} from './sessions.service';
import type {
  NewWeeklySession,
  NewSessionItem,
  NewSessionCollaborator,
} from './sessions.schema';

export const getMyWeeklySessions = async (c: Context) => {
  const user = c.get('user');
  const dayOfWeekParam = c.req.query('dayOfWeek');
  const dayOfWeek = dayOfWeekParam ? parseInt(dayOfWeekParam, 10) : undefined;
  const result = await getWeeklySessionsByUserId(user.sub, dayOfWeek);
  return c.json(result, 200);
};

export const createWeeklySessionController = async (c: Context) => {
  const user = c.get('user');
  const data = await c.req.json();
  const newSession: NewWeeklySession = {
    ...data,
    userId: user.sub,
  };
  const result = await createWeeklySession(newSession);
  return c.json(result, 200);
};

export const updateWeeklySessionController = async (c: Context) => {
  const id = c.req.param('id');
  const data = await c.req.json();
  const result = await updateWeeklySession(id, data);
  return c.json(result, 200);
};

export const deleteWeeklySessionController = async (c: Context) => {
  const id = c.req.param('id');
  await deleteWeeklySession(id);
  return c.json({ success: true }, 200);
};

// Session Items
export const getMySessionItems = async (c: Context) => {
  const user = c.get('user');
  const dayOfWeekParam = c.req.query('dayOfWeek');
  const dayOfWeek = dayOfWeekParam ? parseInt(dayOfWeekParam, 10) : undefined;
  const result = await getSessionItemsByUserId(user.sub, dayOfWeek);
  return c.json(result, 200);
};

export const createSessionItemController = async (c: Context) => {
  const user = c.get('user');
  const data = await c.req.json();
  const result = await createSessionItem(data as NewSessionItem, {
    userId: user.sub,
    email: user.email,
  });
  return c.json(result, 200);
};

export const updateSessionItemController = async (c: Context) => {
  const id = c.req.param('id');
  const data = await c.req.json();
  const result = await updateSessionItem(id, data);
  return c.json(result, 200);
};

export const deleteSessionItemController = async (c: Context) => {
  const id = c.req.param('id');
  await deleteSessionItem(id);
  return c.json({ success: true }, 200);
};

// Session Collaborators
export const createSessionCollaboratorController = async (c: Context) => {
  const data = await c.req.json();
  const result = await createSessionCollaborator(
    data as NewSessionCollaborator,
  );
  return c.json(result, 200);
};

// Add collaborator by email
export const addCollaboratorController = async (c: Context) => {
  const user = c.get('user');
  const { sessionItemId, email } = await c.req.json();

  if (!sessionItemId || !email) {
    return c.json({ error: 'sessionItemId and email are required' }, 400);
  }

  const { collaborator, alreadyExists } = await addCollaboratorByEmail(
    sessionItemId,
    email,
    user.name,
  );

  if (!collaborator) {
    return c.json({ error: 'Failed to create collaborator' }, 400);
  }

  if (alreadyExists) {
    return c.json(
      { message: 'Collaborator already exists', collaborator },
      200,
    );
  }

  return c.json({ message: 'Collaborator invited', collaborator }, 201);
};

// Get collaborators for a session item
export const getCollaboratorsController = async (c: Context) => {
  const sessionItemId = c.req.param('sessionItemId');

  if (!sessionItemId) {
    return c.json({ error: 'sessionItemId is required' }, 400);
  }

  const collaborators = await getCollaboratorsBySessionItem(sessionItemId);
  return c.json({ collaborators }, 200);
};

// Remove collaborator
export const removeCollaboratorController = async (c: Context) => {
  const collaboratorId = c.req.param('collaboratorId');

  if (!collaboratorId) {
    return c.json({ error: 'collaboratorId is required' }, 400);
  }

  const result = await removeCollaborator(collaboratorId);

  if (!result) {
    return c.json({ error: 'Collaborator not found' }, 400);
  }

  return c.json({ success: true, collaborator: result }, 200);
};

// Accept or reject invitation
export const updateCollaboratorStatusController = async (c: Context) => {
  const user = c.get('user');
  const collaboratorId = c.req.param('collaboratorId');
  const { status } = await c.req.json();

  if (!collaboratorId || !status) {
    return c.json({ error: 'collaboratorId and status are required' }, 400);
  }

  if (status !== 'accepted' && status !== 'rejected' && status !== 'left') {
    return c.json(
      { error: 'status must be "accepted", "rejected", or "left"' },
      400,
    );
  }

  const result = await updateCollaboratorStatus(
    collaboratorId,
    status,
    user.sub,
  );

  if (!result) {
    return c.json({ error: 'Collaborator not found' }, 400);
  }

  return c.json({ success: true, collaborator: result }, 200);
};

// Get my pending invitations
export const getMyPendingInvitationsController = async (c: Context) => {
  const user = c.get('user');
  const email = user.email;

  if (!email) {
    return c.json({ error: 'User email not found' }, 400);
  }

  const invitations = await getPendingInvitationsForUser(email);
  return c.json({ invitations }, 200);
};
