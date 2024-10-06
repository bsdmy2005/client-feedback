"use server";

import { db } from "@/db/db";
import { feedbackFormsTable, FeedbackForm } from "@/db/schema/feedback-forms-schema";
import { feedbackFormTemplatesTable } from "@/db/schema/feedback-form-templates-schema";
import { ActionResult } from "@/types/actions/actions-types";
import { eq } from "drizzle-orm";
import { getTemplateById } from "@/db/queries/feedback-form-templates-queries";

function logDbOperation(operation: string, details: any) {
  console.log(`DB Operation: ${operation}`, JSON.stringify(details, null, 2));
}

export async function createFeedbackForm(
  templateId: string,
  userId: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const template = await getTemplateById(templateId);
    if (!template) {
      return { isSuccess: false, message: "Template not found" };
    }

    const dueDate = calculateDueDate(template.startDate, template.recurrenceInterval);

    logDbOperation("Insert", { table: "feedbackForms", templateId, userId });
    const [newForm] = await db.insert(feedbackFormsTable).values({
      templateId,
      userId,
      dueDate,
    }).returning({ id: feedbackFormsTable.id });

    return { isSuccess: true, message: "Feedback form created successfully", data: { id: newForm.id } };
  } catch (error) {
    console.error("Failed to create feedback form:", error);
    return { isSuccess: false, message: "Failed to create feedback form" };
  }
}

export async function updateFeedbackForm(
  id: string,
  updates: Partial<{ status: string; responses: any }>
): Promise<ActionResult<void>> {
  try {
    logDbOperation("Update", { table: "feedbackForms", id, updates });
    await db.update(feedbackFormsTable).set({
      ...updates,
      updatedAt: new Date(),
    }).where(eq(feedbackFormsTable.id, id));
    return { isSuccess: true, message: "Feedback form updated successfully" };
  } catch (error) {
    console.error("Failed to update feedback form:", error);
    return { isSuccess: false, message: "Failed to update feedback form" };
  }
}

export async function deleteFeedbackForm(id: string): Promise<ActionResult<void>> {
  try {
    logDbOperation("Delete", { table: "feedbackForms", id });
    await db.delete(feedbackFormsTable).where(eq(feedbackFormsTable.id, id));
    return { isSuccess: true, message: "Feedback form deleted successfully" };
  } catch (error) {
    console.error("Failed to delete feedback form:", error);
    return { isSuccess: false, message: "Failed to delete feedback form" };
  }
}

export async function getFeedbackFormsByUserId(userId: string): Promise<ActionResult<FeedbackForm[]>> {
  try {
    logDbOperation("Select", { table: "feedbackForms", userId });
    const forms = await db.select().from(feedbackFormsTable).where(eq(feedbackFormsTable.userId, userId));
    return { isSuccess: true, message: "Feedback forms fetched successfully", data: forms };
  } catch (error) {
    console.error("Failed to fetch feedback forms:", error);
    return { isSuccess: false, message: "Failed to fetch feedback forms" };
  }
}

function calculateDueDate(startDate: Date, recurrenceInterval: number): Date {
  const dueDate = new Date(startDate);
  dueDate.setDate(dueDate.getDate() + recurrenceInterval);
  return dueDate;
}

export async function createRecurringFeedbackForms(): Promise<ActionResult<void>> {
  try {
    const templates = await db.select().from(feedbackFormTemplatesTable);
    const today = new Date();

    for (const template of templates) {
      const existingForms = await db.select().from(feedbackFormsTable)
        .where(eq(feedbackFormsTable.templateId, template.id));

      const lastFormDate = existingForms.length > 0
        ? Math.max(...existingForms.map(form => form.dueDate.getTime()))
        : template.startDate.getTime();

      let nextDueDate = new Date(lastFormDate);
      nextDueDate.setDate(nextDueDate.getDate() + template.recurrenceInterval);

      while (nextDueDate <= today) {
        await db.insert(feedbackFormsTable).values({
          templateId: template.id,
          userId: template.clientId, // Assuming clientId is the userId for now
          dueDate: nextDueDate,
        });

        nextDueDate.setDate(nextDueDate.getDate() + template.recurrenceInterval);
      }
    }

    return { isSuccess: true, message: "Recurring feedback forms created successfully" };
  } catch (error) {
    console.error("Failed to create recurring feedback forms:", error);
    return { isSuccess: false, message: "Failed to create recurring feedback forms" };
  }
}