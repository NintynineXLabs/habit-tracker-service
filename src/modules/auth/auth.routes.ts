import { Hono } from "hono";
import { googleLogin } from "./auth.controller";

const app = new Hono();

app.post("/google", googleLogin);

export default app;
