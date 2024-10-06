import { sendEmail } from '@/lib/sendEmail';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { to, subject, message } = await req.json();

  if (!to || !subject || !message) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    await sendEmail({
      to,
      subject,
      textBody: message,
      htmlBody: `<p>${message}</p>`,
    });
    return NextResponse.json({ message: 'Email sent successfully' }, { status: 200 });
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json({ error: 'Error sending email' }, { status: 500 });
  }
}
