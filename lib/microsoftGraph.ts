import { Client } from "@microsoft/microsoft-graph-client";
import { TokenCredentialAuthenticationProvider } from "@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials";
import { ClientSecretCredential } from "@azure/identity";

const credential = new ClientSecretCredential(
  process.env.MS_TENANT_ID!,
  process.env.MS_CLIENT_ID!,
  process.env.MS_CLIENT_SECRET!
);

const authProvider = new TokenCredentialAuthenticationProvider(credential, {
  scopes: ['https://graph.microsoft.com/.default']
});

const client = Client.initWithMiddleware({
  authProvider: authProvider,
});

export async function sendTeamsMessage(userEmail: string, message: string): Promise<boolean> {
  try {
    const payload = {
      topic: {
        source: "text",
        value: "Feedback Form Reminder",
        webUrl: "https://elenjicalsolutions.com/feedback-forms" // Replace with your actual feedback forms URL
      },
      activityType: "taskCreated",
      previewText: {
        content: "New feedback form reminder"
      },
      templateParameters: [
        {
          name: "taskName",
          value: "Complete Feedback Form"
        }
      ],
      recipient: {
        "@odata.type": "microsoft.graph.aadUserNotificationRecipient",
        userId: userEmail
      },
      payload: {
        content: message
      }
    };

    console.log('Sending Teams notification with payload:', JSON.stringify(payload, null, 2));

    await client.api(`/users/${userEmail}/teamwork/sendActivityNotification`)
      .post(payload);

    console.log(`Teams message sent successfully to ${userEmail}`);
    return true;
  } catch (error) {
    console.error(`Failed to send Teams message to user ${userEmail}:`, error);
    return false;
  }
}

export default client;
