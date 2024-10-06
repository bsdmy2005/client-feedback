import { db } from "@/db/db";
import { eq, and } from "drizzle-orm";
import { templateQuestionsTable } from "@/db/schema";
import { NewTemplateQuestion, TemplateQuestion } from "@/db/schema/template-questions-schema";
import { getQuestionById } from "@/actions/questions-actions";
import { getQuestionOptionsByQuestionId } from "@/actions/question-options-actions";

export async function getTemplateQuestions(templateId: string): Promise<TemplateQuestion[]> {
  return db.select().from(templateQuestionsTable).where(eq(templateQuestionsTable.templateId, templateId));
}

export async function addTemplateQuestion(templateQuestion: NewTemplateQuestion): Promise<TemplateQuestion> {
  const [inserted] = await db.insert(templateQuestionsTable).values(templateQuestion).returning();
  return inserted;
}

export async function removeTemplateQuestion(templateId: string, questionId: string): Promise<void> {
  await db.delete(templateQuestionsTable)
    .where(
      and(
        eq(templateQuestionsTable.templateId, templateId),
        eq(templateQuestionsTable.questionId, questionId)
      )
    );
}

export async function getTemplateQuestionsWithDetails(templateId: string): Promise<any[]> {
  const templateQuestions = await db
    .select()
    .from(templateQuestionsTable)
    .where(eq(templateQuestionsTable.templateId, templateId));

  const questionsWithDetails = await Promise.all(
    templateQuestions.map(async (tq) => {
      const questionResult = await getQuestionById(tq.questionId);
      if (questionResult && 'id' in questionResult) {
        const questionWithOptions = {
          questionDetails: {
            ...questionResult,
            options: [] as any[] // Initialize with an empty array
          }
        };

        // If the question is multiple choice, fetch the options
        const options = await getQuestionOptionsByQuestionId(questionResult.id);
        questionWithOptions.questionDetails.options = options.data || [];

        return questionWithOptions;
      }
      return tq;
    })
  );

  return questionsWithDetails;
}