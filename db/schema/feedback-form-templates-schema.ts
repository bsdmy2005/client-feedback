import { pgTable, text, timestamp, uuid, integer } from "drizzle-orm/pg-core";
import { clientsTable } from "./clients-schema";

export const feedbackFormTemplatesTable = pgTable("feedback_form_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientId: uuid("client_id").notNull(),
  name: text("name").notNull(),
  recurrenceInterval: integer("recurrence_interval").notNull(),
  startDate: timestamp("start_date").notNull(),
  questionIds: text("question_ids").array().notNull().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Template = typeof feedbackFormTemplatesTable.$inferSelect;
export type NewTemplate = typeof feedbackFormTemplatesTable.$inferInsert;