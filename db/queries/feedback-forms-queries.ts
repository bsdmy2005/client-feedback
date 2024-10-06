"use server";

import { db } from "../db";
import { feedbackFormsTable } from "../schema/feedback-forms-schema";
import { eq, and } from "drizzle-orm";

export const getFeedbackFormsByUserId = async (userId: string) => {
  return db.select().from(feedbackFormsTable).where(eq(feedbackFormsTable.userId, userId));
};

export const getFeedbackFormById = async (id: string) => {
  const [form] = await db.select().from(feedbackFormsTable).where(eq(feedbackFormsTable.id, id));
  return form;
};

export const getFeedbackFormsByTemplateId = async (templateId: string) => {
  return db.select().from(feedbackFormsTable).where(eq(feedbackFormsTable.templateId, templateId));
};

export const getPendingFeedbackForms = async () => {
  return db.select().from(feedbackFormsTable).where(eq(feedbackFormsTable.status, "pending"));
};