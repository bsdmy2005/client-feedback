import { getFeedbackFormDetails } from "@/actions/feedback-forms-actions"
import { getUserFeedbackFormByUserAndFormId } from "@/actions/user-feedback-forms-actions"
import { getFormUserAnswers } from "@/actions/form-answers-actions"
import { getUserProfileById } from "@/actions/profiles-actions"
import { getTemplateQuestionsWithDetails } from "@/db/queries/template-questions-queries"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default async function UserResponsesPage({ params }: { params: { id: string; userId: string } }) {
  const formResult = await getFeedbackFormDetails(params.id)
  const userFormResult = await getUserFeedbackFormByUserAndFormId(params.userId, params.id)
  const userProfileResult = await getUserProfileById(params.userId)

  if (!formResult.isSuccess || !formResult.data) {
    return <div>Error: Failed to load feedback form details</div>
  }

  if (!userProfileResult.isSuccess || !userProfileResult.data) {
    return <div>Error: Failed to load user profile</div>
  }

  if (!userFormResult.isSuccess || !userFormResult.data) {
    return <div>Error: Failed to load user feedback form</div>
  }

  const form = formResult.data
  const userProfile = userProfileResult.data
  const userForm = userFormResult.data

  // Get answers for this specific user and form
  const answersResult = await getFormUserAnswers(userForm.id)
  const userAnswers = answersResult.isSuccess && answersResult.data ? answersResult.data : []

  // Fetch questions for this template
  const questionsResult = await getTemplateQuestionsWithDetails(form.templateId)
  const questions = Array.isArray(questionsResult) ? questionsResult : []

  // Create a map of question IDs to question text
  const questionMap = new Map(questions.map(q => [q.questionDetails.id, q.questionDetails.questionText]))

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{form.templateName} - {form.clientName}</CardTitle>
          <p>Responses from: {userProfile.firstName} {userProfile.lastName}</p>
        </CardHeader>
        <CardContent>
          {userAnswers.length > 0 ? (
            userAnswers.map((answer, index) => (
              <Card key={answer.id} className="mb-4">
                <CardHeader>
                  <CardTitle>Response {index + 1} - Submitted on {new Date(answer.submittedAt).toLocaleString()}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Question</TableHead>
                        <TableHead>Answer</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(answer.answers as Record<string, string>).map(([questionId, answerText]) => (
                        <TableRow key={questionId}>
                          <TableCell>{questionMap.get(questionId) || 'Unknown Question'}</TableCell>
                          <TableCell>{answerText}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))
          ) : (
            <p>No responses submitted yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}