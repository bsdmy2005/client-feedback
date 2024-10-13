"use server";

import { sendEmailWithTemplate } from "@/lib/sendEmailWithTemplate";
import { getProfileByUserIdAction } from "@/actions/profiles-actions";
import { ActionResult } from "@/types/actions/actions-types";

export async function sendReminderEmail(userId: string, formId: string, formName: string, dueDate: Date): Promise<ActionResult<void>> {
  try {
    const userResult = await getProfileByUserIdAction(userId);
    if (!userResult.isSuccess || !userResult.data || !userResult.data.email) {
      return { isSuccess: false, message: "User not found or has no email" };
    }

    const user = userResult.data;
    const templateId = process.env.POSTMARK_FEEDBACK_FORM_REMINDER_TEMPLATE_ID;
    
    if (!templateId) {
      throw new Error("POSTMARK_FEEDBACK_FORM_REMINDER_TEMPLATE_ID is not set in environment variables");
    }

    await sendEmailWithTemplate({
      to: user.email as string,
      templateId: templateId,
      templateModel: {
        userName: user.firstName || 'Consultant',
        formName: formName,
        dueDate: dueDate.toISOString().split('T')[0],
        formLink: `${process.env.NEXT_PUBLIC_APP_URL}/feedback/form/${formId}`
      }
    });

    return { isSuccess: true, message: "Reminder email sent successfully" };
  } catch (error) {
    console.error("Failed to send reminder email:", error);
    return { isSuccess: false, message: "Failed to send reminder email" };
  }
}
