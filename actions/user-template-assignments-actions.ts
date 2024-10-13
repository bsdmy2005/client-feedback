"use server";

import { db } from "@/db/db";
import { createAssignment, deleteAssignment, getAllAssignments, getAssignmentsByUserId, getAssignmentsByTemplateId } from "@/db/queries/user-template-assignments-queries";
import { NewUserTemplateAssignment, UserTemplateAssignment } from "@/db/schema/user-template-assignments-schema";
import { ActionResult } from "@/types/actions/actions-types";
import { revalidatePath } from "next/cache";
import { userTemplateAssignmentsTable } from '@/db/schema/user-template-assignments-schema';
import { eq, and } from "drizzle-orm";
import { feedbackFormTemplatesTable } from "@/db/schema/feedback-form-templates-schema";
import { userFeedbackFormsTable } from "@/db/schema/user-feedback-forms-schema";
import { feedbackFormsTable } from "@/db/schema/feedback-forms-schema";
import { deleteUserFeedbackForm } from "@/db/queries/user-feedback-forms-queries";
import { deleteUserPendingFeedbackFormsByUserAndTemplateId } from "@/db/queries/user-feedback-forms-queries";

type UserAssignment = {
  userId: string;
  userEmail: string;
};

export async function createAssignmentAction(data: NewUserTemplateAssignment): Promise<ActionResult<UserTemplateAssignment>> {
  try {
    console.log("Starting assignment creation process");
    const newAssignment = await createAssignment(data);
    console.log("Assignment created:", newAssignment);

    console.log("Generating user feedback forms");
    // Add logging here for form generation process

    console.log("Revalidating path");
    revalidatePath("/admin/user-assignments");

    console.log("Assignment process completed successfully");
    return { isSuccess: true, message: "Assignment created and user feedback forms generated successfully", data: newAssignment };
  } catch (error) {
    console.error("Failed to create assignment and generate user feedback forms:", error);
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

export async function assignUsersToTemplate(templateId: string, users: UserAssignment[]): Promise<ActionResult<void>> {
  console.log(`Starting assignUsersToTemplate for template ${templateId} and ${users.length} users`);
  try {
    await db.transaction(async (tx) => {
      console.log("Beginning database transaction");

      // Fetch the template details
      console.log(`Fetching template details for template ${templateId}`);
      const [template] = await tx.select()
        .from(feedbackFormTemplatesTable)
        .where(eq(feedbackFormTemplatesTable.id, templateId));

      if (!template) {
        console.error(`Template ${templateId} not found`);
        throw new Error("Template not found");
      }
      console.log("Template details fetched successfully");

      // Fetch all feedback forms associated with this template
      console.log(`Fetching feedback forms for template ${templateId}`);
      const feedbackFormsResult = await tx.select()
        .from(feedbackFormsTable)
        .where(eq(feedbackFormsTable.templateId, templateId));
      console.log(`Found ${feedbackFormsResult.length} feedback forms`);

      for (const user of users) {
        // Check if assignment already exists
        const existingAssignment = await tx.select()
          .from(userTemplateAssignmentsTable)
          .where(and(
            eq(userTemplateAssignmentsTable.userId, user.userId),
            eq(userTemplateAssignmentsTable.templateId, templateId)
          ))
          .limit(1);

        if (existingAssignment.length === 0) {
          // Create the user-template assignment
          console.log(`Creating user-template assignment for user ${user.userId}`);
          await tx.insert(userTemplateAssignmentsTable).values({
            userId: user.userId,
            userEmail: user.userEmail,
            templateId: templateId,
          });
          console.log("User-template assignment created successfully");

          // Create user feedback form entries for each associated form
          console.log(`Creating user feedback form entries for ${feedbackFormsResult.length} forms`);
          for (const form of feedbackFormsResult) {
            await tx.insert(userFeedbackFormsTable).values({
              userId: user.userId,
              feedbackFormId: form.id,
              status: "pending",
              dueDate: form.dueDate,
              clientName: form.clientName,
              templateName: template.name,
              templateId: templateId,
            });
            console.log(`Created user feedback form for form ID ${form.id}`);
          }
        } else {
          console.log(`Assignment already exists for user ${user.userId} and template ${templateId}`);
        }
      }

      console.log("All user assignments and feedback forms created successfully");
    });

    console.log("Database transaction completed successfully");
    revalidatePath("/admin/user-assignments");
    return { isSuccess: true, message: "Users assigned to template and forms created successfully" };
  } catch (error) {
    console.error("Failed to assign users to template:", error);
    return { isSuccess: false, message: "Failed to assign users to template"};
  }
}

export async function removeUserFromTemplateAssignment(userId: string, templateId: string): Promise<ActionResult<void>> {
  try {
    await db.transaction(async (tx) => {
      // Delete the user-template assignment
      await deleteAssignment(userId, templateId)

      // Delete only pending user feedback forms
      await deleteUserPendingFeedbackFormsByUserAndTemplateId(userId, templateId)
    })

    revalidatePath("/")
    return { isSuccess: true, message: "User removed from template assignment successfully" }
  } catch (error) {
    console.error("Failed to remove user from template assignment:", error)
    return { isSuccess: false, message: "Failed to remove user from template assignment" }
  }
}
