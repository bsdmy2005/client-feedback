"use server";

import { db } from "@/db/db";
import { feedbackFormsTable, FeedbackForm } from "@/db/schema/feedback-forms-schema";
import { feedbackFormTemplatesTable } from "@/db/schema/feedback-form-templates-schema";
import { userTemplateAssignmentsTable } from "@/db/schema/user-template-assignments-schema";
import { clientsTable } from "@/db/schema/clients-schema";
import { ActionResult } from "@/types/actions/actions-types";
import { eq, and } from "drizzle-orm";
import { getTemplateById } from "@/db/queries/feedback-form-templates-queries";
import { userFeedbackFormsTable } from "@/db/schema/user-feedback-forms-schema";
import { createUserFeedbackFormAction } from "@/actions/user-feedback-forms-actions";
import { getAssignmentsByUserIdAction,getAssignmentsByTemplateIdAction,getAllAssignmentsAction } from "@/actions/user-template-assignments-actions";
import { formAnswersTable } from "@/db/schema/form-answers-schema";
import { getUserProfileById } from "@/actions/profiles-actions";
import { getTemplateQuestionsWithDetails } from "@/db/queries/template-questions-queries";

function logDbOperation(operation: string, details: any) {
  console.log(`DB Operation: ${operation}`, JSON.stringify(details, null, 2));
}

export async function createFeedbackForm(
  templateId: string,
  firstDueDate: Date,
  recurrenceInterval: number,
  quantity: number
): Promise<ActionResult<{ ids: string[] }>> {
  console.log(`Starting createFeedbackForm: templateId=${templateId}, firstDueDate=${firstDueDate}, recurrenceInterval=${recurrenceInterval}, quantity=${quantity}`);
  try {
    const template = await getTemplateById(templateId);
    if (!template) {
      console.log(`Template not found for templateId: ${templateId}`);
      return { isSuccess: false, message: "Template not found" };
    }
    console.log(`Template found: ${JSON.stringify(template)}`);

    const [client] = await db
      .select({
        clientId: clientsTable.clientId,
        clientName: clientsTable.name,
      })
      .from(clientsTable)
      .where(eq(clientsTable.clientId, template.clientId));

    if (!client) {
      console.log(`Client not found for clientId: ${template.clientId}`);
      return { isSuccess: false, message: "Client not found" };
    }
    console.log(`Client found: ${JSON.stringify(client)}`);

    // Get user assignments for this template
    const userAssignments = await getAssignmentsByTemplateIdAction(templateId);
    console.log(`User assignments: ${JSON.stringify(userAssignments)}`);

    const createdFormIds: string[] = [];
    let currentDueDate = new Date(firstDueDate);

    for (let i = 0; i < quantity; i++) {
      console.log(`Creating feedback form ${i + 1} of ${quantity}`);
      logDbOperation("Insert", { table: "feedbackForms", templateId, dueDate: currentDueDate });
      const [newForm] = await db.insert(feedbackFormsTable).values({
        templateId,
        templateName: template.name,
        clientId: client.clientId,
        clientName: client.clientName,
        dueDate: currentDueDate,
        status: 'pending', // Set initial status
      }).returning({ id: feedbackFormsTable.id });

      console.log(`New feedback form created: ${JSON.stringify(newForm)}`);
      createdFormIds.push(newForm.id);

      // Create user feedback forms for each assigned user
      console.log(`Creating user feedback forms for ${userAssignments.data?.length || 0} assigned users`);
      for (const assignment of userAssignments.data || []) {
        console.log(`Creating user feedback form for userId: ${assignment.userId}`);
        const { isSuccess, message } = await createUserFeedbackFormAction({
          userId: assignment.userId,
          dueDate: currentDueDate,
          feedbackFormId: newForm.id,
          status: 'pending',
          templateName: template.name,
          clientName: client.clientName,
          templateId: templateId,  // Use the original templateId here
        });
        if (!isSuccess) {
          console.error(`Error creating user feedback form for userId ${assignment.userId}:`, message);
          // Handle error as needed
        } else {
          console.log(`Successfully created user feedback form for userId ${assignment.userId}`);
        }
      }

      currentDueDate = new Date(currentDueDate.getTime() + recurrenceInterval * 24 * 60 * 60 * 1000);
      console.log(`Next due date set to: ${currentDueDate}`);
    }

    console.log(`Completed creating ${quantity} feedback form(s). Created form IDs: ${createdFormIds.join(', ')}`);
    return { isSuccess: true, message: "Feedback form(s) created successfully", data: { ids: createdFormIds } };
  } catch (error) {
    console.error("Failed to create feedback form(s):", error);
    return { isSuccess: false, message: "Failed to create feedback form(s)" };
  }
}

