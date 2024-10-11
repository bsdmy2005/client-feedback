"use server";

import { db } from "../db";
import { feedbackFormsTable, FeedbackForm } from "../schema/feedback-forms-schema";
import { userTemplateAssignmentsTable } from "../schema/user-template-assignments-schema";
import { userFeedbackFormsTable } from "../schema/user-feedback-forms-schema";
import { eq, and } from "drizzle-orm";

// Define the FeedbackFormWithProgress type
type FeedbackFormWithProgress = FeedbackForm & { percentComplete: number };

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

export async function getAllFeedbackFormsWithProgress(): Promise<FeedbackFormWithProgress[]> {
  const forms = await db.select().from(feedbackFormsTable);
  
  const formsWithProgress = await Promise.all(forms.map(async (form) => {
    const userForms = await db.select().from(userFeedbackFormsTable)
      .where(eq(userFeedbackFormsTable.feedbackFormId, form.id));
    
    const submittedCount = userForms.filter(uf => uf.status === 'submitted').length;
    const totalCount = userForms.length;
    const percentComplete = totalCount > 0 ? Math.round((submittedCount / totalCount) * 100) : 0;

    return { ...form, percentComplete };
  }));

  return formsWithProgress;
}