"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircleIcon, PencilIcon, TrashIcon } from "lucide-react"
import { getAllTemplates, createFeedbackFormTemplate, updateFeedbackFormTemplate, deleteFeedbackFormTemplate } from "@/actions/feedback-form-templates-actions"
import { getAllQuestions } from "@/actions/questions-actions"
import { getAllClientsAction } from "@/actions/clients-actions"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Template } from '@/db/schema/feedback-form-templates-schema'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { getTemplateQuestionsAction, addTemplateQuestionAction, removeTemplateQuestionAction } from "@/actions/template-questions-actions"

export function TemplateManager() {
  const [templateName, setTemplateName] = useState("")
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [questions, setQuestions] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [selectedClient, setSelectedClient] = useState("")
  const [recurrenceInterval, setRecurrenceInterval] = useState(7)
  const [startDate, setStartDate] = useState(new Date())
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [filteredQuestions, setFilteredQuestions] = useState<any[]>([])
  const [templateQuestions, setTemplateQuestions] = useState<Record<string, string[]>>({})
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      const questionsResult = await getAllQuestions()
      const clientsResult = await getAllClientsAction()
      const templatesResult = await getAllTemplates()

      if (questionsResult.isSuccess && questionsResult.data) {
        setQuestions(questionsResult.data)
      }

      if (clientsResult.isSuccess && clientsResult.data) {
        setClients(clientsResult.data)
      }

      if (templatesResult.isSuccess && templatesResult.data) {
        setTemplates(templatesResult.data)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (selectedClient) {
      setFilteredQuestions(questions.filter(q => q.global === "true" || q.clientId === selectedClient))
    } else {
      setFilteredQuestions([])
    }
  }, [selectedClient, questions])

  useEffect(() => {
    const fetchTemplateQuestions = async () => {
      for (const template of templates) {
        const result = await getTemplateQuestionsAction(template.id)
        if (result.isSuccess && result.data) {
          setTemplateQuestions(prev => ({
            ...prev,
            [template.id]: result.data?.map(tq => tq.questionId) ?? []
          }))
        }
      }
    }

    fetchTemplateQuestions()
  }, [templates])

  const handleEdit = async (template: Template) => {
    setTemplateName(template.name)
    setSelectedClient(template.clientId)
    setRecurrenceInterval(template.recurrenceInterval)
    setStartDate(new Date(template.startDate))
    setEditingTemplateId(template.id)

    // Fetch the questions for this template
    const result = await getTemplateQuestionsAction(template.id)
    if (result.isSuccess && result.data) {
      setSelectedQuestions(result.data.map(tq => tq.questionId))
    }

    setIsEditDialogOpen(true)
  }

  const handleQuestionToggle = (questionId: string) => {
    setSelectedQuestions(prev =>
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedClient) {
      toast({
        title: "Error",
        description: "Please select a client",
        variant: "destructive",
      })
      return
    }
    
    if (editingTemplateId) {
      const result = await updateFeedbackFormTemplate(editingTemplateId, {
        name: templateName,
        recurrenceInterval,
        startDate,
      })

      if (result.isSuccess) {
        // Update template questions
        const currentQuestions = templateQuestions[editingTemplateId] || []
        const questionsToAdd = selectedQuestions.filter(q => !currentQuestions.includes(q))
        const questionsToRemove = currentQuestions.filter(q => !selectedQuestions.includes(q))

        for (const questionId of questionsToAdd) {
          await addTemplateQuestionAction({ templateId: editingTemplateId, questionId })
        }

        for (const questionId of questionsToRemove) {
          await removeTemplateQuestionAction(editingTemplateId, questionId)
        }

        // Update the local state
        setTemplateQuestions(prev => ({
          ...prev,
          [editingTemplateId]: selectedQuestions
        }))

        toast({
          title: "Success",
          description: "Template updated successfully",
          variant: "default",
        })
        setTemplates(templates.map(t => t.id === editingTemplateId ? { 
          ...t, 
          name: templateName,
          recurrenceInterval,
          startDate: new Date(startDate), // Convert string to Date object
        } : t))
        setIsEditDialogOpen(false)
      } else {
        toast({
          title: "Error",
          description: "Failed to update template",
          variant: "destructive",
        })
      }
    } else {
      const result = await createFeedbackFormTemplate(
        selectedClient,
        templateName,
        recurrenceInterval,
        startDate,
        
      )

      if (result.isSuccess && result.data) {
        // Add questions to the new template
        for (const questionId of selectedQuestions) {
          await addTemplateQuestionAction({ templateId: result.data?.id ?? '', questionId })
        }

        // Update the local state
        setTemplateQuestions(prev => ({
          ...prev,
          [result.data?.id ?? '']: selectedQuestions
        }))

        toast({
          title: "Success",
          description: "Template created successfully",
          variant: "default",
        })
        setTemplates([...templates, { 
          id: result.data?.id ?? '',
          clientId: selectedClient,
          name: templateName,
          createdAt: new Date(),
          recurrenceInterval: 0, // Add default value
          startDate: new Date(), // Add default value
        }])
      } else {
        toast({
          title: "Error",
          description: "Failed to create template",
          variant: "destructive",
        })
      }
    }

    resetForm()
  }

  const resetForm = () => {
    setTemplateName("")
    setSelectedClient("")
    setRecurrenceInterval(7)
    setStartDate(new Date())
    setSelectedQuestions([])
    setEditingTemplateId(null)
  }

  const handleDelete = async (id: string) => {
    const result = await deleteFeedbackFormTemplate(id)
    if (result.isSuccess) {
      setTemplates(templates.filter(t => t.id !== id))
      toast({
        title: "Success",
        description: "Template deleted successfully",
        variant: "default",
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive",
      })
    }
  }

  const handleCancelEdit = () => {
    resetForm()
    setIsEditDialogOpen(false)
  }

  return (
    <div className="container mx-auto p-4">
      <Tabs defaultValue="view" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="add">Add Template</TabsTrigger>
          <TabsTrigger value="view">View Templates</TabsTrigger>
        </TabsList>
        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>Add New Template</CardTitle>
            </CardHeader>
            <CardContent>
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
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recurrenceInterval">Recurrence Interval (days)</Label>
                  <Input
                    id="recurrenceInterval"
                    type="number"
                    value={recurrenceInterval}
                    onChange={(e) => setRecurrenceInterval(parseInt(e.target.value))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate.toISOString().split('T')[0]}
                    onChange={(e) => setStartDate(new Date(e.target.value))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Select Questions</Label>
                  <ScrollArea className="h-[200px] w-full border rounded-md p-4">
                    {filteredQuestions.map((question) => (
                      <div key={question.id} className="flex items-center space-x-2 py-2">
                        <Checkbox
                          id={`question-${question.id}`}
                          checked={selectedQuestions.includes(question.id)}
                          onCheckedChange={() => handleQuestionToggle(question.id)}
                        />
                        <Label htmlFor={`question-${question.id}`}>
                          {question.questionText}
                          {question.global === "true" && (
                            <Badge variant="secondary" className="ml-2">Global</Badge>
                          )}
                        </Label>
                      </div>
                    ))}
                  </ScrollArea>
                </div>
                <Button type="submit" className="w-full">
                  <PlusCircleIcon className="mr-2 h-4 w-4" /> Create Template
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="view">
          <Card>
            <CardHeader>
              <CardTitle>Existing Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                {templates.map((template) => (
                  <Card key={template.id} className="mb-4">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-semibold">{template.name}</h3>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <Badge variant="outline">Recurrence: {template.recurrenceInterval} days</Badge>
                            <Badge variant="secondary">Start Date: {new Date(template.startDate).toLocaleDateString()}</Badge>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button onClick={() => handleEdit(template)} size="sm" variant="outline">
                            <PencilIcon className="h-4 w-4 mr-1" /> Edit
                          </Button>
                          <Button onClick={() => handleDelete(template.id)} size="sm" variant="destructive">
                            <TrashIcon className="h-4 w-4 mr-1" /> Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="templateName">Template Name</Label>
              <Input
                id="templateName"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Enter template name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recurrenceInterval">Recurrence Interval (days)</Label>
              <Input
                id="recurrenceInterval"
                type="number"
                value={recurrenceInterval}
                onChange={(e) => setRecurrenceInterval(parseInt(e.target.value))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate.toISOString().split('T')[0]}
                onChange={(e) => setStartDate(new Date(e.target.value))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Select Questions</Label>
              <ScrollArea className="h-[200px] w-full border rounded-md p-4">
                {filteredQuestions.map((question) => (
                  <div key={question.id} className="flex items-center space-x-2 py-2">
                    <Checkbox
                      id={`question-${question.id}`}
                      checked={selectedQuestions.includes(question.id)}
                      onCheckedChange={() => handleQuestionToggle(question.id)}
                    />
                    <Label htmlFor={`question-${question.id}`}>
                      {question.questionText}
                      {question.global === "true" && (
                        <Badge variant="secondary" className="ml-2">Global</Badge>
                      )}
                    </Label>
                  </div>
                ))}
              </ScrollArea>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={handleCancelEdit}>
                Cancel
              </Button>
              <Button type="submit">
                Update Template
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}