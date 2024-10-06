import { pgTable, uuid, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { profilesTable } from "./profiles-schema";
import { userFeedbackFormsTable } from "./user-feedback-forms-schema";

export const formAnswersTable = pgTable("form_answers", {
  id: uuid("id").defaultRandom().primaryKey(),
  answers: jsonb("answers").notNull(),
  userId: text("user_id").notNull(),
  formuserId: uuid("formuserId").notNull(), // Make sure this line exists
  submittedAt: timestamp("submitted_at").notNull(),
});

export type FormAnswer = typeof formAnswersTable.$inferSelect;
export type NewFormAnswer = {
  answers: Record<string, string>;
  userId: string;
  formuserId: string; // Make sure this is included
  submittedAt: Date;
};