import { auth } from "@clerk/nextjs/server";

import { redirect } from "next/navigation";
import { getUserFeedbackFormsWithDetailsAction } from "@/actions/user-feedback-forms-actions";
import FeedbackFormList from "@/components/feedback/FeedbackFormList";

export default async function FeedbackPage() {
  const { userId } = auth();
  
  if (!userId) {
    // Handle the case where there's no authenticated user
    return <div>Please log in to view your feedback forms.</div>;
  }

  const result = await getUserFeedbackFormsWithDetailsAction(userId);

  if (!result.isSuccess || !result.data) {
    // Handle the error case
    return <div>Failed to load feedback forms: {result.message}</div>;
  }

  const forms = result.data;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Feedback Forms</h1>
      <FeedbackFormList forms={forms} />
    </div>
  );
}
