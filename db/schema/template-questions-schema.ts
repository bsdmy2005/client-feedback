import { pgTable, uuid, primaryKey } from "drizzle-orm/pg-core";
import { feedbackFormTemplatesTable } from "./feedback-form-templates-schema";
import { questionsTable } from "./questions-schema";

export const templateQuestionsTable = pgTable("template_questions", {
  templateId: uuid("template_id")
    .notNull()
    .references(() => feedbackFormTemplatesTable.id),
  questionId: uuid("question_id")
    .notNull()
    .references(() => questionsTable.id),
}, (table) => ({
  pk: primaryKey(table.templateId, table.questionId),
}));

export type TemplateQuestion = typeof templateQuestionsTable.$inferSelect;
export type NewTemplateQuestion = typeof templateQuestionsTable.$inferInsert;