import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "@hono/zod-openapi";
import { users } from "../users/users.schema";
import { toOpenApi } from "../../utils/zod-helper";

export const habitMasters = pgTable("habit_masters", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category"),
});

export const insertHabitMasterSchema = toOpenApi(createInsertSchema(habitMasters), {
  description: "Schema for creating a habit master",
  example: {
    userId: "123e4567-e89b-12d3-a456-426614174000",
    name: "Reading",
    description: "Read a book for 30 minutes",
    category: "Personal Development",
  },
});

export const selectHabitMasterSchema = toOpenApi(createSelectSchema(habitMasters), {
  description: "Schema for selecting a habit master",
});

export type HabitMaster = z.infer<typeof selectHabitMasterSchema>;
export type NewHabitMaster = z.infer<typeof insertHabitMasterSchema>;
