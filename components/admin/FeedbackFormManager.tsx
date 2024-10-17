"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Template } from "@/db/schema/feedback-form-templates-schema"
import { createFeedbackForm } from "@/actions/feedback-forms-actions"
import { getAllTemplates } from "@/actions/feedback-form-templates-actions"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"

const recurrenceOptions = [
  { value: "daily", label: "Daily", days: 1 },
  { value: "weekly", label: "Weekly", days: 7 },
  { value: "biweekly", label: "Biweekly", days: 14 },
  { value: "monthly", label: "Monthly", days: 30 },
  { value: "quarterly", label: "Quarterly", days: 90 },
  { value: "yearly", label: "Yearly", days: 365 },
  { value: "custom", label: "Custom", days: 0 },
]

export function FeedbackFormManager() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const [startDate, setStartDate] = useState<Date | undefined>(new Date())
  const [recurrenceType, setRecurrenceType] = useState("weekly")
  const [customRecurrence, setCustomRecurrence] = useState(7)
  const [quantity, setQuantity] = useState<number>(1)
  const { toast } = useToast()

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  const fetchTemplates = async () => {
    try {
      const templatesResult = await getAllTemplates()
      if (templatesResult.isSuccess && templatesResult.data) {
        setTemplates(templatesResult.data)
      } else {
        throw new Error(templatesResult.message)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch templates",
        variant: "destructive",
      })
    }
  }

  const getRecurrenceInterval = () => {
    if (recurrenceType === "custom") {
      return customRecurrence
    }
    return recurrenceOptions.find(option => option.value === recurrenceType)?.days || 7
  }

  const handleGenerateForms = async () => {
    if (!selectedTemplate || !startDate) {
      toast({
        title: "Error",
        description: "Please select a template and start date",
        variant: "destructive",
      })
      return
    }

    const recurrenceInterval = getRecurrenceInterval()

    try {
      const result = await createFeedbackForm(
        selectedTemplate,
        startDate,
        recurrenceInterval,
        quantity
      )
      if (!result.isSuccess) {
        throw new Error(result.message)
      }

      toast({
        title: "Success",
        description: `Generated ${quantity} feedback form(s)`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate feedback forms",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate New Forms</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="template-select" className="block text-sm font-medium mb-1">Feedback Template</label>
              <Select onValueChange={(value) => setSelectedTemplate(value)}>
                <SelectTrigger id="template-select" className="w-full">
                  <SelectValue placeholder="Select a feedback template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="start-date" className="block text-sm font-medium mb-1">Start Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button id="start-date" variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : <span>Select start date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="recurrence-select" className="block text-sm font-medium mb-1">Recurrence Interval</label>
              <Select onValueChange={setRecurrenceType} value={recurrenceType}>
                <SelectTrigger className="w-full" id="recurrence-select">
                  <SelectValue placeholder="Select recurrence interval" />
                </SelectTrigger>
                <SelectContent>
                  {recurrenceOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {recurrenceType === "custom" && (
              <div>
                <label htmlFor="custom-recurrence" className="block text-sm font-medium mb-1">Custom Recurrence (days)</label>
                <Input
                  id="custom-recurrence"
                  type="number"
                  min="1"
                  value={customRecurrence}
                  onChange={(e) => setCustomRecurrence(parseInt(e.target.value))}
                  placeholder="Enter custom recurrence in days"
                />
              </div>
            )}

            <div>
              <label htmlFor="quantity" className="block text-sm font-medium mb-1">Number of Forms to Generate</label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                placeholder="Enter number of forms to generate"
              />
            </div>
          </div>
        </div>
        <Button onClick={handleGenerateForms} className="w-full mt-6">Generate Feedback Forms</Button>
      </CardContent>
    </Card>
  )
}

export default FeedbackFormManager
