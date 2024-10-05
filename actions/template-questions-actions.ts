"use server";

import { ActionResult } from "@/types/actions/actions-types";
import { getTemplateQuestions, addTemplateQuestion, removeTemplateQuestion } from "@/db/queries/template-questions-queries";
import { NewTemplateQuestion, TemplateQuestion } from "@/db/schema/template-questions-schema";
import { revalidatePath } from "next/cache";

export async function getTemplateQuestionsAction(templateId: string): Promise<ActionResult<TemplateQuestion[]>> {
  try {
    const questions = await getTemplateQuestions(templateId);
    return { isSuccess: true, data: questions, message: "Questions retrieved successfully" };
  } catch (error) {
    console.error("Failed to get template questions:", error);
    return { isSuccess: false, message: "Failed to get template questions" };
  }
}

export async function addTemplateQuestionAction(templateQuestion: NewTemplateQuestion): Promise<ActionResult<TemplateQuestion>> {
  try {
    const added = await addTemplateQuestion(templateQuestion);
    revalidatePath("/");
    return { isSuccess: true, data: added, message: "Template question added successfully" };
  } catch (error) {
    console.error("Failed to add template question:", error);
    return { isSuccess: false, message: "Failed to add template question" };
  }
}

export async function removeTemplateQuestionAction(templateId: string, questionId: string): Promise<ActionResult<void>> {
  try {
    await removeTemplateQuestion(templateId, questionId);
    revalidatePath("/");
    return { isSuccess: true, message: "Template question removed successfully" };
  } catch (error) {
    console.error("Failed to remove template question:", error);
    return { isSuccess: false, message: "Failed to remove template question" };
  }
}