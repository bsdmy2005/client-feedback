"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircleIcon, PencilIcon, TrashIcon, ChevronUpIcon, ChevronDownIcon } from "lucide-react"
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
import { getTemplateQuestionsAction, addTemplateQuestionAction, removeTemplateQuestionAction, updateTemplateQuestionOrderAction } from "@/actions/template-questions-actions"
import { assignUsersToTemplate } from "@/actions/user-template-assignments-actions"

type UserAssignment = {
  userId: string;
  userEmail: string;
};

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
  const [selectedQuestionsOrder, setSelectedQuestionsOrder] = useState<{ id: string; order: number }[]>([])
  const [orderedQuestions, setOrderedQuestions] = useState<{ id: string; text: string }[]>([])
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("view")
  const [selectedUsers, setSelectedUsers] = useState<UserAssignment[]>([])

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

  useEffect(() => {
    if (editingTemplateId) {
      const fetchTemplateQuestions = async () => {
        const result = await getTemplateQuestionsAction(editingTemplateId);
        if (result.isSuccess && result.data) {
          const sortedQuestions = result.data.sort((a, b) => a.order - b.order);
          setSelectedQuestions(sortedQuestions.map(tq => tq.questionId));
          setOrderedQuestions(sortedQuestions.map(tq => ({
            id: tq.questionId,
            text: filteredQuestions.find(q => q.id === tq.questionId)?.questionText || ''
          })));
        }
      };
      fetchTemplateQuestions();
    } else {
      setSelectedQuestions([]);
      setOrderedQuestions([]);
    }
  }, [editingTemplateId, filteredQuestions]);

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

  const handleQuestionToggle = (questionId: string, questionText: string) => {
    setSelectedQuestions(prev => {
      const newSelected = prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId];
      
      setOrderedQuestions(prevOrdered => {
        if (newSelected.includes(questionId) && !prevOrdered.some(q => q.id === questionId)) {
          return [...prevOrdered, { id: questionId, text: questionText }];
        } else if (!newSelected.includes(questionId)) {
          return prevOrdered.filter(q => q.id !== questionId);
        }
        return prevOrdered;
      });

      return newSelected;
    });
  }

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    const newOrderedQuestions = [...orderedQuestions];
    if (direction === 'up' && index > 0) {
      [newOrderedQuestions[index - 1], newOrderedQuestions[index]] = [newOrderedQuestions[index], newOrderedQuestions[index - 1]];
    } else if (direction === 'down' && index < newOrderedQuestions.length - 1) {
      [newOrderedQuestions[index], newOrderedQuestions[index + 1]] = [newOrderedQuestions[index + 1], newOrderedQuestions[index]];
    }
    setOrderedQuestions(newOrderedQuestions);
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
        // Update template questions with new order
        for (let i = 0; i < orderedQuestions.length; i++) {
          await updateTemplateQuestionOrderAction(editingTemplateId, orderedQuestions[i].id, i);
        }

        // Remove questions that are no longer selected
        const currentQuestions = templateQuestions[editingTemplateId] || [];
        const questionsToRemove = currentQuestions.filter(q => !selectedQuestions.includes(q));
        for (const questionId of questionsToRemove) {
          await removeTemplateQuestionAction(editingTemplateId, questionId);
        }

        // Add newly selected questions
        const questionsToAdd = selectedQuestions.filter(q => !currentQuestions.includes(q));
        for (const questionId of questionsToAdd) {
          await addTemplateQuestionAction({ 
            templateId: editingTemplateId, 
            questionId, 
            order: orderedQuestions.findIndex(q => q.id === questionId) 
          });
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
          startDate: new Date(startDate),
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
        // Add questions to the new template with order
        for (let i = 0; i < orderedQuestions.length; i++) {
          await addTemplateQuestionAction({ 
            templateId: result.data.id, 
            questionId: orderedQuestions[i].id, 
            order: i 
          });
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
        setTemplates(prevTemplates => [...prevTemplates, { 
          id: result.data?.id ?? '',
          clientId: selectedClient,
          name: templateName,
          createdAt: new Date(),
          recurrenceInterval,
          startDate,
        }])
        resetForm()
        setActiveTab("view")
      } else {
        toast({
          title: "Error",
          description: "Failed to create template",
          variant: "destructive",
        })
      }
    }
  }

  const resetForm = () => {
    setTemplateName("")
    setSelectedClient("")
    setRecurrenceInterval(7)
    setStartDate(new Date())
    setSelectedQuestions([])
    setOrderedQuestions([])
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

  const handleAssignUsers = async () => {
    if (editingTemplateId && selectedUsers.length > 0) {
      const result = await assignUsersToTemplate(editingTemplateId, selectedUsers);
      if (result.isSuccess) {
        toast({
          title: "Success",
          description: "Users assigned to template successfully",
          variant: "default",
        });
        // Reset selection or update UI as needed
      } else {
        toast({
          title: "Error",
          description: "Failed to assign users to template",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
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
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Questions</Label>
                    <ScrollArea className="h-[200px] w-full border rounded-md p-4">
                      {filteredQuestions.map((question) => (
                        <div key={question.id} className="flex items-center space-x-2 py-2">
                          <Checkbox
                            id={`question-${question.id}`}
                            checked={selectedQuestions.includes(question.id)}
                            onCheckedChange={() => handleQuestionToggle(question.id, question.questionText)}
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
                  {orderedQuestions.length > 0 && (
                    <div className="space-y-2">
                      <Label>Order Questions</Label>
                      <ScrollArea className="h-[200px] w-full border rounded-md p-4">
                        {orderedQuestions.map((question, index) => (
                          <div key={question.id} className="flex items-center space-x-2 p-2 bg-secondary rounded-md mb-2">
                            <div className="flex-shrink-0">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => moveQuestion(index, 'up')}
                                disabled={index === 0}
                              >
                                <ChevronUpIcon className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => moveQuestion(index, 'down')}
                                disabled={index === orderedQuestions.length - 1}
                              >
                                <ChevronDownIcon className="h-4 w-4" />
                              </Button>
                            </div>
                            <span className="truncate flex-grow">{question.text}</span>
                          </div>
                        ))}
                      </ScrollArea>
                    </div>
                  )}
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
  <Badge variant="outline">Recurrence: {template.recurrenceInterval}</Badge>
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
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex-grow flex flex-col">
            <div className="space-y-4 flex-grow overflow-y-auto pr-4">
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
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Questions</Label>
                  <ScrollArea className="h-[200px] w-full border rounded-md p-4">
                    {filteredQuestions.map((question) => (
                      <div key={question.id} className="flex items-center space-x-2 py-2">
                        <Checkbox
                          id={`question-${question.id}`}
                          checked={selectedQuestions.includes(question.id)}
                          onCheckedChange={() => handleQuestionToggle(question.id, question.questionText)}
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
                {orderedQuestions.length > 0 && (
                  <div className="space-y-2">
                    <Label>Order Questions</Label>
                    <ScrollArea className="h-[200px] w-full border rounded-md p-4">
                      {orderedQuestions.map((question, index) => (
                        <div key={question.id} className="flex items-center space-x-2 p-2 bg-secondary rounded-md mb-2">
                          <div className="flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => moveQuestion(index, 'up')}
                              disabled={index === 0}
                            >
                              <ChevronUpIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => moveQuestion(index, 'down')}
                              disabled={index === orderedQuestions.length - 1}
                            >
                              <ChevronDownIcon className="h-4 w-4" />
                            </Button>
                          </div>
                          <span className="truncate flex-grow">{question.text}</span>
                        </div>
                      ))}
                    </ScrollArea>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4 mt-4 border-t">
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
      <div>
        {/* User selection UI */}
        <Button onClick={handleAssignUsers}>Assign Selected Users</Button>
      </div>
    </div>
  )
}