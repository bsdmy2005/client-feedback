"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { PlusCircleIcon } from "lucide-react"
import { getTemplatesByClientId } from "@/db/queries/feedback-form-templates-queries"
import { getAllQuestions } from "@/actions/questions-actions"
import { getAllClientsAction } from "@/actions/clients-actions"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createFeedbackFormTemplate } from "@/actions/feedback-form-templates-actions"
import { Template } from '@/db/schema/feedback-form-templates-schema'

export function TemplateManager() {
  const [templateName, setTemplateName] = useState("")
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [questions, setQuestions] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [selectedClient, setSelectedClient] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      const questionsResult = await getAllQuestions()
      const clientsResult = await getAllClientsAction()

      if (questionsResult.isSuccess && questionsResult.data) {
        setQuestions(questionsResult.data.filter(q => q.global === "true"))
      }

      if (clientsResult.isSuccess && clientsResult.data) {
        setClients(clientsResult.data)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    const fetchTemplates = async () => {
      if (selectedClient) {
        const clientTemplates = await getTemplatesByClientId(selectedClient)
        setTemplates(clientTemplates)
      }
    }

    fetchTemplates()
  }, [selectedClient])

  const handleQuestionToggle = (questionId: string) => {
    setSelectedQuestions((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedClient) {
      alert("Please select a client")
      return
    }
    
    const result = await createFeedbackFormTemplate(
      selectedClient,
      templateName,
      7, // Default recurrence interval
      new Date() // Default start date
    )

    if (result.isSuccess) {
      alert("Template created successfully")
      setTemplateName("")
      setSelectedQuestions([])
      // Refresh templates
      const clientTemplates = await getTemplatesByClientId(selectedClient)
      setTemplates(clientTemplates)
    } else {
      alert("Failed to create template")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="clientSelect">Select Client</Label>
        <Select onValueChange={setSelectedClient} value={selectedClient}>
          <SelectTrigger>
            <SelectValue placeholder="Select a client" />
          </SelectTrigger>
          <SelectContent>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
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
                  {question.questionText}
                </Label>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <Button type="submit" className="w-full sm:w-auto">
        <PlusCircleIcon className="mr-2 h-4 w-4" /> Create Template
      </Button>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Existing Templates</h2>
        {templates.map((template: any) => (
          <Card key={template.id} className="mb-4">
            <CardContent className="p-4">
              <h3 className="font-semibold">{template.name}</h3>
              <p>Created at: {new Date(template.createdAt).toLocaleString()}</p>
              <p>Recurrence Interval: {template.recurrenceInterval} days</p>
              <p>Start Date: {new Date(template.startDate).toLocaleDateString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </form>
  )
}