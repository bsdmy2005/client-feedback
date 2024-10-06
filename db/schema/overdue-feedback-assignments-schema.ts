import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { feedbackFormTemplatesTable } from "./feedback-form-templates-schema";
import { profilesTable } from "./profiles-schema";

export const overdueFeedbackAssignmentsTable = pgTable("overdue_feedback_assignments", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().references(() => profilesTable.userId),
  templateId: uuid("template_id").notNull().references(() => feedbackFormTemplatesTable.id),
  dueDate: timestamp("due_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type OverdueFeedbackAssignment = typeof overdueFeedbackAssignmentsTable.$inferSelect;
export type NewOverdueFeedbackAssignment = typeof overdueFeedbackAssignmentsTable.$inferInsert;