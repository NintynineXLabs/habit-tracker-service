import { OAuth2Client } from 'google-auth-library';
import { sign } from 'hono/jwt';
import { db } from '../../db';
import { users } from '../users/users.schema';
import { eq } from 'drizzle-orm';

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'postmessage',
);

export const exchangeGoogleCode = async (code: string) => {
  console.log('Exchanging code:', code);
  try {
    const { tokens } = await client.getToken(code);
    console.log('Tokens received:', tokens);
    return tokens;
  } catch (error) {
    console.error('Error exchanging code:', error);
    throw error;
  }
};

export const verifyGoogleToken = async (token: string) => {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  return ticket.getPayload();
};

export const findOrCreateUser = async (
  payload: any,
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
      return updatedUser;
    }
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
        picture,
        ...(refreshToken ? { googleRefreshToken: refreshToken } : {}),
      })
      .where(eq(users.id, existingUserByEmail.id))
      .returning();
    return updatedUser;
  }

  // Create new user
  const [newUser] = await db
    .insert(users)
    .values({
      name: name || email.split('@')[0],
      email,
      googleId,
      picture,
      googleRefreshToken: refreshToken,
    })
    .returning();

  return newUser;
};

export const updateAppRefreshToken = async (
  userId: string,
  refreshToken: string,
) => {
  await db.update(users).set({ refreshToken }).where(eq(users.id, userId));
};

export const generateAccessToken = async (user: any) => {
  const payload = {
    sub: user.id,
    name: user.name,
    email: user.email,
    picture: user.picture,
    exp: Math.floor(Date.now() / 1000) + 60 * 15, // 15 minutes
  };
  return await sign(payload, process.env.JWT_SECRET || 'secret');
};

export const generateRefreshToken = async (user: any) => {
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
  } catch (e) {
    return null;
  }
};
