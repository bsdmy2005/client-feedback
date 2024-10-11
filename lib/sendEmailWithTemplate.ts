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
    // Use an environment variable for the 'From' address
    const fromAddress = process.env.POSTMARK_FROM_EMAIL || 'no-reply@yourdomain.com';

    // Ensure the 'to' address has the same domain as the 'from' address
    const fromDomain = fromAddress.split('@')[1];
    const toDomain = to.split('@')[1];

    if (fromDomain !== toDomain) {
      console.warn(`Skipping email to ${to} due to domain mismatch with sender (${fromAddress})`);
      return null;
    }

    const response = await postmarkClient.sendEmailWithTemplate({
      From: fromAddress,
      To: to,
      TemplateId: parseInt(templateId),
      TemplateModel: templateModel,
    });
    return response;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}
