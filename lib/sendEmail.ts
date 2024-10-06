// lib/sendEmail.js
import postmarkClient from './postmarkClient';

export async function sendEmail({ 
  to, 
  subject, 
  textBody, 
  htmlBody 
}: {
  to: string;
  subject: string;
  textBody: string;
  htmlBody: string;
}) {
  try {
    const response = await postmarkClient.sendEmail({
      From: 'bereket@elenjicalsolutions.com', // Use your verified sender
      To: to,
      Subject: subject,
      TextBody: textBody,
      HtmlBody: htmlBody,
    });
    return response;
  } catch (error) {
    throw error;
  }
}
