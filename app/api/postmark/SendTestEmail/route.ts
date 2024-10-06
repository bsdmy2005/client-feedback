import { sendEmail } from '@/lib/sendEmail';
import { NextRequest, NextResponse } from 'next/server';
import { getAllProfilesAction } from '@/actions/profiles-actions';

export async function GET(req: NextRequest) {
  const to = process.env.DEFAULT_EMAIL_RECIPIENT;
  const subject = "Scheduled User Profile List";

  if (!to) {
    return NextResponse.json({ error: 'Default email recipient not set' }, { status: 500 });
  }

  try {
    // Fetch profiles using the action
    const profilesResult = await getAllProfilesAction();

    if (!profilesResult.isSuccess || !profilesResult.data) {
      throw new Error(profilesResult.message || 'Failed to fetch profiles');
    }

    const profiles = profilesResult.data;

    // Create HTML content with profile list
    const htmlBody = `
      <h1>User Profile List</h1>
      <ul>
        ${profiles.map(profile => `
          <li>
            ${profile.firstName} ${profile.lastName} (${profile.email})
            <br>Membership: ${profile.membership}, Role: ${profile.role}
          </li>
        `).join('')}
      </ul>
    `;

    // Create plain text content
    const textBody = `User Profile List:\n\n${profiles.map(profile => 
      `- ${profile.firstName} ${profile.lastName} (${profile.email})
       Membership: ${profile.membership}, Role: ${profile.role}`
    ).join('\n\n')}`;

    await sendEmail({
      to,
      subject,
      textBody,
      htmlBody,
    });
    return NextResponse.json({ message: 'Scheduled email with user profiles sent successfully' }, { status: 200 });
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json({ error: 'Error sending scheduled email' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { to, subject } = await req.json();

  if (!to || !subject) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    // Fetch profiles using the action
    const profilesResult = await getAllProfilesAction();

    if (!profilesResult.isSuccess || !profilesResult.data) {
      throw new Error(profilesResult.message || 'Failed to fetch profiles');
    }

    const profiles = profilesResult.data;

    // Create HTML content with profile list
    const htmlBody = `
      <h1>User Profile List</h1>
      <ul>
        ${profiles.map(profile => `
          <li>
            ${profile.firstName} ${profile.lastName} (${profile.email})
            <br>Membership: ${profile.membership}, Role: ${profile.role}
          </li>
        `).join('')}
      </ul>
    `;

    // Create plain text content
    const textBody = `User Profile List:\n\n${profiles.map(profile => 
      `- ${profile.firstName} ${profile.lastName} (${profile.email})
       Membership: ${profile.membership}, Role: ${profile.role}`
    ).join('\n\n')}`;

    await sendEmail({
      to,
      subject,
      textBody,
      htmlBody,
    });
    return NextResponse.json({ message: 'Test email with user profiles sent successfully' }, { status: 200 });
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json({ error: 'Error sending test email' }, { status: 500 });
  }
}
