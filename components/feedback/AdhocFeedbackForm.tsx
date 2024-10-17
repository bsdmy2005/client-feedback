"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { submitAdhocFeedback } from "@/actions/adhoc-feedback-actions"
import { Message } from "@/db/schema/adhoc-feedback-schema"

interface AdhocFeedbackFormProps {
  onSubmit: (message: Message) => void
}

export function AdhocFeedbackForm({ onSubmit }: AdhocFeedbackFormProps) {
  const [feedback, setFeedback] = useState("")
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!feedback.trim()) {
      toast({
        title: "Error",
        description: "Please enter feedback",
        variant: "destructive",
      })
      return
    }

    const result = await submitAdhocFeedback(null, [{ role: 'user', content: feedback }])
    if (result.isSuccess && result.data) {
      onSubmit(result.data[0])
      setFeedback("")
    } else {
      toast({
        title: "Error",
        description: result.message || "Failed to submit feedback",
        variant: "destructive",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        placeholder="Enter your feedback here"
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        rows={5}
      />
      <Button type="submit">Submit Feedback</Button>
    </form>
  )
}
