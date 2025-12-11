import type { Context } from "hono";
import { verifyGoogleToken, findOrCreateUser, generateJWT } from "./auth.service";

export const googleLogin = async (c: Context) => {
  const { token } = await c.req.json();

  if (!token) {
    return c.json({ error: "Token is required" }, 400);
  }

  try {
    const payload = await verifyGoogleToken(token);
    const user = await findOrCreateUser(payload);
    const jwt = await generateJWT(user);

    return c.json({ token: jwt, user }, 200);
  } catch (error) {
    console.error("Login error:", error);
    return c.json({ error: "Invalid token" }, 401);
  }
};
