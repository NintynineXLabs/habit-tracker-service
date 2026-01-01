import { OAuth2Client, type TokenPayload } from 'google-auth-library';
import { sign } from 'hono/jwt';
import { db } from '../../db';
import { users, type User } from '../users/users.schema';
import { eq } from 'drizzle-orm';
import { sessionCollaborators } from '../sessions/sessions.schema';
import { createNotification } from '../notifications/notifications.service';

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'postmessage',
);

export const exchangeGoogleCode = async (code: string) => {
  const { tokens } = await client.getToken(code);
  return tokens;
};

export const verifyGoogleToken = async (token: string) => {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  return ticket.getPayload();
};

const processPendingInvites = async (user: User) => {
  const pendingInvites = await db.query.sessionCollaborators.findMany({
    where: (collaborators, { eq, and, isNull }) =>
      and(
        eq(collaborators.email, user.email),
        isNull(collaborators.collaboratorUserId),
        isNull(collaborators.deletedAt),
      ),
    with: {
      sessionItem: {
        with: {
          habitMaster: true,
          session: true,
          collaborators: {
            where: (collabs, { eq }) => eq(collabs.role, 'owner'),
            with: {
              collaboratorUser: true,
            },
          },
        },
      },
    },
  });

  if (pendingInvites.length > 0) {
    await db
      .update(sessionCollaborators)
      .set({ collaboratorUserId: user.id })
      .where(eq(sessionCollaborators.email, user.email));

    for (const invite of pendingInvites) {
      const owner = invite.sessionItem?.collaborators[0]?.collaboratorUser;
      const sessionItem = invite.sessionItem;
      await createNotification({
        userId: user.id,
        type: 'COLLAB_INVITE',
        title: 'Undangan Kolaborasi Menunggu',
        message: `${
          owner?.name || 'Seseorang'
        } mengundangmu untuk bergabung dalam sesi habit ini.`,
        metadata: {
          sessionItemId: invite.sessionItemId,
          inviteId: invite.id,
          habitName: sessionItem?.habitMaster?.name || null,
          sessionName: sessionItem?.session?.name || null,
          dayOfWeek: sessionItem?.session?.dayOfWeek ?? null,
          startTime: sessionItem?.startTime || null,
        },
      });
    }
  }
};

export const findOrCreateUser = async (
  payload: TokenPayload,
  refreshToken?: string | null,
) => {
  const { sub: googleId, email, name, picture } = payload;

  if (!email) {
    throw new Error('Email not found in Google token');
  }

  // Check if user exists by googleId
  const existingUser = await db.query.users.findFirst({
    where: eq(users.googleId, googleId),
  });

  if (existingUser) {
    // Update refresh token if provided
    if (refreshToken) {
      const [updatedUser] = await db
        .update(users)
        .set({ googleRefreshToken: refreshToken })
        .where(eq(users.id, existingUser.id))
        .returning();

      if (updatedUser) {
        await processPendingInvites(updatedUser);
        return updatedUser;
      }
    }
    await processPendingInvites(existingUser);
    return existingUser;
  }

  // Check if user exists by email (legacy or manual signup if any)
  const existingUserByEmail = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existingUserByEmail) {
    // Link googleId to existing user
    const [updatedUser] = await db
      .update(users)
      .set({
        googleId,
        picture: picture || null,
        ...(refreshToken ? { googleRefreshToken: refreshToken } : {}),
      })
      .where(eq(users.id, existingUserByEmail.id))
      .returning();

    if (updatedUser) {
      await processPendingInvites(updatedUser);
      return updatedUser;
    }
    return existingUserByEmail;
  }

  // Create new user
  const userName = name || email.split('@')[0] || 'User';
  const userEmail = email!;

  const newUserValues: typeof users.$inferInsert = {
    name: userName,
    email: userEmail,
    googleId: googleId || null,
    picture: picture || null,
    googleRefreshToken: refreshToken || null,
  };

  const [newUser] = await db.insert(users).values(newUserValues).returning();

  if (newUser) {
    await processPendingInvites(newUser);
    return newUser;
  }

  throw new Error('Failed to create user');
};

export const updateAppRefreshToken = async (
  userId: string,
  refreshToken: string,
) => {
  await db.update(users).set({ refreshToken }).where(eq(users.id, userId));
};

export const generateAccessToken = async (user: User) => {
  const payload = {
    sub: user.id,
    name: user.name,
    email: user.email,
    picture: user.picture,
    exp: Math.floor(Date.now() / 1000) + 60 * 15, // 15 minutes
  };
  return await sign(payload, process.env.JWT_SECRET || 'secret');
};

export const generateRefreshToken = async (user: User) => {
  const payload = {
    sub: user.id,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30, // 30 days
  };
  const refreshToken = await sign(
    payload,
    process.env.REFRESH_TOKEN_SECRET || 'refresh-secret',
  );
  await updateAppRefreshToken(user.id, refreshToken);
  return refreshToken;
};

export const verifyRefreshToken = async (token: string) => {
  const { verify } = await import('hono/jwt');
  try {
    const payload = await verify(
      token,
      process.env.REFRESH_TOKEN_SECRET || 'refresh-secret',
    );
    return payload;
  } catch {
    return null;
  }
};
