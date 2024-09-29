import { db } from "../db";
import { feedbackFormTemplatesTable } from "../schema/feedback-form-templates-schema";
import { eq } from "drizzle-orm";

export const getTemplatesByClientId = async (clientId: string) => {
  return db.select().from(feedbackFormTemplatesTable).where(eq(feedbackFormTemplatesTable.clientId, clientId));
};

export const getTemplateById = async (id: string) => {
  const [template] = await db.select().from(feedbackFormTemplatesTable).where(eq(feedbackFormTemplatesTable.id, id));
  return template;
};