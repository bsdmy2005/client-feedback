import { sendEmailWithTemplate } from '@/lib/sendEmailWithTemplate';
import { getAllProfilesAction } from '@/actions/profiles-actions';
import { NextResponse } from 'next/server';
import { MessageSendingResponse } from 'postmark/dist/client/models';

export async function GET() {
  try {
    const users = await getAllProfilesAction();

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
    }).filter((promise): promise is Promise<MessageSendingResponse | null> => promise !== null);

    if (emailPromises) {
      const results = await Promise.all(emailPromises);
      const sentCount = results.filter(result => result !== null).length;
      const skippedCount = results.length - sentCount;

      return NextResponse.json({ 
        message: `Emails processed. Sent: ${sentCount}, Skipped: ${skippedCount}`,
        sentCount,
        skippedCount
      }, { status: 200 });
    }

    return NextResponse.json({ message: 'No emails to send' }, { status: 200 });
  } catch (error) {
    console.error('Scheduled email error:', error);
    return NextResponse.json({ error: 'Error sending scheduled emails' }, { status: 500 });
  }
}
