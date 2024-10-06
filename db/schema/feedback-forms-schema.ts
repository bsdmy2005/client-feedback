import { pgTable, text, timestamp, uuid, integer, jsonb } from "drizzle-orm/pg-core";
import { feedbackFormTemplatesTable } from "./feedback-form-templates-schema";

export const feedbackFormsTable = pgTable("feedback_forms", {
  id: uuid("id").defaultRandom().primaryKey(),
  templateId: uuid("template_id").notNull().references(() => feedbackFormTemplatesTable.id),
  userId: text("user_id").notNull(),
  dueDate: timestamp("due_date").notNull(),
  status: text("status").notNull().default("pending"),
  responses: jsonb("responses"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type FeedbackForm = typeof feedbackFormsTable.$inferSelect;
export type NewFeedbackForm = typeof feedbackFormsTable.$inferInsert;