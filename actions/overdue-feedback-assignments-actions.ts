"use server";

import { db } from "@/db/db";
import { overdueFeedbackAssignmentsTable, OverdueFeedbackAssignment } from "@/db/schema/overdue-feedback-assignments-schema";
import { feedbackFormsTable } from "@/db/schema/feedback-forms-schema";
import { userTemplateAssignmentsTable } from "@/db/schema/user-template-assignments-schema";
import { ActionResult } from "@/types/actions/actions-types";
import { eq, and, lt } from "drizzle-orm";

function logDbOperation(operation: string, details: any) {
  console.log(`DB Operation: ${operation}`, JSON.stringify(details, null, 2));
}

export async function createOverdueFeedbackAssignment(
  userId: string,
  templateId: string,
  dueDate: Date
): Promise<ActionResult<{ id: string }>> {
  try {
    logDbOperation("Insert", { table: "overdueFeedbackAssignments", userId, templateId, dueDate });
    const [newAssignment] = await db.insert(overdueFeedbackAssignmentsTable).values({
      userId,
      templateId,
      dueDate,
    }).returning({ id: overdueFeedbackAssignmentsTable.id });

    return { isSuccess: true, message: "Overdue feedback assignment created successfully", data: { id: newAssignment.id } };
  } catch (error) {
    console.error("Failed to create overdue feedback assignment:", error);
    return { isSuccess: false, message: "Failed to create overdue feedback assignment" };
  }
}

export async function deleteOverdueFeedbackAssignment(id: string): Promise<ActionResult<void>> {
  try {
    logDbOperation("Delete", { table: "overdueFeedbackAssignments", id });
    await db.delete(overdueFeedbackAssignmentsTable).where(eq(overdueFeedbackAssignmentsTable.id, id));
    return { isSuccess: true, message: "Overdue feedback assignment deleted successfully" };
  } catch (error) {
    console.error("Failed to delete overdue feedback assignment:", error);
    return { isSuccess: false, message: "Failed to delete overdue feedback assignment" };
  }
}

export async function getOverdueFeedbackAssignments(): Promise<ActionResult<OverdueFeedbackAssignment[]>> {
  try {
    logDbOperation("Select", { table: "overdueFeedbackAssignments" });
    const assignments = await db.select().from(overdueFeedbackAssignmentsTable);
    return { isSuccess: true, message: "Overdue feedback assignments fetched successfully", data: assignments };
  } catch (error) {
    console.error("Failed to fetch overdue feedback assignments:", error);
    return { isSuccess: false, message: "Failed to fetch overdue feedback assignments" };
  }
}

export async function updateOverdueFeedbackAssignments(): Promise<ActionResult<void>> {
  try {
    const now = new Date();
    
    // Get all user-template assignments
    const assignments = await db.select().from(userTemplateAssignmentsTable);

    for (const assignment of assignments) {
      // Check if there's a completed feedback form for this assignment
      const completedForm = await db.select()
        .from(feedbackFormsTable)
        .where(and(
            
          eq(feedbackFormsTable.templateId, assignment.templateId),
          eq(feedbackFormsTable.status, "closed"), // Change "completed" to "closed"
          lt(feedbackFormsTable.dueDate, now)
        ))
        .limit(1);

      // If no completed form found, create or update an overdue assignment
      if (completedForm.length === 0) {
        const existingOverdueAssignment = await db.select()
          .from(overdueFeedbackAssignmentsTable)
          .where(and(
            eq(overdueFeedbackAssignmentsTable.userId, assignment.userId),
            eq(overdueFeedbackAssignmentsTable.templateId, assignment.templateId)
          ))
          .limit(1);

        if (existingOverdueAssignment.length === 0) {
          // Create new overdue assignment
          await createOverdueFeedbackAssignment(assignment.userId, assignment.templateId, now);
        } else {
          // Update existing overdue assignment
          await db.update(overdueFeedbackAssignmentsTable)
            .set({ updatedAt: now })
            .where(eq(overdueFeedbackAssignmentsTable.id, existingOverdueAssignment[0].id));
        }
      } else {
        // If a completed form exists, remove any existing overdue assignment
        await db.delete(overdueFeedbackAssignmentsTable)
          .where(and(
            eq(overdueFeedbackAssignmentsTable.userId, assignment.userId),
            eq(overdueFeedbackAssignmentsTable.templateId, assignment.templateId)
          ));
      }
    }

    return { isSuccess: true, message: "Overdue feedback assignments updated successfully" };
  } catch (error) {
    console.error("Failed to update overdue feedback assignments:", error);
    return { isSuccess: false, message: "Failed to update overdue feedback assignments" };
  }
}