"use server";

import { db } from "@/db/db";
import { formAnswersTable, FormAnswer, NewFormAnswer } from "@/db/schema/form-answers-schema";
import { eq } from "drizzle-orm";

export async function createFormAnswer(data: NewFormAnswer): Promise<FormAnswer> {
  console.log("Creating form answer with data:", JSON.stringify(data, null, 2));
  const result = await db.insert(formAnswersTable).values(data).returning();
  console.log("Insert result:", JSON.stringify(result, null, 2));
  return result[0];
};

export const getFormAnswersByUserId = async (userId: string): Promise<FormAnswer[]> => {
  return db.select().from(formAnswersTable).where(eq(formAnswersTable.userId, userId));
};

export const getFormAnswersByFormUserId = async (formUserId: string): Promise<FormAnswer[]> => {
  return db.select().from(formAnswersTable).where(eq(formAnswersTable.formuserId, formUserId));
};

export async function getFormAnswersByFeedbackFormId(feedbackFormId: string) {
  return db.select().from(formAnswersTable).where(eq(formAnswersTable.formuserId, feedbackFormId));
}