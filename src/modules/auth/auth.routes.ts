import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { googleLogin } from "./auth.controller";
import { googleLoginSchema, authResponseSchema } from "./auth.schema";

const app = new OpenAPIHono();

const googleLoginRoute = createRoute({
  method: "post",
  path: "/google",
  request: {
    body: {
      content: {
        "application/json": {
          schema: googleLoginSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: authResponseSchema,
        },
      },
      description: "Google Login",
    },
    400: {
      description: "Bad Request",
    },
    401: {
      description: "Unauthorized",
    },
  },
});

app.openapi(googleLoginRoute, googleLogin);

export default app;
