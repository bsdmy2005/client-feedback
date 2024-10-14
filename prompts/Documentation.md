# Technical Documentation

## Table of Contents
1. [Tech Stack](#tech-stack)
2. [Database Schema](#database-schema)
3. [API Endpoints](#api-endpoints)
4. [Key Components](#key-components)
5. [Development Guidelines](#development-guidelines)

## Tech Stack

- **Frontend:**
  - Next.js 14 (React framework)
  - Tailwind CSS
  - Shadcn UI
  - Framer Motion

- **Backend:**
  - Next.js API Routes
  - Drizzle ORM
  - PostgreSQL (hosted on Supabase)

- **Authentication:**
  - Clerk

- **Payments:**
  - Stripe

- **Other:**
  - TypeScript
  - OpenAI API (for executive summaries)

## Database Schema

### Tables

1. **profiles**
   - `user_id` (text, primary key)
   - `first_name` (text)
   - `last_name` (text)
   - `email` (text)
   - `membership` (enum: 'free', 'pro')
   - `role` (enum: 'user', 'admin')
   - `stripe_customer_id` (text)
   - `stripe_subscription_id` (text)
   - `created_at` (timestamp)
   - `updated_at` (timestamp)

2. **clients**
   - `client_id` (uuid, primary key)
   - `name` (text)
   - `description` (text)
   - `created_at` (timestamp)

3. **questions**
   - `id` (uuid, primary key)
   - `text` (text)
   - `type` (text)
   - `options` (jsonb)
   - `created_at` (timestamp)

4. **feedback_form_templates**
   - `id` (uuid, primary key)
   - `client_id` (uuid, foreign key to clients)
   - `name` (text)
   - `recurrence_interval` (text)
   - `start_date` (date)
   - `created_at` (timestamp)

5. **template_questions**
   - `template_id` (uuid, foreign key to feedback_form_templates)
   - `question_id` (uuid, foreign key to questions)

6. **user_template_assignments**
   - `id` (uuid, primary key)
   - `user_id` (text, foreign key to profiles)
   - `user_email` (text)
   - `template_id` (uuid, foreign key to feedback_form_templates)
   - `created_at` (timestamp)
   - `updated_at` (timestamp)

7. **feedback_forms**
   - `id` (uuid, primary key)
   - `template_id` (uuid, foreign key to feedback_form_templates)
   - `user_id` (text, foreign key to profiles)
   - `due_date` (timestamp)
   - `status` (text)
   - `responses` (jsonb)
   - `created_at` (timestamp)
   - `updated_at` (timestamp)

8. **overdue_feedback_assignments**
   - `id` (uuid, primary key)
   - `user_id` (text, foreign key to profiles)
   - `template_id` (uuid, foreign key to feedback_form_templates)
   - `due_date` (timestamp)
   - `created_at` (timestamp)
   - `updated_at` (timestamp)

### Relationships

- `clients` one-to-many `feedback_form_templates`
- `feedback_form_templates` many-to-many `questions` through `template_questions`
- `profiles` one-to-many `user_template_assignments`
- `feedback_form_templates` one-to-many `user_template_assignments`
- `profiles` one-to-many `feedback_forms`
- `feedback_form_templates` one-to-many `feedback_forms`
- `profiles` one-to-many `overdue_feedback_assignments`
- `feedback_form_templates` one-to-many `overdue_feedback_assignments`

## API Endpoints

1. `/api/clerk/webhooks`
   - Method: POST
   - Description: Handles Clerk authentication webhooks, specifically for user creation events

2. `/api/cron/daily`
   - Method: GET
   - Description: Runs daily scheduled tasks

3. `/api/paystack/webhook`
   - Method: POST
   - Description: Handles Paystack payment webhooks and initializes transactions

4. `/api/postmark/SendEmail`
   - Method: POST
   - Description: Sends a single email using Postmark

5. `/api/postmark/SendRegularEmail`
   - Method: GET
   - Description: Sends regular emails to all users using a Postmark template

6. `/api/postmark/SendTestEmail`
   - Methods: GET, POST
   - Description: Sends a test email with user profile information

7. `/api/feedback-forms`
   - Methods: GET, POST, PUT, DELETE
   - Description: CRUD operations for feedback forms

8. `/api/user-assignments`
   - Methods: GET, POST, DELETE
   - Description: Manage user template assignments

9. `/api/overdue-assignments`
   - Methods: GET, POST
   - Description: Handle overdue feedback assignments

10. `/api/executive-summary`
    - Method: POST
    - Description: Generate executive summaries of feedback responses

Each of these endpoints serves a specific purpose in the application:

- The Clerk webhook handles user creation events from the authentication service.
- The cron endpoint allows for scheduled daily tasks to be run.
- The Paystack webhook manages payment-related events and transaction initialization.
- The Postmark endpoints handle various email sending scenarios, including regular emails, test emails, and template-based emails.
- The feedback form, user assignment, and overdue assignment endpoints manage the core functionality of the feedback system.
- The executive summary endpoint provides a way to generate summaries of feedback responses.

These API routes form the backbone of the application's server-side functionality, handling everything from user management and payments to email communications and core business logic.

## Key Components

1. `lib/microsoftGraph.ts`
   - Purpose: Handles integration with Microsoft Graph API for Teams notifications
   - Key functions:
     - `initializeGraphClient()`: Initializes the Microsoft Graph client
     - `sendTeamsNotification()`: Sends notifications to users via Microsoft Teams

2. `lib/scheduledTasks.ts`
   - Purpose: Manages scheduled tasks for the application
   - Key functions:
     - `checkOverdueFeedback()`: Checks for overdue feedback assignments
     - `sendReminderNotifications()`: Sends reminder notifications for pending feedback

3. `components/admin/UserAssignment.tsx`
   - Purpose: React component for managing user assignments to feedback templates
   - Key features:
     - Displays a list of users and available templates
     - Allows admins to assign templates to users
     - Handles the creation and deletion of assignments

4. `actions/user-template-assignments-actions.ts`
   - Purpose: Server actions for managing user template assignments
   - Key functions:
     - `createAssignmentAction()`: Creates a new user template assignment
     - `deleteAssignmentAction()`: Deletes a user template assignment
     - `getAssignmentsByUserIdAction()`: Retrieves assignments for a specific user
     - `getAssignmentsByTemplateIdAction()`: Retrieves assignments for a specific template

5. `db/queries/user-feedback-forms-queries.ts`
   - Purpose: Database queries related to user feedback forms
   - Key functions:
     - `createUserFeedbackForm()`: Creates a new user feedback form
     - `getUserFeedbackFormById()`: Retrieves a user feedback form by ID
     - `getUserFeedbackFormByUserAndFormId()`: Retrieves a user feedback form by user and form ID
     - `updateUserFeedbackForm()`: Updates an existing user feedback form
     - `deleteUserFeedbackForm()`: Deletes a user feedback form

## Development Guidelines

1. **File Structure:**
   - Components should be placed in `/components` and named like `example-component.tsx`
   - Actions should be placed in `/actions` and named like `example-actions.ts`
   - Database schemas should be placed in `/db/schema` and named like `example-schema.ts`
   - Database queries should be placed in `/db/queries` and named like `example-queries.ts`

2. **Data Fetching:**
   - Data fetching should be done in server components and passed down to client components as props

3. **Revalidation:**
   - Use `revalidatePath("/")` for revalidation paths

4. **User ID in Schemas:**
   - Use `text("user_id").isNotNullable()` for user ID fields in schemas, no need to reference another table

5. **Environment Variables:**
   - Ensure all necessary environment variables are set in `.env.local`
   - Key variables include:
     - `DATABASE_URL`: PostgreSQL connection string
     - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk public key
     - `CLERK_SECRET_KEY`: Clerk secret key
     - `MICROSOFT_GRAPH_CLIENT_ID`: Microsoft Graph API client ID
     - `MICROSOFT_GRAPH_CLIENT_SECRET`: Microsoft Graph API client secret
     - `MICROSOFT_GRAPH_TENANT_ID`: Microsoft Graph API tenant ID

6. **Database Migrations:**
   - Use `npm run db:generate` to generate new schema migrations
   - Use `npm run db:migrate` to apply migrations to the database

7. **Code Style:**
   - Follow Prettier preferences for code formatting
   - Keep code snippets brief, showing only relevant lines
   - Use multiple code blocks when necessary

8. **Documentation:**
   - Keep this documentation up-to-date as the project evolves
   - Document new components, actions, and database changes

By following these guidelines and referring to this documentation, developers can maintain consistency and efficiency throughout the project's development lifecycle.