export async function updateFeedbackForm(
  id: string,
  updates: Partial<{ status: string; responses: any }>
): Promise<ActionResult<void>> {
  try {
    logDbOperation("Update", { table: "feedbackForms", id, updates });
    await db.update(feedbackFormsTable).set({
      ...updates,
      updatedAt: new Date(),
      status: updates.status as "pending" | "active" | "overdue" | "closed",
    }).where(eq(feedbackFormsTable.id, id));
    return { isSuccess: true, message: "Feedback form updated successfully" };
  } catch (error) {
    console.error("Failed to update feedback form:", error);
    return { isSuccess: false, message: "Failed to update feedback form" };
  }
}

export async function deleteFeedbackForm(id: string): Promise<ActionResult<void>> {
  try {
    // Start a transaction
    await db.transaction(async (tx) => {
      // Delete entries from userFeedbackFormsTable
      await tx.delete(userFeedbackFormsTable)
        .where(eq(userFeedbackFormsTable.feedbackFormId, id));

      // Delete the feedback form
      await tx.delete(feedbackFormsTable)
        .where(eq(feedbackFormsTable.id, id));
    });

    logDbOperation("Delete", { table: "feedbackForms and userFeedbackForms", id });
    return { isSuccess: true, message: "Feedback form and associated user entries deleted successfully" };
  } catch (error) {
    console.error("Failed to delete feedback form and associated user entries:", error);
    return { isSuccess: false, message: "Failed to delete feedback form and associated user entries" };
  }
}

export async function getFeedbackFormsByUserId(userId: string): Promise<ActionResult<FeedbackForm[]>> {
  console.log(`Starting getFeedbackFormsByUserId for userId: ${userId}`);
  try {
    logDbOperation("Select", { table: "feedbackForms", userId });
    const forms = await db
      .select({
        form: feedbackFormsTable,
      })
      .from(feedbackFormsTable)
      .innerJoin(
        userTemplateAssignmentsTable,
        eq(userTemplateAssignmentsTable.templateId, feedbackFormsTable.templateId)
      )
      .where(eq(userTemplateAssignmentsTable.userId, userId));

    console.log(`Retrieved ${forms.length} feedback forms for userId: ${userId}`);
    
    if (forms.length === 0) {
      console.log(`No feedback forms found for userId: ${userId}`);
    } else {
      console.log(`First form ID: ${forms[0].form.id}, Last form ID: ${forms[forms.length - 1].form.id}`);
    }

    return { isSuccess: true, message: "Feedback forms fetched successfully", data: forms.map(f => f.form) };
  } catch (error) {
    console.error(`Error in getFeedbackFormsByUserId for userId: ${userId}`, error);
    return { isSuccess: false, message: "Failed to fetch feedback forms" };
  } finally {
    console.log(`Finished getFeedbackFormsByUserId for userId: ${userId}`);
  }
}

function calculateDueDate(startDate: Date, recurrenceInterval: number): Date {
  const dueDate = new Date(startDate);
  dueDate.setDate(dueDate.getDate() + recurrenceInterval);
  return dueDate;
}

