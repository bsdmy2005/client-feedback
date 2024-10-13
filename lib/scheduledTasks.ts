import { eq, and, gte, lt } from 'drizzle-orm';
import { db } from '@/db/db';
import { userFeedbackFormsTable } from '@/db/schema/user-feedback-forms-schema';
import { sendEmailWithTemplate } from '@/lib/sendEmailWithTemplate';
import { getProfileByUserIdAction } from '@/actions/profiles-actions';
import { addDays, subDays } from 'date-fns';
import { sendTeamsMessage } from '@/lib/microsoftGraph';

export async function runDailyTasks() {
  await sendUpcomingFormReminders();
  await updateFormStatuses();
 // await sendTeamsNotifications();
}

async function sendUpcomingFormReminders() {
  const fiveDaysFromNow = addDays(new Date(), 5);
  const today = new Date();

  const upcomingForms = await db.select()
    .from(userFeedbackFormsTable)
    .where(
      and(
        gte(userFeedbackFormsTable.dueDate, today),
        lt(userFeedbackFormsTable.dueDate, fiveDaysFromNow),
        eq(userFeedbackFormsTable.status, 'active')
      )
    );

  for (const form of upcomingForms) {
    const userResult = await getProfileByUserIdAction(form.userId);
    
    if (userResult.isSuccess && userResult.data && userResult.data.email) {
      const user = userResult.data;
      
      try {
        const templateId = process.env.POSTMARK_FEEDBACK_FORM_REMINDER_TEMPLATE_ID;

        if (!templateId) {
          throw new Error('POSTMARK_FEEDBACK_FORM_REMINDER_TEMPLATE_ID is not set in environment variables');
        }
        
        const formattedDueDate = form.dueDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        const subject = `Reminder: ${form.templateName} due on ${formattedDueDate}`;

        await sendEmailWithTemplate({
          to: user.email as string,
          templateId: templateId,
          templateModel: {
            userName: user.firstName || 'Consultant',
            formName: form.templateName,
            dueDate: formattedDueDate,
            formLink: `${process.env.NEXT_PUBLIC_APP_URL}/feedback/form/${form.id}`,
            subject: subject
          }
        });

        console.log(`Reminder email sent to ${user.email} for form ${form.id}`);
      } catch (error) {
        console.error(`Failed to send reminder email for form ${form.id}:`, error);
      }
    } else {
      console.log(`Unable to send reminder email for form ${form.id}. User email not found.`);
    }
  }
}

async function sendTeamsNotifications() {
  const today = new Date();
  const fiveDaysFromNow = addDays(today, 5);

  const formsToNotify = await db.select()
    .from(userFeedbackFormsTable)
    .where(
      and(
        gte(userFeedbackFormsTable.dueDate, today),
        lt(userFeedbackFormsTable.dueDate, fiveDaysFromNow),
        eq(userFeedbackFormsTable.status, 'active')
      )
    );

  for (const form of formsToNotify) {
    const userResult = await getProfileByUserIdAction(form.userId);
    
    if (userResult.isSuccess && userResult.data && userResult.data.email) {
      const user = userResult.data;
      
      try {
        const formattedDueDate = form.dueDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        const message = `Reminder: Your feedback form "${form.templateName}" is due on ${formattedDueDate}. Please complete it before the due date.`;
        
        // Add a null check here
        if (user.email) {
          const success = await sendTeamsMessage(user.email, message);
          
          if (success) {
            console.log(`Teams message successfully sent to ${user.email} for form ${form.id}`);
          } else {
            console.warn(`Failed to send Teams message to ${user.email} for form ${form.id}`);
          }
        } else {
          console.warn(`Unable to send Teams message for form ${form.id}. User email is null.`);
        }
      } catch (error) {
        console.error(`Error occurred while sending Teams message for form ${form.id}:`, error);
      }
    } else {
      console.log(`Unable to send Teams notification for form ${form.id}. User email not found.`);
    }
  }
}

async function updateFormStatuses() {
  const today = new Date();
  const oneWeekFromNow = addDays(today, 7);
  const yesterday = subDays(today, 1);

  // Update pending to active
  await db.update(userFeedbackFormsTable)
    .set({ status: 'active' })
    .where(
      and(
        eq(userFeedbackFormsTable.status, 'pending'),
        lt(userFeedbackFormsTable.dueDate, oneWeekFromNow)
      )
    );

  // Update active to overdue and send notifications
  const overdueForms = await db.select()
    .from(userFeedbackFormsTable)
    .where(
      and(
        eq(userFeedbackFormsTable.status, 'active'),
        lt(userFeedbackFormsTable.dueDate, yesterday)
      )
    );

  for (const form of overdueForms) {
    // Update status to overdue
    await db.update(userFeedbackFormsTable)
      .set({ status: 'overdue' })
      .where(eq(userFeedbackFormsTable.id, form.id));

    // Send notifications
    const userResult = await getProfileByUserIdAction(form.userId);
    
    if (userResult.isSuccess && userResult.data) {
      const user = userResult.data;
      
      if (user.email) {
        // Send email notification
        try {
          const templateId = process.env.POSTMARK_FEEDBACK_FORM_OVERDUE_TEMPLATE_ID;

          if (!templateId) {
            throw new Error('POSTMARK_FEEDBACK_FORM_OVERDUE_TEMPLATE_ID is not set in environment variables');
          }
          
          const formattedDueDate = form.dueDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });

          const subject = `Overdue: ${form.templateName} was due on ${formattedDueDate}`;

          await sendEmailWithTemplate({
            to: user.email,
            templateId: templateId,
            templateModel: {
              userName: user.firstName || 'Consultant',
              formName: form.templateName,
              dueDate: formattedDueDate,
              formLink: `${process.env.NEXT_PUBLIC_APP_URL}/feedback/form/${form.id}`,
              subject: subject
            }
          });

          console.log(`Overdue email sent to ${user.email} for form ${form.id}`);
        } catch (error) {
          console.error(`Failed to send overdue email for form ${form.id}:`, error);
        }

        // Send Teams message
        try {
          const formattedDueDate = form.dueDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });

          const message = `Your feedback form "${form.templateName}" is overdue. It was due on ${formattedDueDate}. Please complete it as soon as possible.`;
          
          const success = await sendTeamsMessage(user.email, message);
          
          if (success) {
            console.log(`Overdue Teams message successfully sent to ${user.email} for form ${form.id}`);
          } else {
            console.warn(`Failed to send overdue Teams message to ${user.email} for form ${form.id}`);
          }
        } catch (error) {
          console.error(`Error occurred while sending overdue Teams message for form ${form.id}:`, error);
        }
      }
    } else {
      console.log(`Unable to send notifications for form ${form.id}. User not found.`);
    }
  }
}
