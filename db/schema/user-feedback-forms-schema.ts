import { pgTable, uuid, timestamp, text, pgEnum } from "drizzle-orm/pg-core";
import { profilesTable } from "./profiles-schema";
import { feedbackFormsTable } from "./feedback-forms-schema";
import { feedbackFormTemplatesTable } from "./feedback-form-templates-schema";

export const userFeedbackFormStatusEnum = pgEnum("user_feedback_form_status", ["pending", "active", "overdue", "closed", "submitted"]);

export const userFeedbackFormsTable = pgTable("user_feedback_forms", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().references(() => profilesTable.userId),
  feedbackFormId: uuid("feedback_form_id").notNull().references(() => feedbackFormsTable.id),
  status: userFeedbackFormStatusEnum("status"),
  dueDate: timestamp("due_date").notNull(),
  clientName: text("client_name").notNull(),
  templateName: text("template_name").notNull(),
  templateId: uuid("template_id").notNull().references(() => feedbackFormTemplatesTable.id),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type UserFeedbackForm = typeof userFeedbackFormsTable.$inferSelect;
export type NewUserFeedbackForm = typeof userFeedbackFormsTable.$inferInsert;