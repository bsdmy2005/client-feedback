// lib/sendEmailWithTemplate.js
import postmarkClient from './postmarkClient';

export async function sendEmailWithTemplate({ 
  to, 
  templateId, 
  templateModel 
}: {
  to: string;
  templateId: string;
  templateModel: Record<string, unknown>;
}) {
  try {
    const response = await postmarkClient.sendEmailWithTemplate({
      From: 'no-reply@yourdomain.com',
      To: to,
      TemplateId: parseInt(templateId),
      TemplateModel: templateModel,
    });
    return response;
  } catch (error) {
    throw error;
  }
}
