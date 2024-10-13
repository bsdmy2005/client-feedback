// lib/sendEmailWithTemplate.js
import postmarkClient from './postmarkClient';

export async function sendEmailWithTemplate({ 
  to, 
  templateId, 
  templateModel
}: {
  to: string;
  templateId: number | string;
  templateModel: Record<string, unknown>;
}) {
  try {
    const fromAddress = process.env.POSTMARK_FROM_EMAIL || 'bereket@elenjicalsolutions.com';
    const fromDomain = fromAddress.split('@')[1];
    const toDomain = to.split('@')[1];

    if (fromDomain !== toDomain) {
      console.warn(`Skipping email to ${to} due to domain mismatch with sender (${fromAddress})`);
      return null;
    }

    let processedTemplateId: number | string = templateId;
    if (typeof templateId === 'string' && /^\d+$/.test(templateId)) {
      processedTemplateId = parseInt(templateId, 10);
    }

    const response = await postmarkClient.sendEmailWithTemplate({
      From: fromAddress,
      To: to,
      TemplateId: typeof processedTemplateId === 'number' ? processedTemplateId : undefined,
      TemplateAlias: typeof processedTemplateId === 'string' ? processedTemplateId : undefined,
      TemplateModel: templateModel,
    });

    return response;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}
