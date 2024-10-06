import { db } from "@/db/db";
import { QuestionOption, questionOptionsTable } from "@/db/schema/question-options-schema";
import { getOptionsByQuestionId } from "@/db/queries/question-options-queries";
import { ActionResult } from "@/types/actions/actions-types";
import { eq } from 'drizzle-orm';

export async function createQuestionOption(
  questionId: string,
  optionText: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const [newOption] = await db.insert(questionOptionsTable).values({
      questionId,
      optionText,
    }).returning({ id: questionOptionsTable.id });

    return { isSuccess: true, message: "Question option created successfully", data: { id: newOption.id } };
  } catch (error) {
    console.error("Failed to create question option:", error);
    return { isSuccess: false, message: "Failed to create question option" };
  }
}

export async function updateQuestionOption(
  id: string,
  optionText: string
): Promise<ActionResult<void>> {
  try {
    await db.update(questionOptionsTable).set({ optionText }).where(eq(questionOptionsTable.id, id));
    return { isSuccess: true, message: "Question option updated successfully" };
  } catch (error) {
    console.error("Failed to update question option:", error);
    return { isSuccess: false, message: "Failed to update question option" };
  }
}

export async function deleteQuestionOption(id: string): Promise<ActionResult<void>> {
  try {
    await db.delete(questionOptionsTable).where(eq(questionOptionsTable.id, id));
    return { isSuccess: true, message: "Question option deleted successfully"};
  } catch (error) {
    console.error("Failed to delete question option:", error);
    return { isSuccess: false, message: "Failed to delete question option" };
  }
}

export async function getQuestionOptionsByQuestionId(questionId: string): Promise<ActionResult<QuestionOption[]>> {
  try {
    const options = await getOptionsByQuestionId(questionId);
    return { isSuccess: true, message: "Question options fetched successfully", data: options };
  } catch (error) {
    console.error("Failed to fetch question options:", error);
    return { isSuccess: false, message: "Failed to fetch question options" };
  }
}

