import { sendEmailWithTemplate } from '@/lib/sendEmailWithTemplate';
import { getAllProfilesAction } from '@/actions/profiles-actions';
import { NextResponse } from 'next/server';
import { MessageSendingResponse } from 'postmark/dist/client/models';

export async function GET() {
  try {
    const users = await getAllProfilesAction(); // Fetch users from your database

    const emailPromises = users?.data?.map((user) => {
      if (!user.email) return Promise.resolve(null);
      return sendEmailWithTemplate({
        to: user.email,
        templateId: process.env.POSTMARK_TEMPLATE_ID as string,
        templateModel: { 
          name: user.firstName || 'User',
          email: user.email || '',
        },
      });
    }).filter((promise): promise is Promise<MessageSendingResponse> => promise !== null);

    if (emailPromises) {
      await Promise.all(emailPromises);
    }

    return NextResponse.json({ message: 'Scheduled emails sent successfully' }, { status: 200 });
  } catch (error) {
    console.error('Scheduled email error:', error);
    return NextResponse.json({ error: 'Error sending scheduled emails' }, { status: 500 });
  }
}
