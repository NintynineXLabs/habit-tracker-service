import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { insertUserSchema, selectUserSchema } from "./users.schema";
import { getUsers, createUserController } from "./users.controller";

const app = new OpenAPIHono();

const getUsersRoute = createRoute({
  method: "get",
  path: "/",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.array(selectUserSchema),
        },
      },
      description: "Retrieve users",
    },
  },
});

app.openapi(getUsersRoute, getUsers);

const createUserRoute = createRoute({
  method: "post",
  path: "/",
  request: {
    body: {
      content: {
        "application/json": {
          schema: insertUserSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: selectUserSchema,
        },
      },
      description: "Create a user",
    },
  },
});

app.openapi(createUserRoute, createUserController);

export default app;
