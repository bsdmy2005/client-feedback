import { eq, and, gte, lt } from 'drizzle-orm';
import { db } from '@/db/db';
import { userFeedbackFormsTable } from '@/db/schema/user-feedback-forms-schema';
import { sendEmailWithTemplate } from '@/lib/sendEmailWithTemplate';
import { getProfileByUserIdAction } from '@/actions/profiles-actions';
import { addDays, subDays } from 'date-fns';
import { adhocFeedbackTable } from '@/db/schema/adhoc-feedback-schema';
import { clientsTable } from '@/db/schema/clients-schema';
import OpenAI from 'openai';

export async function runDailyTasks() {
  await sendUpcomingFormReminders();
  await updateFormStatuses();
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
      }
    } else {
      console.log(`Unable to send notifications for form ${form.id}. User not found.`);
    }
  }
}

export async function runWeeklyTasks() {
  await sendAdhocFeedbackSummary();
}

async function sendAdhocFeedbackSummary() {
  const oneWeekAgo = subDays(new Date(), 7);

  const feedbackData = await db.select({
    clientName: clientsTable.name,
    conversation: adhocFeedbackTable.conversation,
    createdAt: adhocFeedbackTable.createdAt,
  })
  .from(adhocFeedbackTable)
  .innerJoin(clientsTable, eq(adhocFeedbackTable.clientId, clientsTable.clientId))
  .where(gte(adhocFeedbackTable.createdAt, oneWeekAgo));

  if (feedbackData.length === 0) {
    console.log("No adhoc feedback to summarize this week");
    return;
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const prompt = `Summarize the following adhoc feedback from the past week, grouped by client:

${JSON.stringify(feedbackData, null, 2)}

Please provide a concise summary for each client, highlighting key points and any recurring themes or issues.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 1000,
  });

  const summary = completion.choices[0].message.content;

  const templateId = process.env.POSTMARK_ADHOC_FEEDBACK_SUMMARY_TEMPLATE_ID;
  if (!templateId) {
    throw new Error("POSTMARK_ADHOC_FEEDBACK_SUMMARY_TEMPLATE_ID is not set in environment variables");
  }

  await sendEmailWithTemplate({
    to: process.env.EXECUTIVE_TEAM_EMAIL as string,
    templateId: templateId,
    templateModel: {
      subject: "Weekly Adhoc Feedback Summary",
      summary: summary,
    },
  });

  console.log("Adhoc feedback summary sent to executive team");
}
