import { db } from "@/db/db";
import { eq, and } from "drizzle-orm";
import { templateQuestionsTable } from "@/db/schema";
import { NewTemplateQuestion, TemplateQuestion } from "@/db/schema/template-questions-schema";

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