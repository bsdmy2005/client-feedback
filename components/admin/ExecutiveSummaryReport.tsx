"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { generateExecutiveSummary } from "@/actions/feedback-forms-actions"
import { Loader2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ExecutiveSummaryReportProps {
  feedbackFormId: string
  onClose: () => void
}

export function ExecutiveSummaryReport({ feedbackFormId, onClose }: ExecutiveSummaryReportProps) {
  const [summary, setSummary] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleGenerateSummary = async () => {
    setIsLoading(true)
    try {
      const result = await generateExecutiveSummary(feedbackFormId)
      if (result.isSuccess && result.data) {
        setSummary(result.data)
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate executive summary",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Executive Summary Report</CardTitle>
      </CardHeader>
      <CardContent>
        <Button
          onClick={handleGenerateSummary}
          disabled={isLoading}
          className="mb-4"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Summary
            </>
          ) : (
            "Generate Executive Summary"
          )}
        </Button>
        {summary && (
          <ScrollArea className="h-[400px] w-full rounded-md border p-4">
            <div className="whitespace-pre-wrap">{summary}</div>
          </ScrollArea>
        )}
        <Button onClick={onClose} className="mt-4">Close</Button>
      </CardContent>
    </Card>
  )
}