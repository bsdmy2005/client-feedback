import { db } from "@/db/db";
import { feedbackFormTemplatesTable } from "@/db/schema/feedback-form-templates-schema";
import {  getTemplateById } from "@/db/queries/feedback-form-templates-queries";
import { ActionResult } from "@/types/actions/actions-types";
import { eq } from "drizzle-orm";

export async function createFeedbackFormTemplate(
  clientId: string,
  name: string,
  recurrenceInterval: number,
  startDate: Date
): Promise<ActionResult<{ id: string }>> {
  try {
    const [newTemplate] = await db.insert(feedbackFormTemplatesTable).values({
      
      name,
      recurrenceInterval: 0, // Add this line
      startDate: new Date().toISOString(), // Add this line
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
    await db.update(feedbackFormTemplatesTable).set(updatesWithStringDate).where(eq(feedbackFormTemplatesTable.id, id));
    return { isSuccess: true, message: "Feedback form template updated successfully" };
  } catch (error) {
    console.error("Failed to update feedback form template:", error);
    return { isSuccess: false, message: "Failed to update feedback form template" };
  }
}

export async function deleteFeedbackFormTemplate(id: string): Promise<ActionResult<void>> {
  try {
    await db.delete(feedbackFormTemplatesTable).where(eq(feedbackFormTemplatesTable.id, id));
    return { isSuccess: true, message: "Feedback form template deleted successfully" };
  } catch (error) {
    console.error("Failed to delete feedback form template:", error);
    return { isSuccess: false, message: "Failed to delete feedback form template" };
  }
}

export {  getTemplateById };