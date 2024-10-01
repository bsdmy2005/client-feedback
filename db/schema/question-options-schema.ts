import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { questionsTable } from "./questions-schema";

export const questionOptionsTable = pgTable("question_options", {
  id: uuid("id").defaultRandom().primaryKey(),
  questionId: uuid("question_id").references(() => questionsTable.id).notNull(),
  optionText: text("option_text").notNull(),
});

export type QuestionOption = typeof questionOptionsTable.$inferSelect;
export type NewQuestionOption = typeof questionOptionsTable.$inferInsert;
