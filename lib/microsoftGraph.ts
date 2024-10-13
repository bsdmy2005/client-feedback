import { Client } from "@microsoft/microsoft-graph-client";
import { TokenCredentialAuthenticationProvider } from "@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials";
import { ClientSecretCredential } from "@azure/identity";

const credential = new ClientSecretCredential(
  process.env.MS_TENANT_ID!,
  process.env.MS_CLIENT_ID!,
  process.env.MS_CLIENT_SECRET!
);

const authProvider = new TokenCredentialAuthenticationProvider(credential, {
  scopes: ['https://graph.microsoft.com/.default', 'TeamsActivity.Send', 'TeamsActivity.Send.User']
});

const graphClient = Client.initWithMiddleware({ authProvider });

export async function sendTeamsMessage(email: string, message: string) {
  console.log(`Attempting to send Teams message to user: ${email}`);
  try {
    console.log(`Preparing notification payload for user: ${email}`);
    const notificationPayload = {
      topic: {
        source: "text",
        value: "Overdue Feedback Form"
      },
      activityType: "taskCreated",
      previewText: {
        content: "You have an overdue feedback form"
      },
      templateParameters: [
        {
          name: "taskName",
          value: message
        }
      ]
    };
    console.log(`Notification payload prepared: ${JSON.stringify(notificationPayload)}`);

    console.log(`Sending API request to Microsoft Graph for user: ${email}`);
    const response = await graphClient.api(`/users/${email}/teamwork/sendActivityNotification`)
      .post(notificationPayload);
    
    console.log(`API response received for user ${email}:`, response);
    console.log(`Teams message successfully sent to user ${email}`);
    return true;
  } catch (error) {
    console.error(`Failed to send Teams message to user ${email}:`, error);
    if (error instanceof Error) {
      console.error(`Error name: ${error.name}`);
      console.error(`Error message: ${error.message}`);
      console.error(`Error stack: ${error.stack}`);
    }
    if (typeof error === 'object' && error !== null) {
      console.error('Error details:', JSON.stringify(error, null, 2));
    }
    return false;
  }
}
