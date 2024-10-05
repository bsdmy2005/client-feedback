import { pgTable, uuid, timestamp, text } from "drizzle-orm/pg-core";
import { profilesTable } from "./profiles-schema";
import { feedbackFormTemplatesTable } from "./feedback-form-templates-schema";

export const userTemplateAssignmentsTable = pgTable("user_template_assignments", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().references(() => profilesTable.userId),
  userEmail: text("user_email").notNull(),	
  templateId: uuid("template_id").notNull().references(() => feedbackFormTemplatesTable.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type UserTemplateAssignment = typeof userTemplateAssignmentsTable.$inferSelect;
export type NewUserTemplateAssignment = typeof userTemplateAssignmentsTable.$inferInsert;