import { pgTable, text, timestamp, uuid, integer, date } from "drizzle-orm/pg-core";
import { clientsTable } from "./clients-schema";

export const feedbackFormTemplatesTable = pgTable("feedback_form_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  recurrenceInterval: integer("recurrence_interval").notNull(),
  startDate: date("start_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});