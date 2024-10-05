import { pgTable, text, timestamp, uuid, integer, jsonb } from "drizzle-orm/pg-core";
import { clientsTable } from "./clients-schema";

export const feedbackFormTemplatesTable = pgTable("feedback_form_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientId: uuid("client_id").notNull().references(() => clientsTable.clientId),
  name: text("name").notNull(),
  recurrenceInterval: integer("recurrence_interval").notNull(),
  startDate: timestamp("start_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Template = typeof feedbackFormTemplatesTable.$inferSelect;
export type NewTemplate = typeof feedbackFormTemplatesTable.$inferInsert;