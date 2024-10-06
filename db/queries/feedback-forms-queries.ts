"use server";

import { db } from "../db";
import { feedbackFormsTable } from "../schema/feedback-forms-schema";
import { userTemplateAssignmentsTable } from "../schema/user-template-assignments-schema";
import { eq, and } from "drizzle-orm";

export const getFeedbackFormsByUserId = async (userId: string) => {
  return db
    .select({
      form: feedbackFormsTable,
    })
    .from(feedbackFormsTable)
    .innerJoin(
      userTemplateAssignmentsTable,
      eq(userTemplateAssignmentsTable.templateId, feedbackFormsTable.templateId)
    )
    .where(eq(userTemplateAssignmentsTable.userId, userId));
};

export const getFeedbackFormById = async (id: string) => {
  const [form] = await db.select().from(feedbackFormsTable).where(eq(feedbackFormsTable.id, id));
  return form;
};

export const getFeedbackFormsByTemplateId = async (templateId: string) => {
  return db.select().from(feedbackFormsTable).where(eq(feedbackFormsTable.templateId, templateId));
};

export const getFeedbackFormsByClientId = async (clientId: string) => {
  return db.select().from(feedbackFormsTable).where(eq(feedbackFormsTable.clientId, clientId));
};

export const getPendingFeedbackForms = async () => {
  return db.select().from(feedbackFormsTable).where(eq(feedbackFormsTable.status, "pending"));
};

export const getAllFeedbackForms = async () => {
  return db.select().from(feedbackFormsTable);
};