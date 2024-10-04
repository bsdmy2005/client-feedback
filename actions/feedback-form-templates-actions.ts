"use server";	


import { db } from "@/db/db";
import { feedbackFormTemplatesTable, Template } from "@/db/schema/feedback-form-templates-schema";
import { 	ActionResult } from "@/types/actions/actions-types";
import { eq } from "drizzle-orm";

// Helper function to log database operations
function logDbOperation(operation: string, details: any) {
  console.log(`DB Operation: ${operation}`, JSON.stringify(details, null, 2));
}

export async function createFeedbackFormTemplate(
  clientId: string,
  name: string,
  recurrenceInterval: number,
  startDate: Date,
  questionIds: string[]
): Promise<ActionResult<{ id: string }>> {
  try {
    logDbOperation("Insert", { table: "feedbackFormTemplates", clientId, name });
    const [newTemplate] = await db.insert(feedbackFormTemplatesTable).values({
      clientId,
      name,
      recurrenceInterval: 7, // Default value, adjust as needed
      startDate: new Date(), // Current date, adjust as needed
      questionIds: [], // Empty array, adjust as needed
      // Add any other required fields
    }).returning({ id: feedbackFormTemplatesTable.id });

    return { isSuccess: true, message: "Feedback form template created successfully", data: { id: newTemplate.id } };
  } catch (error) {
    console.error("Failed to create feedback form template:", error);
    return { isSuccess: false, message: "Failed to create feedback form template" };
  }
}

export async function updateFeedbackFormTemplate(
  id: string,
  updates: Partial<{ name: string; recurrenceInterval: number; startDate: Date; questionIds: string[] }>
): Promise<ActionResult<void>> {
  try {
    const updatesWithStringDate = {
      ...updates,
      startDate: updates.startDate?.toISOString(),
    };
    const updatesWithDateObject = {
      ...updatesWithStringDate,
      startDate: updatesWithStringDate.startDate ? new Date(updatesWithStringDate.startDate) : undefined
    };
    logDbOperation("Update", { table: "feedbackFormTemplates", id, updates: updatesWithDateObject });
    await db.update(feedbackFormTemplatesTable).set(updatesWithDateObject).where(eq(feedbackFormTemplatesTable.id, id));
    return { isSuccess: true, message: "Feedback form template updated successfully" };
  } catch (error) {
    console.error("Failed to update feedback form template:", error);
    return { isSuccess: false, message: "Failed to update feedback form template" };
  }
}

export async function deleteFeedbackFormTemplate(id: string): Promise<ActionResult<void>> {
  try {
    logDbOperation("Delete", { table: "feedbackFormTemplates", id });
    await db.delete(feedbackFormTemplatesTable).where(eq(feedbackFormTemplatesTable.id, id));
    return { isSuccess: true, message: "Feedback form template deleted successfully" };
  } catch (error) {
    console.error("Failed to delete feedback form template:", error);
    return { isSuccess: false, message: "Failed to delete feedback form template" };
  }
}

export async function getTemplatesByClientId(clientId: string) {
  try {
    logDbOperation("Select", { table: "feedbackFormTemplates", clientId });
    const templates = await db.select().from(feedbackFormTemplatesTable).where(eq(feedbackFormTemplatesTable.clientId, clientId));
    return { isSuccess: true, message: "Templates fetched successfully", data: templates };
  } catch (error) {
    console.error("Failed to fetch templates:", error);
    return { isSuccess: false, message: "Failed to fetch templates" };
  }
}

export async function getAllTemplates(): Promise<ActionResult<Template[]>> {
  try {
    logDbOperation("Select All", { table: "feedbackFormTemplates" });
    const templates = await db.select().from(feedbackFormTemplatesTable);
    return { isSuccess: true, message: "Templates fetched successfully", data: templates };
  } catch (error) {
    console.error("Failed to fetch templates:", error);
    return { isSuccess: false, message: "Failed to fetch templates" };
  }
}

// Wrap the imported function to add logging
export async function getTemplateById(id: string): Promise<ActionResult<Template | null>> {
  logDbOperation("Select", { table: "feedbackFormTemplates", id });
  return await getTemplateById(id);
}