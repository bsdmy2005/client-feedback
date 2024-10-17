import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getAdhocFeedbackByUserId } from "@/actions/adhoc-feedback-actions"
import { format } from "date-fns"
import { AdhocFeedbackWithClientName } from "@/db/schema/adhoc-feedback-schema"

export default async function AdhocFeedbackHistoryPage() {
  const { userId } = auth()
  
  if (!userId) {
    redirect("/sign-in")
  }

  const feedbackResult = await getAdhocFeedbackByUserId(userId)
  const feedback: AdhocFeedbackWithClientName[] = feedbackResult.isSuccess && feedbackResult.data ? feedbackResult.data : []

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Adhoc Feedback History</h1>
      {feedback.length > 0 ? (
        <ul className="space-y-4">
          {feedback.map((item) => (
            <li key={item.id} className="border p-4 rounded-md">
              <p className="font-semibold">{item.clientName}</p>
              <p className="text-sm text-gray-500">{format(new Date(item.updatedAt), 'PPP')}</p>
              {item.conversation.map((message, index) => (
                <div key={index} className={`p-2 mt-2 rounded-lg ${message.role === 'user' ? 'bg-blue-100' : 'bg-green-100'}`}>
                  <p><strong>{message.role === 'user' ? 'You' : 'Assistant'}:</strong> {message.content}</p>
                </div>
              ))}
            </li>
          ))}
        </ul>
      ) : (
        <p>You haven't submitted any adhoc feedback yet.</p>
      )}
    </div>
  )
}
