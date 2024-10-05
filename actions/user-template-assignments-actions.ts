"use server";

import { createAssignment, deleteAssignment, getAllAssignments, getAssignmentsByUserId, getAssignmentsByTemplateId } from "@/db/queries/user-template-assignments-queries";
import { NewUserTemplateAssignment, UserTemplateAssignment } from "@/db/schema/user-template-assignments-schema";
import { ActionResult } from "@/types/actions/actions-types";
import { revalidatePath } from "next/cache";

export async function createAssignmentAction(data: NewUserTemplateAssignment): Promise<ActionResult<UserTemplateAssignment>> {
  try {
    const newAssignment = await createAssignment(data);
    revalidatePath("/admin/user-assignments");
    return { isSuccess: true, message: "Assignment created successfully", data: newAssignment };
  } catch (error) {
    return { isSuccess: false, message: "Failed to create assignment" };
  }
}

export async function getAssignmentsByUserIdAction(userId: string): Promise<ActionResult<UserTemplateAssignment[]>> {
  try {
    const assignments = await getAssignmentsByUserId(userId);
    return { isSuccess: true, message: "Assignments retrieved successfully", data: assignments };
  } catch (error) {
    return { isSuccess: false, message: "Failed to get assignments" };
  }
}

export async function getAssignmentsByTemplateIdAction(templateId: string): Promise<ActionResult<UserTemplateAssignment[]>> {
  try {
    const assignments = await getAssignmentsByTemplateId(templateId);
    return { isSuccess: true, message: "Assignments retrieved successfully", data: assignments };
  } catch (error) {
    return { isSuccess: false, message: "Failed to get assignments" };
  }
}

export async function deleteAssignmentAction(userId: string, templateId: string): Promise<ActionResult<void>> {
  try {
    await deleteAssignment(userId, templateId);
    revalidatePath("/admin/user-assignments");
    return { isSuccess: true, message: "Assignment deleted successfully" };
  } catch (error) {
    return { isSuccess: false, message: "Failed to delete assignment" };
  }
}

export async function getAllAssignmentsAction(): Promise<ActionResult<UserTemplateAssignment[]>> {
  try {
    const assignments = await getAllAssignments();
    return { isSuccess: true, message: "All assignments retrieved successfully", data: assignments };
  } catch (error) {
    return { isSuccess: false, message: "Failed to get all assignments" };
  }
}