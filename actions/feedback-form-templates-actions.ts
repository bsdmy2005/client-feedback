"use server";	


import { db } from "@/db/db";
import { feedbackFormTemplatesTable, Template } from "@/db/schema/feedback-form-templates-schema";
import { 	ActionResult } from "@/types/actions/actions-types";
import { eq } from "drizzle-orm";
import { templateQuestionsTable } from "@/db/schema/template-questions-schema";

// Helper function to log database operations
function logDbOperation(operation: string, details: any) {
  console.log(`DB Operation: ${operation}`, JSON.stringify(details, null, 2));
}

export async function createFeedbackFormTemplate(
  clientId: string,
  name: string,
  recurrenceInterval: number,
  startDate: Date
): Promise<ActionResult<{ id: string }>> {
  try {
    logDbOperation("Insert", { table: "feedbackFormTemplates", clientId, name });
    const [newTemplate] = await db.insert(feedbackFormTemplatesTable).values({
      clientId,
      name,
      recurrenceInterval,
      startDate,
    }).returning({ id: feedbackFormTemplatesTable.id });

    return { isSuccess: true, message: "Feedback form template created successfully", data: { id: newTemplate.id } };
  } catch (error) {
    console.error("Failed to create feedback form template:", error);
    return { isSuccess: false, message: "Failed to create feedback form template" };
  }
}

export async function updateFeedbackFormTemplate(
  id: string,
  updates: Partial<{ name: string; recurrenceInterval: number; startDate: Date }>
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
    // Start a transaction
    await db.transaction(async (tx) => {
      // First, delete entries from templateQuestionsTable
      logDbOperation("Delete", { table: "templateQuestions", templateId: id });
      await tx.delete(templateQuestionsTable)
        .where(eq(templateQuestionsTable.templateId, id));

      // Then, delete the feedback form template
      logDbOperation("Delete", { table: "feedbackFormTemplates", id });
      await tx.delete(feedbackFormTemplatesTable)
        .where(eq(feedbackFormTemplatesTable.id, id));
    });

    return { isSuccess: true, message: "Feedback form template and associated questions deleted successfully" };
  } catch (error) {
    console.error("Failed to delete feedback form template and associated questions:", error);
    return { isSuccess: false, message: "Failed to delete feedback form template and associated questions" };
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


// Add this function if it doesn't exist
export async function getTemplateById(id: string): Promise<ActionResult<Template>> {
  try {
    const template = await db
      .select()
      .from(feedbackFormTemplatesTable)
      .where(eq(feedbackFormTemplatesTable.id, id))
      .limit(1)
      .then(rows => rows[0] || null);

    if (!template) {
      return { isSuccess: false, message: "Template not found" };
    }

    return { isSuccess: true, data: template, message: "Template retrieved successfully" };
  } catch (error) {
    console.error("Failed to get template:", error);
    return { isSuccess: false, message: "Failed to get template" };
  }
}