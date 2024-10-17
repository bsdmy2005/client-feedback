import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { AdhocFeedbackChat } from "@/components/feedback/AdhocFeedbackChat"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function AdhocFeedbackPage() {
  const { userId } = auth()
  
  if (!userId) {
    redirect("/sign-in")
  }

  return (
    <div className="container mx-auto px-4 py-8 h-screen flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Adhoc Feedback</h1>
        <Link href="/feedback/adhoc/history">
          <Button variant="outline">View Feedback History</Button>
        </Link>
      </div>
      <div className="flex-grow">
        <AdhocFeedbackChat />
      </div>
    </div>
  )
}
