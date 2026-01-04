import type { Context } from 'hono';
import { db } from '../../db';
import { habitTemplates, templateItems, habitMasters } from './habits.schema';
import { eq } from 'drizzle-orm';

export const getTemplates = async (c: Context) => {
  const templates = await db.select().from(habitTemplates);
  return c.json(templates, 200);
};

export const getTemplate = async (c: Context) => {
  const id = c.req.param('id');
  const template = await db
    .select()
    .from(habitTemplates)
    .where(eq(habitTemplates.id, id))
    .limit(1);

  if (!template.length) {
    return c.json({ message: 'Template not found' }, 404);
  }

  const items = await db
    .select()
    .from(templateItems)
    .where(eq(templateItems.templateId, id));

  return c.json({ ...template[0], items }, 200);
};

export const applyTemplate = async (c: Context) => {
  const templateId = c.req.param('id');
  const user = c.get('user');
  const userId = user.sub;
  const { excludedItemIds } = await c.req.json();

  const items = await db
    .select()
    .from(templateItems)
    .where(eq(templateItems.templateId, templateId));

  if (!items.length) {
    return c.json({ message: 'Template has no items' }, 400);
  }

  const itemsToApply = items.filter(
    (item) => !excludedItemIds?.includes(item.id),
  );

  if (!itemsToApply.length) {
    return c.json({ message: 'No items selected to apply' }, 400);
  }

  const newHabits = itemsToApply.map((item) => ({
    userId,
    name: item.name,
    description: item.description,
    category: item.category,
    iconName: item.iconName,
    iconColor: item.iconColor,
    iconBackgroundColor: item.iconBackgroundColor,
  }));

  await db.insert(habitMasters).values(newHabits);

  return c.json(
    {
      message: 'Template applied successfully',
      count: newHabits.length,
    },
    200,
  );
};
