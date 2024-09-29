import { db } from "@/db/db";
import { questionsTable } from "@/db/schema/questions-schema";
import { getQuestionById, getQuestionsByClientId, getGlobalQuestions } from "@/db/queries/questions-queries";
import { ActionResult } from "@/types/actions/actions-types";
import { eq } from "drizzle-orm";

export async function createQuestion(
  clientId: string | null,
  questionText: string,
  questionType: 'free_text' | 'multiple_choice' | 'drop_down'
): Promise<ActionResult<{ id: string }>> {
  try {
    const [newQuestion] = await db.insert(questionsTable).values({
      clientId,
      questionText,
      questionType,
    }).returning({ id: questionsTable.id });

    return { isSuccess: true, message: "Question created successfully", data: { id: newQuestion.id } };
  } catch (error) {
    console.error("Failed to create question:", error);
    return { isSuccess: false, message: "Failed to create question" };
  }
}

export async function updateQuestion(
  id: string,
  updates: Partial<{ questionText: string; questionType: 'free_text' | 'multiple_choice' | 'drop_down' }>
): Promise<ActionResult<void>> {
  try {
    await db.update(questionsTable).set(updates).where(eq(questionsTable.id, id));
    return { isSuccess: true, message: "Question updated successfully" };
  } catch (error) {
    console.error("Failed to update question:", error);
    return { isSuccess: false, message: "Failed to update question" };
  }
}

export async function deleteQuestion(id: string): Promise<ActionResult<void>> {
  try {
    await db.delete(questionsTable).where(eq(questionsTable.id, id));
    return { isSuccess: true, message: "Question deleted successfully" };
  } catch (error) {
    console.error("Failed to delete question:", error);
    return { isSuccess: false, message: "Failed to delete question" };
  }
}

export { getQuestionById, getQuestionsByClientId, getGlobalQuestions };