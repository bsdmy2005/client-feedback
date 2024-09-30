"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircleIcon, XCircleIcon } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { InsertQuestion } from "@/db/schema/questions-schema"
import { getAllClientsAction } from "@/actions/clients-actions"
import { createQuestion, updateQuestion, deleteQuestion } from "@/actions/questions-actions"
import { PencilIcon, TrashIcon } from "lucide-react"

type QuestionType = 'free_text' | 'multiple_choice' | 'drop_down'
type QuestionTheme = 'competition' | 'environment' | 'personal' | 'bus_dev'

export function QuestionManager() {
  const [question, setQuestion] = useState<Partial<InsertQuestion>>({
    questionType: 'multiple_choice',
    questionTheme: 'competition',
    global: 'true',
  })
  const [options, setOptions] = useState([""])
  const [clients, setClients] = useState<{clientId: string, name: string}[]>([])
  const [questions, setQuestions] = useState<any[]>([])
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null)

  useEffect(() => {
    const fetchClients = async () => {
      const result = await getAllClientsAction()
      if (result.isSuccess && result.data) {
        setClients(result.data)
      }
    }
    fetchClients()
  }, [])

  const handleAddOption = () => {
    setOptions([...options, ""])
  }

  const handleRemoveOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index)
    setOptions(newOptions)
  }

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const questionData = { 
      ...question, 
      options: question.questionType === 'free_text' ? undefined : options 
    }
    
    if (editingQuestionId) {
      const result = await updateQuestion(editingQuestionId, {
        ...questionData,
        clientId: questionData.clientId || undefined
      })
      if (result.isSuccess) {
        setQuestions(questions.map(q => q.id === editingQuestionId ? { ...q, ...questionData } : q))
        setEditingQuestionId(null)
      }
    } else {
      const result = await createQuestion(
        questionData.questionText!,
        questionData.questionType as 'free_text' | 'multiple_choice' | 'drop_down',
        questionData.questionTheme as "competition" | "environment" | "personal" | "bus_dev",
        questionData.global === 'true',
        questionData.clientId ?? undefined,
        questionData.options
      )
      if (result.isSuccess && result.data) {
        setQuestions([...questions, { ...questionData, id: result.data.id }])
      }
    }

    resetForm()
  }

  const resetForm = () => {
    setQuestion({
      questionType: 'multiple_choice',
      questionTheme: 'competition',
      global: 'true',
    })
    setOptions([""])
  }

  const handleEdit = (q: any) => {
    setQuestion({
      questionType: q.questionType,
      questionTheme: q.questionTheme,
      global: q.global,
      questionText: q.questionText,
      clientId: q.clientId,
    })
    setOptions(q.options || [""])
    setEditingQuestionId(q.id)
  }

  const handleDelete = async (id: string) => {
    const result = await deleteQuestion(id)
    if (result.isSuccess) {
      setQuestions(questions.filter(q => q.id !== id))
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="questionType">Question Type</Label>
          <Select
            value={question.questionType}
            onValueChange={(value: QuestionType) => setQuestion({...question, questionType: value})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select question type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="free_text">Free Text</SelectItem>
              <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
              <SelectItem value="drop_down">Drop Down</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="questionTheme">Question Theme</Label>
          <Select
            value={question.questionTheme}
            onValueChange={(value: QuestionTheme) => setQuestion({...question, questionTheme: value})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select question theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="competition">Competition</SelectItem>
              <SelectItem value="environment">Environment</SelectItem>
              <SelectItem value="personal">Personal</SelectItem>
              <SelectItem value="bus_dev">Business Development</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="questionText">Question</Label>
          <Textarea
            id="questionText"
            value={question.questionText || ''}
            onChange={(e) => setQuestion({...question, questionText: e.target.value})}
            placeholder="Enter your question"
            required
            className="min-h-[100px]"
          />
        </div>
        {(question.questionType === "multiple_choice" || question.questionType === "drop_down") && (
          <div className="space-y-2">
            <Label>Options</Label>
            {options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  required
                  className="flex-grow"
                />
                {options.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveOption(index)}
                  >
                    <XCircleIcon className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" onClick={handleAddOption} className="w-full">
              <PlusCircleIcon className="mr-2 h-4 w-4" /> Add Option
            </Button>
          </div>
        )}
        <div className="flex items-center space-x-2">
          <Switch
            id="global"
            checked={question.global === 'true'}
            onCheckedChange={(checked) => setQuestion({...question, global: checked ? 'true' : 'false'})}
          />
          <Label htmlFor="global">Global Question</Label>
        </div>
        {question.global === 'false' && (
          <div className="space-y-2">
            <Label htmlFor="clientId">Client</Label>
            <Select
              value={question.clientId ?? ''}
              onValueChange={(value: string) => setQuestion({...question, clientId: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.clientId} value={client.clientId}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <Button type="submit" className="w-full sm:w-auto">
          Add Question
        </Button>
      </form>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Existing Questions</h2>
        {questions.map((q) => (
          <div key={q.id} className="border p-4 rounded-md">
            <p><strong>Question:</strong> {q.questionText}</p>
            <p><strong>Type:</strong> {q.questionType}</p>
            <p><strong>Theme:</strong> {q.questionTheme}</p>
            <p><strong>Global:</strong> {q.global}</p>
            {q.options && q.options.length > 0 && (
              <p><strong>Options:</strong> {q.options.join(', ')}</p>
            )}
            <div className="mt-2">
              <Button onClick={() => handleEdit(q)} className="mr-2" size="sm">
                <PencilIcon className="h-4 w-4 mr-1" /> Edit
              </Button>
              <Button onClick={() => handleDelete(q.id)} variant="destructive" size="sm">
                <TrashIcon className="h-4 w-4 mr-1" /> Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}