export async function createRecurringFeedbackForms(): Promise<ActionResult<void>> {
  try {
    const templates = await db.select().from(feedbackFormTemplatesTable);
    const today = new Date();

    for (const template of templates) {
      const [client] = await db
        .select({
          clientId: clientsTable.clientId,
          clientName: clientsTable.name,
        })
        .from(clientsTable)
        .where(eq(clientsTable.clientId, template.clientId));

      if (!client) {
        console.error(`Client not found for template ${template.id}`);
        continue;
      }

      const existingForms = await db.select().from(feedbackFormsTable)
        .where(eq(feedbackFormsTable.templateId, template.id));

      const lastFormDate = existingForms.length > 0
        ? Math.max(...existingForms.map(form => form.dueDate.getTime()))
        : template.startDate.getTime();

      let nextDueDate = new Date(lastFormDate);
      nextDueDate.setDate(nextDueDate.getDate() + template.recurrenceInterval);

      // Get user assignments for this template
      const userAssignments = await getAssignmentsByTemplateIdAction(template.id);

      while (nextDueDate <= today) {
        const [newForm] = await db.insert(feedbackFormsTable).values({
          templateId: template.id,
          templateName: template.name,
          clientId: client.clientId,
          clientName: client.clientName,
          dueDate: nextDueDate,
        }).returning({ id: feedbackFormsTable.id });

        // Create user feedback forms for each assigned user
        for (const assignment of userAssignments.data || []) {
          const { data, isSuccess, message } = await createUserFeedbackFormAction({
            userId: assignment.userId,
            dueDate: nextDueDate,
            feedbackFormId: newForm.id,
            templateName: template.name,
            clientName: client.clientName,
            templateId: template.id,
          });
          if (!isSuccess) {
            console.error('Error creating feedback form:', message);
            continue;
          }
          // Use data if needed
        }

        nextDueDate.setDate(nextDueDate.getDate() + template.recurrenceInterval);
      }
    }

    return { isSuccess: true, message: "Recurring feedback forms created successfully" };
  } catch (error) {
    console.error("Failed to create recurring feedback forms:", error);
    return { isSuccess: false, message: "Failed to create recurring feedback forms" };
  }
}

export async function getFeedbackFormById(id: string): Promise<ActionResult<FeedbackForm>> {
  try {
    const form = await db
      .select()
      .from(feedbackFormsTable)
      .where(eq(feedbackFormsTable.id, id))
      .limit(1)
      .then(rows => rows[0] || null);

    if (!form) {
      return { isSuccess: false, message: "Form not found" };
    }

    return { isSuccess: true, data: form, message: "Form retrieved successfully" };
  } catch (error) {
    console.error("Failed to get feedback form:", error);
    return { isSuccess: false, message: "Failed to get feedback form" };
  }
}

export async function getFeedbackFormDetails(id: string): Promise<ActionResult<FeedbackForm>> {
  try {
    const formResult = await getFeedbackFormById(id);
    if (!formResult.isSuccess || !formResult.data) {
      return { isSuccess: false, message: "Feedback form not found" };
    }
    return { isSuccess: true, message: "Feedback form details retrieved successfully", data: formResult.data };
  } catch (error) {
    console.error("Error getting feedback form details:", error);
    return { isSuccess: false, message: "Failed to get feedback form details" };
  }
}

export async function getFeedbackFormResponses(formId: string): Promise<ActionResult<any[]>> {
  try {
    // Fetch the feedback form to get the template ID
    const feedbackForm = await db.select().from(feedbackFormsTable).where(eq(feedbackFormsTable.id, formId)).limit(1);
    if (feedbackForm.length === 0) {
      return { isSuccess: false, message: "Feedback form not found" };
    }

    // Fetch questions for this template
    const questions = await getTemplateQuestionsWithDetails(feedbackForm[0].templateId);
    const questionMap = new Map(questions.map(q => [q.questionDetails.id, q.questionDetails.questionText]));

    // Fetch user feedback forms for this feedback form
    const userForms = await db.select().from(userFeedbackFormsTable)
      .where(eq(userFeedbackFormsTable.feedbackFormId, formId));

    // Fetch responses for each user feedback form
    const responses = await Promise.all(userForms.map(async (userForm) => {
      const formAnswer = await db.select().from(formAnswersTable)
        .where(eq(formAnswersTable.formuserId, userForm.id))
        .limit(1);

      const userProfile = await getUserProfileById(userForm.userId);

      const answers = formAnswer[0]?.answers as Record<string, string> || {};
      const formattedAnswers: Record<string, string> = {};
      
      for (const [questionId, answer] of Object.entries(answers)) {
        const questionText = questionMap.get(questionId) || 'Unknown Question';
        // Preserve the full text of the answer, including any formatting
        formattedAnswers[questionText] = answer;
      }

      return {
        userName: userProfile.isSuccess && userProfile.data 
          ? `${userProfile.data.firstName} ${userProfile.data.lastName}`
          : 'Unknown User',
        submittedAt: formAnswer[0]?.submittedAt || new Date(),
        answers: formattedAnswers
      };
    }));

    return { isSuccess: true, data: responses, message: "Responses retrieved successfully" };
  } catch (error) {
    console.error("Failed to get feedback form responses:", error);
    return { isSuccess: false, message: "Failed to get feedback form responses" };
  }
}