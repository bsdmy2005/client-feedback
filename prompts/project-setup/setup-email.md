# Email Setup Instructions

Use this guide to set up email functionality for this project using Postmark.

It uses Postmark for sending emails and Next.js API routes for handling email requests.

Write the complete code for every step. Do not get lazy. Write everything that is needed.

Your goal is to completely finish the email setup.

## Helpful Links

If the user gets stuck, refer them to the following links:

- [Postmark Documentation](https://postmarkapp.com/developer)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

## Setup Steps

1. Install the Postmark library:

```bash
npm install postmark
```

2. Create a new file `lib/sendEmailWithTemplate.ts` with the following content:

```typescript
import { ServerClient } from 'postmark';

const client = new ServerClient(process.env.POSTMARK_SERVER_API_TOKEN as string);

interface SendEmailWithTemplateParams {
  to: string;
  templateId: string;
  templateModel: Record<string, string>;
}

export async function sendEmailWithTemplate({
  to,
  templateId,
  templateModel,
}: SendEmailWithTemplateParams) {
  try {
    const response = await client.sendEmailWithTemplate({
      From: 'sender@example.com',
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
```

3. Create a new API route file `app/api/postmark/SendRegularEmail/route.ts`:

```typescript
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
```

4. Update the `middleware.ts` file to allow access to the email API route:

```typescript
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/notes(.*)"]);
const isPublicRoute = createRouteMatcher([
  "/api/webhooks/clerk(.*)",
  "/api/postmark/sendEmail"  // Add this line
]);

// ... rest of the middleware code ...
```

5. Add the necessary environment variables to your `.env.local` file:

```
POSTMARK_SERVER_API_TOKEN=your_postmark_server_api_token
POSTMARK_TEMPLATE_ID=your_postmark_template_id
```

6. Create a Postmark template in your Postmark account and note down the template ID.

7. Test the email functionality by making a GET request to `/api/postmark/SendRegularEmail`.

## Important Notes

- Make sure to replace 'sender@example.com' in the `sendEmailWithTemplate` function with your actual sender email address.
- Ensure that your Postmark account is set up correctly and your server API token is valid.
- The `getAllProfilesAction` function should be implemented to fetch user profiles from your database.
- Always handle errors and edge cases in production environments.

The email setup is now complete. You can now send emails to all users using the Postmark template.
