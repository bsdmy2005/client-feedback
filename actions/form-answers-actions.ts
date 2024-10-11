"use server";

import { createFormAnswer, getFormAnswersByUserId, getFormAnswersByFormUserId, getFormAnswersByFeedbackFormId } from "@/db/queries/form-answers-queries";
import { NewFormAnswer, FormAnswer } from "@/db/schema/form-answers-schema";
import { ActionResult } from "@/types/actions/actions-types";
import { revalidatePath } from "next/cache";
import { updateUserFeedbackFormAction } from "./user-feedback-forms-actions";
import { db } from "@/db/db";
import { formAnswersTable } from "@/db/schema/form-answers-schema";
import { eq } from "drizzle-orm";
import { userFeedbackFormsTable } from "@/db/schema/user-feedback-forms-schema";

export async function submitFormAnswer(data: NewFormAnswer): Promise<ActionResult<FormAnswer>> {
  try {
    console.log("Submitting form answer with data:", JSON.stringify(data, null, 2));
    const newAnswer = await createFormAnswer(data);
    console.log("Created new answer:", JSON.stringify(newAnswer, null, 2));

    // Update the user feedback form status to "submitted"
    const updateResult = await updateUserFeedbackFormAction(data.formuserId, { status: "submitted" });
    if (!updateResult.isSuccess) {
      console.error("Failed to update user feedback form status:", updateResult.message);
    }

    revalidatePath("/");
    return { isSuccess: true, message: "Form answer submitted successfully", data: newAnswer };
  } catch (error) {
    console.error("Failed to submit form answer:", error);
    return { isSuccess: false, message: "Failed to submit form answer" };
  }
}

export async function getUserFormAnswers(userId: string): Promise<ActionResult<FormAnswer[]>> {
  try {
    const answers = await getFormAnswersByUserId(userId);
    return { isSuccess: true, message: "User form answers retrieved successfully", data: answers };
  } catch (error) {
    console.error("Failed to get user form answers:", error);
    return { isSuccess: false, message: "Failed to get user form answers" };
  }
}

export async function getFormUserAnswers(formUserId: string): Promise<ActionResult<FormAnswer[]>> {
  try {
    const answers = await getFormAnswersByFormUserId(formUserId);
    return { isSuccess: true, message: "Form user answers retrieved successfully", data: answers };
  } catch (error) {
    console.error("Failed to get form user answers:", error);
    return { isSuccess: false, message: "Failed to get form user answers" };
  }
}

export async function updateFormAnswersAction(data: {
  formId: string;
  userId: string;
  answers: Record<string, string>;
}): Promise<ActionResult<void>> {
  try {
    await db.update(formAnswersTable)
      .set({ 
        answers: data.answers,
        submittedAt: new Date()
      })
      .where(
        eq(formAnswersTable.formuserId, data.formId)
      );

    return { isSuccess: true, message: "Form answers updated successfully" };
  } catch (error) {
    console.error("Failed to update form answers:", error);
    return { isSuccess: false, message: "Failed to update form answers" };
  }
}

export async function deleteSubmission(formId: string) {
  await db.transaction(async (tx) => {
    // Delete the form answer
    await tx.delete(formAnswersTable).where(eq(formAnswersTable.formuserId, formId));

    // Update the user feedback form status to pending
    await tx.update(userFeedbackFormsTable)
      .set({ status: "pending" })
      .where(eq(userFeedbackFormsTable.id, formId));
  });
}

export async function getFormAnswers(feedbackFormId: string): Promise<ActionResult<FormAnswer[]>> {
  try {
    const answers = await getFormAnswersByFeedbackFormId(feedbackFormId);
    return { isSuccess: true, message: "Form answers retrieved successfully", data: answers };
  } catch (error) {
    console.error("Error getting form answers:", error);
    return { isSuccess: false, message: "Failed to get form answers" };
  }
}