import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserFeedbackFormsWithDetailsAction } from "@/actions/user-feedback-forms-actions";
import FeedbackFormList from "@/components/feedback/FeedbackFormList";

export default async function FeedbackPage() {
  const { userId } = auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  const result = await getUserFeedbackFormsWithDetailsAction(userId);

  if (!result.isSuccess || !result.data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
          <p className="font-bold">Error</p>
          <p>Failed to load feedback forms: {result.message}</p>
        </div>
      </div>
    );
  }

  const forms = result.data;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Feedback Forms</h1>
      <FeedbackFormList forms={forms} />
    </div>
  );
}
