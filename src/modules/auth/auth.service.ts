import { OAuth2Client } from 'google-auth-library';
import { sign } from 'hono/jwt';
import { db } from '../../db';
import { users } from '../users/users.schema';
import { eq } from 'drizzle-orm';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const verifyGoogleToken = async (token: string) => {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  return ticket.getPayload();
};

export const findOrCreateUser = async (payload: any) => {
  const { sub: googleId, email, name, picture } = payload;

  if (!email) {
    throw new Error('Email not found in Google token');
  }

  // Check if user exists by googleId
  const existingUser = await db.query.users.findFirst({
    where: eq(users.googleId, googleId),
  });

  if (existingUser) {
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
      .set({ googleId, picture })
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
    })
    .returning();

  return newUser;
};

export const generateJWT = async (user: any) => {
  const payload = {
    sub: user.id,
    name: user.name,
    email: user.email,
    picture: user.picture,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
  };
  return await sign(payload, process.env.JWT_SECRET || 'secret');
};
