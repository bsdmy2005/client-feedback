"use server";

import { revalidatePath } from "next/cache";
import { ActionResult } from "@/types/actions/actions-types";
import { NewUserFeedbackForm, UserFeedbackForm } from "@/db/schema/user-feedback-forms-schema";
import * as queries from "@/db/queries/user-feedback-forms-queries";
import { getUserFeedbackFormsByFeedbackFormId } from "@/db/queries/user-feedback-forms-queries";

export async function createUserFeedbackFormAction(data: NewUserFeedbackForm): Promise<ActionResult<UserFeedbackForm>> {
  try {
    const newUserFeedbackForm = await queries.createUserFeedbackForm({
      ...data,
      status: data.status || 'pending' // Default to 'pending' if no status is provided
    });
    revalidatePath("/");
    return { isSuccess: true, data: newUserFeedbackForm, message: "User feedback form created successfully" };
  } catch (error) {
    console.error("Failed to create user feedback form:", error);
    return { isSuccess: false, message: "Failed to create user feedback form" };
  }
}

export async function getUserFeedbackFormByIdAction(id: string): Promise<ActionResult<UserFeedbackForm | null>> {
  try {
    const userFeedbackForm = await queries.getUserFeedbackFormById(id);
    return { isSuccess: true, data: userFeedbackForm, message: "User feedback form retrieved successfully" };
  } catch (error) {
    console.error("Failed to get user feedback form:", error);
    return { isSuccess: false, message: "Failed to get user feedback form" };
  }
}

export async function getUserFeedbackFormsByUserIdAction(userId: string): Promise<ActionResult<UserFeedbackForm[]>> {
  try {
    const userFeedbackForms = await queries.getUserFeedbackFormsByUserId(userId);
    return { isSuccess: true, data: userFeedbackForms, message: "User feedback forms retrieved successfully" };
  } catch (error) {
    console.error("Failed to get user feedback forms:", error);
    return { isSuccess: false, message: "Failed to get user feedback forms" };
  }
}

export async function updateUserFeedbackFormAction(id: string, data: Partial<NewUserFeedbackForm>): Promise<ActionResult<UserFeedbackForm>> {
  try {
    const updatedUserFeedbackForm = await queries.updateUserFeedbackForm(id, data);
    revalidatePath("/");
    return { isSuccess: true, data: updatedUserFeedbackForm, message: "User feedback form updated successfully" };
  } catch (error) {
    console.error("Failed to update user feedback form:", error);
    return { isSuccess: false, message: "Failed to update user feedback form" };
  }
}

export async function deleteUserFeedbackFormAction(id: string): Promise<ActionResult<void>> {
  try {
    await queries.deleteUserFeedbackForm(id);
    revalidatePath("/");
    return { isSuccess: true, message: "User feedback form deleted successfully" };
  } catch (error) {
    console.error("Failed to delete user feedback form:", error);
    return { isSuccess: false, message: "Failed to delete user feedback form" };
  }
}

export async function getUserFeedbackFormsWithDetailsAction(userId: string): Promise<ActionResult<UserFeedbackForm[]>> {
  try {
    const userFeedbackFormsWithDetails = await queries.getUserFeedbackFormsWithDetails(userId);
    return { isSuccess: true, data: userFeedbackFormsWithDetails, message: "User feedback forms with details retrieved successfully" };
  } catch (error) {
    console.error("Failed to get user feedback forms with details:", error);
    return { isSuccess: false, message: "Failed to get user feedback forms with details" };
  }
}

export async function getUserFeedbackForms(feedbackFormId: string): Promise<ActionResult<UserFeedbackForm[]>> {
  try {
    const userForms = await getUserFeedbackFormsByFeedbackFormId(feedbackFormId);
    return { isSuccess: true, message: "User feedback forms retrieved successfully", data: userForms };
  } catch (error) {
    console.error("Error getting user feedback forms:", error);
    return { isSuccess: false, message: "Failed to get user feedback forms" };
  }
}

export async function getUserFeedbackFormByUserAndFormId(userId: string, feedbackFormId: string): Promise<ActionResult<UserFeedbackForm | null>> {
  try {
    const userFeedbackForm = await queries.getUserFeedbackFormByUserAndFormId(userId, feedbackFormId);
    return { isSuccess: true, data: userFeedbackForm, message: "User feedback form retrieved successfully" };
  } catch (error) {
    console.error("Failed to get user feedback form:", error);
    return { isSuccess: false, message: "Failed to get user feedback form" };
  }
}