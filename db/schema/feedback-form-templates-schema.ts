import { pgTable, text, timestamp, uuid, integer, date } from "drizzle-orm/pg-core";
import { clientsTable } from "./clients-schema";

export const feedbackFormTemplatesTable = pgTable("feedback_form_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientId: text("client_id").references(() => clientsTable.id).notNull(),
  name: text("name").notNull(),
  recurrenceInterval: integer("recurrence_interval").notNull(),
  startDate: date("start_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});