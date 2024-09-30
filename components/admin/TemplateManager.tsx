"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { PlusCircleIcon } from "lucide-react"

export function TemplateManager() {
  const [templateName, setTemplateName] = useState("")
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([])

  // Mock questions data (replace with actual data fetching)
  const questions = [
    { id: "1", text: "How satisfied are you with our service?" },
    { id: "2", text: "Would you recommend us to others?" },
    { id: "3", text: "What areas can we improve on?" },
  ]

  const handleQuestionToggle = (questionId: string) => {
    setSelectedQuestions((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement template creation logic
    console.log("Creating template:", { templateName, selectedQuestions })
    setTemplateName("")
    setSelectedQuestions([])
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="templateName">Template Name</Label>
        <Input
          id="templateName"
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          placeholder="Enter template name"
          required
          className="w-full"
        />
      </div>
      <div className="space-y-2">
        <Label>Select Questions</Label>
        <Card>
          <CardContent className="p-4 space-y-2">
            {questions.map((question) => (
              <div key={question.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`question-${question.id}`}
                  checked={selectedQuestions.includes(question.id)}
                  onCheckedChange={() => handleQuestionToggle(question.id)}
                />
                <Label htmlFor={`question-${question.id}`} className="text-sm">
                  {question.text}
                </Label>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <Button type="submit" className="w-full sm:w-auto">
        <PlusCircleIcon className="mr-2 h-4 w-4" /> Create Template
      </Button>
    </form>
  )
}