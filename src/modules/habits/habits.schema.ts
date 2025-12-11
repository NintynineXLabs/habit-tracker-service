import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "../users/users.schema";

export const habitMasters = pgTable("habit_masters", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category"),
});

export const insertHabitMasterSchema = createInsertSchema(habitMasters);
export const selectHabitMasterSchema = createSelectSchema(habitMasters);

export type HabitMaster = z.infer<typeof selectHabitMasterSchema>;
export type NewHabitMaster = z.infer<typeof insertHabitMasterSchema>;
