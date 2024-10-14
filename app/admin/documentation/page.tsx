import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DocumentationPage = () => {
  const fileDocumentation = [
    {
      name: "lib/microsoftGraph.ts",
      purpose: "Handles integration with Microsoft Graph API for Teams notifications.",
      keyFunctions: [
        "initializeGraphClient(): Initializes the Microsoft Graph client",
        "sendTeamsNotification(): Sends notifications to users via Microsoft Teams"
      ]
    },
    {
      name: "lib/scheduledTasks.ts",
      purpose: "Manages scheduled tasks for the application.",
      keyFunctions: [
        "checkOverdueFeedback(): Checks for overdue feedback assignments",
        "sendReminderNotifications(): Sends reminder notifications for pending feedback"
      ]
    },
    {
      name: ".env.local",
      purpose: "Stores environment variables for local development.",
      keyVariables: [
        "DATABASE_URL: PostgreSQL connection string",
        "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: Clerk public key",
        "CLERK_SECRET_KEY: Clerk secret key",
        "MICROSOFT_GRAPH_CLIENT_ID: Microsoft Graph API client ID",
        "MICROSOFT_GRAPH_CLIENT_SECRET: Microsoft Graph API client secret",
        "MICROSOFT_GRAPH_TENANT_ID: Microsoft Graph API tenant ID"
      ]
    },
    {
      name: "components/admin/UserAssignment.tsx",
      purpose: "React component for managing user assignments to feedback templates.",
      keyFeatures: [
        "Displays a list of users and available templates",
        "Allows admins to assign templates to users",
        "Handles the creation and deletion of assignments"
      ]
    },
    {
      name: "actions/user-template-assignments-actions.ts",
      purpose: "Server actions for managing user template assignments.",
      keyFunctions: [
        "createAssignmentAction(): Creates a new user template assignment",
        "deleteAssignmentAction(): Deletes a user template assignment",
        "getAssignmentsByUserIdAction(): Retrieves assignments for a specific user",
        "getAssignmentsByTemplateIdAction(): Retrieves assignments for a specific template"
      ]
    },
    {
      name: "db/queries/user-feedback-forms-queries.ts",
      purpose: "Database queries related to user feedback forms.",
      keyFunctions: [
        "createUserFeedbackForm(): Creates a new user feedback form",
        "getUserFeedbackFormById(): Retrieves a user feedback form by ID",
        "getUserFeedbackFormByUserAndFormId(): Retrieves a user feedback form by user and form ID",
        "updateUserFeedbackForm(): Updates an existing user feedback form",
        "deleteUserFeedbackForm(): Deletes a user feedback form"
      ]
    },
    {
      name: "app/admin/user-assignments/page.tsx",
      purpose: "Admin page for managing user assignments.",
      keyFeatures: [
        "Displays the UserAssignment component",
        "Handles loading and error states",
        "Provides context for user assignments management"
      ]
    },
    {
      name: "app/admin/page.tsx",
      purpose: "Main admin dashboard page.",
      keyFeatures: [
        "Displays an overview of system statistics",
        "Provides links to various admin functions (e.g., user assignments, template management)",
        "May include summary charts or graphs of feedback data"
      ]
    },
    {
      name: "components/header.tsx",
      purpose: "Header component for the application.",
      keyFeatures: [
        "Displays the application logo and name",
        "Includes navigation links",
        "May contain user profile information or login/logout buttons",
        "Integrates the NotificationBell component"
      ]
    },
    {
      name: "components/NotificationBell.tsx",
      purpose: "Notification bell component for displaying user notifications.",
      keyFeatures: [
        "Displays the number of unread notifications",
        "Shows a dropdown with recent notifications when clicked",
        "Handles marking notifications as read",
        "May integrate with the Microsoft Teams notifications system"
      ]
    }
  ];

  const systemArchitecture = `
    The Feedback Management System is built using a modern web stack:
    
    - Frontend: Next.js 14 (React framework), Tailwind CSS, Shadcn UI, Framer Motion
    - Backend: Next.js API Routes, Drizzle ORM, PostgreSQL
    - Authentication: Clerk
    - Payments: Stripe
    - Other: TypeScript, OpenAI API (for executive summaries)

    The application follows a server-side rendering approach with Next.js, utilizing the App Router for efficient page routing and data fetching.
  `;

  const dataFlow = `
    1. User Authentication:
       - Users log in through Clerk authentication.
       - User roles and permissions are stored in the profiles table.

    2. Feedback Form Creation:
       - Admins create feedback form templates.
       - Templates are stored in the feedback_form_templates table.
       - Questions are associated with templates in the template_questions table.

    3. User Assignment:
       - Admins assign templates to users.
       - Assignments are stored in the user_template_assignments table.

    4. Feedback Submission:
       - Users receive notifications for pending feedback.
       - Users fill out feedback forms.
       - Responses are stored in the form_answers table.

    5. Overdue Management:
       - System tracks overdue assignments in the overdue_feedback_assignments table.
       - Notifications are sent for overdue feedback.

    6. Reporting:
       - Admins can view feedback responses and generate executive summaries.
       - OpenAI API is used to generate summaries from feedback data.
  `;

  const apiEndpoints = [
    {
      path: "/api/feedback-forms",
      methods: ["GET", "POST", "PUT", "DELETE"],
      description: "CRUD operations for feedback forms"
    },
    {
      path: "/api/user-assignments",
      methods: ["GET", "POST", "DELETE"],
      description: "Manage user template assignments"
    },
    {
      path: "/api/overdue-assignments",
      methods: ["GET", "POST"],
      description: "Handle overdue feedback assignments"
    },
    {
      path: "/api/executive-summary",
      methods: ["POST"],
      description: "Generate executive summaries of feedback responses"
    }
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">System Documentation</h1>
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Files Overview</TabsTrigger>
          <TabsTrigger value="architecture">System Architecture</TabsTrigger>
          <TabsTrigger value="dataflow">Data Flow</TabsTrigger>
          <TabsTrigger value="api">API Endpoints</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Relevant Files Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {fileDocumentation.map((file, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger>{file.name}</AccordionTrigger>
                    <AccordionContent>
                      <p className="font-semibold mb-2">Purpose:</p>
                      <p className="mb-4">{file.purpose}</p>
                      {file.keyFunctions && (
                        <>
                          <p className="font-semibold mb-2">Key Functions:</p>
                          <ul className="list-disc pl-5 mb-4">
                            {file.keyFunctions.map((func, i) => (
                              <li key={i}>{func}</li>
                            ))}
                          </ul>
                        </>
                      )}
                      {file.keyFeatures && (
                        <>
                          <p className="font-semibold mb-2">Key Features:</p>
                          <ul className="list-disc pl-5 mb-4">
                            {file.keyFeatures.map((feature, i) => (
                              <li key={i}>{feature}</li>
                            ))}
                          </ul>
                        </>
                      )}
                      {file.keyVariables && (
                        <>
                          <p className="font-semibold mb-2">Key Variables:</p>
                          <ul className="list-disc pl-5 mb-4">
                            {file.keyVariables.map((variable, i) => (
                              <li key={i}>{variable}</li>
                            ))}
                          </ul>
                        </>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="architecture">
          <Card>
            <CardHeader>
              <CardTitle>System Architecture</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap">{systemArchitecture}</pre>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="dataflow">
          <Card>
            <CardHeader>
              <CardTitle>Data Flow</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap">{dataFlow}</pre>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle>API Endpoints</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {apiEndpoints.map((endpoint, index) => (
                  <li key={index} className="border-b pb-4">
                    <p className="font-semibold">{endpoint.path}</p>
                    <p className="text-sm text-gray-600">Methods: {endpoint.methods.join(", ")}</p>
                    <p>{endpoint.description}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DocumentationPage;
