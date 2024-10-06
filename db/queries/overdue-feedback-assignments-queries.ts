"use server";

import { db } from "../db";
import { overdueFeedbackAssignmentsTable } from "../schema/overdue-feedback-assignments-schema";
import { eq, and } from "drizzle-orm";

export const getOverdueAssignmentsByUserId = async (userId: string) => {
  return db.select().from(overdueFeedbackAssignmentsTable).where(eq(overdueFeedbackAssignmentsTable.userId, userId));
};

export const getOverdueAssignmentsByTemplateId = async (templateId: string) => {
  return db.select().from(overdueFeedbackAssignmentsTable).where(eq(overdueFeedbackAssignmentsTable.templateId, templateId));
};

export const getOverdueAssignment = async (userId: string, templateId: string) => {
  const [assignment] = await db.select().from(overdueFeedbackAssignmentsTable)
    .where(and(
      eq(overdueFeedbackAssignmentsTable.userId, userId),
      eq(overdueFeedbackAssignmentsTable.templateId, templateId)
    ));
  return assignment;
};