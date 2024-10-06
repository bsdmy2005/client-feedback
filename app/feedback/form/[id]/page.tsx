import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getTemplateQuestionsWithDetails } from "@/db/queries/template-questions-queries";
import { getUserFeedbackFormByIdAction } from "@/actions/user-feedback-forms-actions";
import FeedbackFormCompletion from "@/components/feedback/FeedbackFormCompletion";
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { getFormUserAnswers } from "@/actions/form-answers-actions";

export default async function FeedbackFormPage({ params }: { params: { id: string } }) {
  const { userId } = auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  const formResult = await getUserFeedbackFormByIdAction(params.id);
  if (!formResult.isSuccess || !formResult.data) {
    return <div>Error: {formResult.message || "Form not found"}</div>;
  }

  const form = formResult.data;

  const questionsResult = await getTemplateQuestionsWithDetails(form.templateId);
  if (!Array.isArray(questionsResult) || questionsResult.length === 0) {
    return <div>Error: Questions not found</div>;
  }

  const questions = questionsResult;

  // Fetch initial answers
  const answersResult = await getFormUserAnswers(form.id);
  const initialAnswers = answersResult.isSuccess && answersResult.data && answersResult.data.length > 0
    ?   answersResult.data[0].answers
    : {};

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "active":
        return <Badge variant="default">Active</Badge>;
      case "closed":
        return <Badge variant="secondary">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="text-sm text-gray-500 mb-2">Form ID: {form.id}</div>
        <h1 className="text-3xl font-bold mb-2">{form.templateName}</h1>
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <span>Due: {form.dueDate ? format(new Date(form.dueDate), 'PPP') : 'No due date'}</span>
          <span>Status: {getStatusBadge(form.status || 'pending')}</span>
        </div>
      </div>
      <FeedbackFormCompletion 
        form={{
          ...form,
          id: form.id,
          userId: form.userId,
          feedbackFormId: form.feedbackFormId,
          status: form.status || "pending",
          dueDate: form.dueDate,
          clientName: form.clientName,
          templateName: form.templateName,
          templateId: form.templateId,
          lastUpdated: form.lastUpdated || new Date(),
          createdAt: form.createdAt || new Date(),
        }}
        questions={questions.map(q => ({
          questionId: q.questionDetails.id,
          questionText: q.questionDetails.questionText,
          questionType: q.questionDetails.questionType,
          questionTheme: q.questionDetails.questionTheme,
          options: q.questionDetails.options,
          templateId: form.templateId,
        }))} 
        userId={userId}
      />
    </div>
  );
}