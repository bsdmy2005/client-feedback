import { db } from "../db";
import { questionOptionsTable } from "../schema/question-options-schema";
import { eq } from "drizzle-orm";

export const getOptionsByQuestionId = async (questionId: string) => {
  return db.select().from(questionOptionsTable).where(eq(questionOptionsTable.questionId, questionId));
};