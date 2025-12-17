import type { Context } from 'hono';
import {
  verifyGoogleToken,
  findOrCreateUser,
  generateJWT,
  exchangeGoogleCode,
} from './auth.service';

export const googleLogin = async (c: Context) => {
  const { token, code } = await c.req.json();

  if (!token && !code) {
    return c.json({ error: 'Token or Code is required' }, 400);
  }

  try {
    let payload;
    let refreshToken = null;

    if (code) {
      const tokens = await exchangeGoogleCode(code);
      payload = await verifyGoogleToken(tokens.id_token!);
      refreshToken = tokens.refresh_token;
    } else {
      payload = await verifyGoogleToken(token);
    }

    const user = await findOrCreateUser(payload, refreshToken);
    const jwt = await generateJWT(user);

    return c.json({ token: jwt, user }, 200);
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'Invalid token or code' }, 401);
  }
};
