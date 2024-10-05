"use server";

import { db } from "@/db/db";
import { eq, and } from "drizzle-orm";
import { userTemplateAssignmentsTable, UserTemplateAssignment, NewUserTemplateAssignment } from "../schema/user-template-assignments-schema";

export const createAssignment = async (data: NewUserTemplateAssignment): Promise<UserTemplateAssignment> => {
  const [newAssignment] = await db.insert(userTemplateAssignmentsTable).values(data).returning();
  return newAssignment;
};

export const getAssignmentsByUserId = async (userId: string): Promise<UserTemplateAssignment[]> => {
  return db.select().from(userTemplateAssignmentsTable).where(eq(userTemplateAssignmentsTable.userId, userId));
};

export const getAssignmentsByTemplateId = async (templateId: string): Promise<UserTemplateAssignment[]> => {
  return db.select().from(userTemplateAssignmentsTable).where(eq(userTemplateAssignmentsTable.templateId, templateId));
};

export const deleteAssignment = async (userId: string, templateId: string): Promise<void> => {
  await db.delete(userTemplateAssignmentsTable)
    .where(
      and(
        eq(userTemplateAssignmentsTable.userId, userId),
        eq(userTemplateAssignmentsTable.templateId, templateId)
      )
    );
};

export const getAllAssignments = async (): Promise<UserTemplateAssignment[]> => {
  return db.select().from(userTemplateAssignmentsTable);
};