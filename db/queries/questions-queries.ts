import { db } from "../db";
import { questionsTable } from "../schema/questions-schema";
import { eq, is } from "drizzle-orm";

export const getQuestionById = async (id: string) => {
  const [question] = await db.select().from(questionsTable).where(eq(questionsTable.id, id));
  return question;
};

export const getQuestionsByClientId = async (clientId: string) => {
  return db.select().from(questionsTable).where(eq(questionsTable.clientId, clientId));
};

export const getGlobalQuestions = async () => {
  return db.select().from(questionsTable).where(eq(questionsTable.global, "true"));
};