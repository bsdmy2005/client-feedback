"use server";

import { db } from "@/db/db";
import { templateQuestionsTable } from "@/db/schema/template-questions-schema";
import { ActionResult } from "@/types/actions/actions-types";
import { eq, and } from "drizzle-orm";
import { getTemplateQuestions, addTemplateQuestion, updateTemplateQuestionOrder, getTemplateQuestionsWithDetails } from "@/db/queries/template-questions-queries";

export async function getTemplateQuestionsAction(templateId: string): Promise<ActionResult<any[]>> {
  try {
    const questions = await getTemplateQuestions(templateId);
    return { isSuccess: true, data: questions, message: "Template questions fetched successfully" };
  } catch (error) {
    console.error("Failed to fetch template questions:", error);
    return { isSuccess: false, message: "Failed to fetch template questions" };
  }
}

export async function addTemplateQuestionAction(data: { templateId: string; questionId: string; order: number }): Promise<ActionResult<void>> {
  try {
    await addTemplateQuestion({ templateId: data.templateId, questionId: data.questionId, order: data.order });
    return { isSuccess: true, message: "Question added to template successfully" };
  } catch (error) {
    console.error("Failed to add question to template:", error);
    return { isSuccess: false, message: "Failed to add question to template" };
  }
}

export async function updateTemplateQuestionOrderAction(templateId: string, questionId: string, order: number): Promise<ActionResult<void>> {
  try {
    await db.update(templateQuestionsTable)
      .set({ order })
      .where(
        and(
          eq(templateQuestionsTable.templateId, templateId),
          eq(templateQuestionsTable.questionId, questionId)
        )
      );
    return { isSuccess: true, message: "Question order updated successfully" };
  } catch (error) {
    console.error("Failed to update question order:", error);
    return { isSuccess: false, message: "Failed to update question order" };
  }
}

export async function removeTemplateQuestionAction(templateId: string, questionId: string): Promise<ActionResult<void>> {
  try {
    await db
      .delete(templateQuestionsTable)
      .where(
        eq(templateQuestionsTable.templateId, templateId) &&
        eq(templateQuestionsTable.questionId, questionId)
      );
    return { isSuccess: true, message: "Question removed from template successfully" };
  } catch (error) {
    console.error("Failed to remove question from template:", error);
    return { isSuccess: false, message: "Failed to remove question from template" };
  }
}

