import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import {
  selectHabitTemplateSchema,
  selectTemplateItemSchema,
} from './habits.schema';
import {
  getTemplates,
  getTemplate,
  applyTemplate,
} from './templates.controller';

const app = new OpenAPIHono();

const getTemplatesRoute = createRoute({
  method: 'get',
  path: '/',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.array(selectHabitTemplateSchema),
        },
      },
      description: 'Retrieve all habit templates',
    },
  },
});

app.openapi(getTemplatesRoute, getTemplates);

const getTemplateRoute = createRoute({
  method: 'get',
  path: '/{id}',
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: selectHabitTemplateSchema.extend({
            items: z.array(selectTemplateItemSchema),
          }),
        },
      },
      description: 'Retrieve a habit template with items',
    },
    404: {
      description: 'Template not found',
    },
  },
});

app.openapi(getTemplateRoute, getTemplate);

const applyTemplateRoute = createRoute({
  method: 'post',
  path: '/{id}/apply',
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            excludedItemIds: z.array(z.string().uuid()).optional(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            message: z.string(),
            count: z.number(),
          }),
        },
      },
      description: 'Template applied successfully',
    },
    400: {
      description: 'Invalid request or no items to apply',
    },
  },
});

app.openapi(applyTemplateRoute, applyTemplate);

export default app;
