"use server";

import { db } from "@/db/db";
import { eq, and } from "drizzle-orm";
import { userFeedbackFormsTable, UserFeedbackForm, NewUserFeedbackForm } from "../schema/user-feedback-forms-schema";
import { feedbackFormsTable } from "../schema/feedback-forms-schema";

export const createUserFeedbackForm = async (data: NewUserFeedbackForm): Promise<UserFeedbackForm> => {
  const [newUserFeedbackForm] = await db.insert(userFeedbackFormsTable).values(data).returning();
  return newUserFeedbackForm;
};

export const getUserFeedbackFormById = async (id: string): Promise<UserFeedbackForm | null> => {
  const userFeedbackForm = await db.query.userFeedbackForms.findFirst({
    where: eq(userFeedbackFormsTable.id, id),
  });
  return userFeedbackForm ?? null;
};

export const getUserFeedbackFormByUserAndFormId = async (userId: string, feedbackFormId: string): Promise<UserFeedbackForm | null> => {
  const userFeedbackForm = await db.query.userFeedbackForms.findFirst({
    where: and(
      eq(userFeedbackFormsTable.userId, userId),
      eq(userFeedbackFormsTable.feedbackFormId, feedbackFormId)
    ),
  });
  return userFeedbackForm ?? null;
};

export const getUserFeedbackFormsByUserId = async (userId: string): Promise<UserFeedbackForm[]> => {
  const userFeedbackForms = await db.query.userFeedbackForms.findMany({
    where: eq(userFeedbackFormsTable.userId, userId),
  });
  return userFeedbackForms;
};

export const updateUserFeedbackForm = async (id: string, data: Partial<NewUserFeedbackForm>): Promise<UserFeedbackForm> => {
  const [updatedUserFeedbackForm] = await db
    .update(userFeedbackFormsTable)
    .set({ ...data, lastUpdated: new Date() })
    .where(eq(userFeedbackFormsTable.id, id))
    .returning();
  return updatedUserFeedbackForm;
};

export const deleteUserFeedbackForm = async (id: string): Promise<void> => {
  await db.delete(userFeedbackFormsTable).where(eq(userFeedbackFormsTable.id, id));
};

export const getUserFeedbackFormsWithDetails = async (userId: string): Promise<UserFeedbackForm[]> => {
  const userFeedbackForms = await db
    .select()
    .from(userFeedbackFormsTable)
    .where(eq(userFeedbackFormsTable.userId, userId))
    .leftJoin(
      feedbackFormsTable,
      eq(userFeedbackFormsTable.feedbackFormId, feedbackFormsTable.id)
    );

  return userFeedbackForms.map(({ user_feedback_forms }) => user_feedback_forms);
};

export async function getUserFeedbackFormsByFeedbackFormId(feedbackFormId: string) {
  return db.select().from(userFeedbackFormsTable).where(eq(userFeedbackFormsTable.feedbackFormId, feedbackFormId));
}

