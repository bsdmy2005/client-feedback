import { FeedbackFormDetails } from "@/components/admin/FeedbackFormDetails"
import { getFeedbackFormDetails } from "@/actions/feedback-forms-actions"
import { getUserFeedbackForms } from "@/actions/user-feedback-forms-actions"
import { getFormAnswers } from "@/actions/form-answers-actions"
import { getUserProfileById } from "@/actions/profiles-actions"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default async function FeedbackFormDetailsPage({ params }: { params: { id: string } }) {
  const formResult = await getFeedbackFormDetails(params.id)
  const userFormsResult = await getUserFeedbackForms(params.id)
  const answersResult = await getFormAnswers(params.id)

  if (!formResult.isSuccess || !formResult.data) {
    return <div>Error: {formResult.message || "Failed to load feedback form details"}</div>
  }

  const form = formResult.data
  const userForms = userFormsResult.isSuccess && userFormsResult.data ? userFormsResult.data : []
  const formAnswers = answersResult.isSuccess && answersResult.data ? answersResult.data : []

  // Fetch user profiles for each user form
  const userProfiles = await Promise.all(
    userForms.map(async (userForm) => {
      const profileResult = await getUserProfileById(userForm.userId)
      return profileResult.isSuccess && profileResult.data
        ? { ...userForm, userName: `${profileResult.data.firstName} ${profileResult.data.lastName}` }
        : { ...userForm, userName: "Unknown User" }
    })
  )

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{form.templateName} - {form.clientName}</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>Due Date:</strong> {new Date(form.dueDate).toLocaleDateString()}</p>
          <p><strong>Status:</strong> {form.status}</p>
          {/* Removed the display of form ID */}
        </CardContent>
      </Card>
      
      <FeedbackFormDetails
        feedbackForm={form}
        userForms={userProfiles}
        formAnswers={formAnswers}
      />
    </div>
  )
}