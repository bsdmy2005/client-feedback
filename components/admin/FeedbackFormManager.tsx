"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Template } from "@/db/schema/feedback-form-templates-schema"
import { FeedbackForm } from "@/db/schema/feedback-forms-schema"
import { createFeedbackForm, updateFeedbackForm, deleteFeedbackForm } from "@/actions/feedback-forms-actions"
import { getAllTemplates } from "@/actions/feedback-form-templates-actions"
import { getAllFeedbackForms } from "@/db/queries/feedback-forms-queries"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { CalendarIcon, TrashIcon, SearchIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format, addDays, addWeeks, addMonths, addYears } from "date-fns"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { FilterIcon } from "lucide-react"

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
  const [feedbackForms, setFeedbackForms] = useState<FeedbackForm[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const [startDate, setStartDate] = useState<Date | undefined>(new Date())
  const [recurrenceType, setRecurrenceType] = useState("weekly")
  const [customRecurrence, setCustomRecurrence] = useState(7)
  const [quantity, setQuantity] = useState<number>(1)
  const [clientFilter, setClientFilter] = useState("")
  const [templateFilter, setTemplateFilter] = useState("")
  const { toast } = useToast()
  const [newFormName, setNewFormName] = useState('')
  const [statusFilter, setStatusFilter] = useState<string[]>(["pending", "active", "overdue"])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const templatesResult = await getAllTemplates()
      if (templatesResult.isSuccess && templatesResult.data) {
        setTemplates(templatesResult.data)
      } else {
        throw new Error(templatesResult.message)
      }

      const formsResult = await getAllFeedbackForms()
      setFeedbackForms(formsResult)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      })
    }
  }

  const filteredFeedbackForms = useMemo(() => {
    return feedbackForms.filter(form => 
      form.clientName.toLowerCase().includes(clientFilter.toLowerCase()) &&
      form.templateName.toLowerCase().includes(templateFilter.toLowerCase()) &&
      statusFilter.includes(form.status)
    )
  }, [feedbackForms, clientFilter, templateFilter, statusFilter])

  const getRecurrenceInterval = () => {
    if (recurrenceType === "custom") {
      return customRecurrence
    }
    return recurrenceOptions.find(option => option.value === recurrenceType)?.days || 7
  }

  const calculateDueDate = (start: Date, interval: number) => {
    return addDays(start, interval)
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
    const firstDueDate = calculateDueDate(startDate, recurrenceInterval)

    try {
      const result = await createFeedbackForm(
        selectedTemplate,
        firstDueDate,
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

      fetchData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate feedback forms",
        variant: "destructive",
      })
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateFeedbackForm(id, { status: newStatus })
      toast({
        title: "Success",
        description: "Feedback form status updated",
      })
      fetchData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update feedback form status",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteFeedbackForm(id)
      toast({
        title: "Success",
        description: "Feedback form deleted",
      })
      fetchData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete feedback form",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "active":
        return "bg-green-100 text-green-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const handleCreateForm = () => {
    // Add your form creation logic here
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    )
  }

  return (
    <div className="space-y-8 p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Feedback Form Manager</h1>
      
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="generate-forms">
          <AccordionTrigger>Generate New Forms</AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardContent className="pt-6">
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
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Card>
        <CardHeader>
          <CardTitle>Existing Feedback Forms</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                className="pl-10"
                placeholder="Filter by client name..."
                value={clientFilter}
                onChange={(e) => setClientFilter(e.target.value)}
              />
            </div>
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                className="pl-10"
                placeholder="Filter by template name..."
                value={templateFilter}
                onChange={(e) => setTemplateFilter(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full md:w-auto">
                  <FilterIcon className="mr-2 h-4 w-4" />
                  Filter by Status
                  {statusFilter.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {statusFilter.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Select Statuses</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {["pending", "active", "overdue", "closed"].map((status) => (
                  <div key={status} className="flex items-center px-2 py-2">
                    <Checkbox
                      id={`status-${status}`}
                      checked={statusFilter.includes(status)}
                      onCheckedChange={() => handleStatusFilterChange(status)}
                    />
                    <label
                      htmlFor={`status-${status}`}
                      className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                    >
                      {status}
                    </label>
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Template Name</TableHead>
                  <TableHead>Client Name</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFeedbackForms.map((form) => (
                  <TableRow key={form.id}>
                    <TableCell>{form.templateName}</TableCell>
                    <TableCell>{form.clientName}</TableCell>
                    <TableCell>{new Date(form.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Select
                        defaultValue={form.status}
                        onValueChange={(value) => handleStatusChange(form.id, value)}
                      >
                        <SelectTrigger className={`w-[120px] ${getStatusColor(form.status)}`}>
                          <SelectValue>{form.status}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="overdue">Overdue</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(form.id)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>     
    </div>
  )
}

export default FeedbackFormManager