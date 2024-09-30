"use server"

import { db } from "@/db/db";
import { questionsTable } from "@/db/schema/questions-schema";
import { questionOptionsTable } from "@/db/schema/question-options-schema";
import { getQuestionById, getGlobalQuestions, getQuestionsByClientId, getQuestionsByTheme } from "@/db/queries/questions-queries";
import { ActionResult } from "@/types/actions/actions-types";
import { eq } from "drizzle-orm";

export async function createQuestion(
  questionText: string,
  questionType: 'free_text' | 'multiple_choice' | 'drop_down',
  questionTheme: "competition" | "environment" | "personal" | "bus_dev",
  global: boolean,
  clientId?: string,
  options?: string[]
): Promise<ActionResult<{ id: string }>> {
  try {
    const [newQuestion] = await db.insert(questionsTable).values({
      questionText,
      questionType,
      questionTheme,
      global: global ? "true" : "false",
      clientId: global ? undefined : clientId,
    }).returning({ id: questionsTable.id });

    if (options && options.length > 0) {
      await db.insert(questionOptionsTable).values(
        options.map(optionText => ({
          questionId: newQuestion.id,
          optionText
        }))
      );
    }

    return { isSuccess: true, message: "Question created successfully", data: { id: newQuestion.id } };
  } catch (error) {
    console.error("Failed to create question:", error);
    return { isSuccess: false, message: "Failed to create question" };
  }
}

export async function updateQuestion(
  id: string,
  updates: Partial<{
    questionText: string;
    questionType: 'free_text' | 'multiple_choice' | 'drop_down';
    questionTheme: "competition" | "environment" | "personal" | "bus_dev";
    global: "true" | "false";
    clientId?: string;
    options?: string[];
  }>
): Promise<ActionResult<void>> {
  try {
    const updateData = {
      ...(updates.questionText && { questionText: updates.questionText }),
      ...(updates.questionType && { questionType: updates.questionType }),
      ...(updates.questionTheme && { questionTheme: updates.questionTheme }),
      ...(updates.global && { global: updates.global }),
      ...(updates.clientId && { clientId: updates.clientId }),
    };
   
    await db.update(questionsTable).set(updateData).where(eq(questionsTable.id, id));

    if (updates.options) {
      await db.delete(questionOptionsTable).where(eq(questionOptionsTable.questionId, id));
      await db.insert(questionOptionsTable).values(
        updates.options.map(optionText => ({
          questionId: id,
          optionText
        }))
      );
    }

    return { isSuccess: true, message: "Question updated successfully" };
  } catch (error) {
    console.error("Failed to update question:", error);
    return { isSuccess: false, message: "Failed to update question" };
  }
}

export async function deleteQuestion(id: string): Promise<ActionResult<void>> {
  try {
    await db.delete(questionOptionsTable).where(eq(questionOptionsTable.questionId, id));
    await db.delete(questionsTable).where(eq(questionsTable.id, id));
    return { isSuccess: true, message: "Question deleted successfully" };
  } catch (error) {
    console.error("Failed to delete question:", error);
    return { isSuccess: false, message: "Failed to delete question" };
  }
}

export async function getAllQuestions(): Promise<ActionResult<any[]>> {
  try {
    const questions = await db.select().from(questionsTable);
    const options = await db.select().from(questionOptionsTable);

    const questionsWithOptions = questions.map(question => ({
      ...question,
      options: options.filter(option => option.questionId === question.id).map(option => option.optionText)
    }));

    return { isSuccess: true, message: "Questions retrieved successfully", data: questionsWithOptions };
  } catch (error) {
    console.error("Failed to retrieve questions:", error);
    return { isSuccess: false, message: "Failed to retrieve questions" };
  }
}

export { getQuestionById, getGlobalQuestions, getQuestionsByClientId, getQuestionsByTheme };