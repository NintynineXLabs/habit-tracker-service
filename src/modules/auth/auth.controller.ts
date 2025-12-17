import type { Context } from 'hono';
import {
  verifyGoogleToken,
  findOrCreateUser,
  generateAccessToken,
  generateRefreshToken,
  exchangeGoogleCode,
  verifyRefreshToken,
} from './auth.service';

export const googleLogin = async (c: Context) => {
  const { token, code } = await c.req.json();

  if (!token && !code) {
    return c.json({ error: 'Token or Code is required' }, 400);
  }

  try {
    let payload;
    let googleRefreshToken = null;

    if (code) {
      const tokens = await exchangeGoogleCode(code);
      payload = await verifyGoogleToken(tokens.id_token!);
      googleRefreshToken = tokens.refresh_token;
    } else {
      payload = await verifyGoogleToken(token);
    }

    const user = await findOrCreateUser(payload, googleRefreshToken);
    const accessToken = await generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);

    return c.json({ accessToken, refreshToken, user }, 200);
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'Invalid token or code' }, 401);
  }
};

export const refreshAppToken = async (c: Context) => {
  const { refreshToken } = await c.req.json();

  if (!refreshToken) {
    return c.json({ error: 'Refresh token is required' }, 400);
  }

  try {
    const payload = await verifyRefreshToken(refreshToken);
    if (!payload || !payload.sub) {
      return c.json({ error: 'Invalid refresh token' }, 401);
    }

    // Optional: Check if refreshToken exists in DB for this user
    // const user = await db.query.users.findFirst({ where: eq(users.id, payload.sub as string) });
    // if (!user || user.refreshToken !== refreshToken) return c.json({ error: 'Invalid refresh token' }, 401);

    const accessToken = await generateAccessToken({ id: payload.sub });
    return c.json({ accessToken }, 200);
  } catch (error) {
    console.error('Refresh error:', error);
    return c.json({ error: 'Invalid refresh token' }, 401);
  }
};
