import { pgTable, text, timestamp, uuid, integer, jsonb, pgEnum  } from "drizzle-orm/pg-core";
import { feedbackFormTemplatesTable } from "./feedback-form-templates-schema";
import { clientsTable } from "./clients-schema";

export const feedbackFormStatusEnum = pgEnum("feedback_form_status", ["pending", "active", "overdue", "closed"]);
export const feedbackFormsTable = pgTable("feedback_forms", {
  id: uuid("id").defaultRandom().primaryKey(),
  templateId: uuid("template_id").notNull().references(() => feedbackFormTemplatesTable.id),
  templateName: text("template_name").notNull(),
  clientId: uuid("client_id").notNull().references(() => clientsTable.clientId),
  clientName: text("client_name").notNull(),
  dueDate: timestamp("due_date").notNull(),
  status: feedbackFormStatusEnum("status").notNull().default("pending"),
  responses: jsonb("responses"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type FeedbackForm = typeof feedbackFormsTable.$inferSelect;
export type NewFeedbackForm = typeof feedbackFormsTable.$inferInsert;
