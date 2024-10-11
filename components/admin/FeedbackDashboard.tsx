"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { FeedbackForm } from "@/db/schema/feedback-forms-schema"
import { updateFeedbackForm, deleteFeedbackForm } from "@/actions/feedback-forms-actions"
import { getAllFeedbackForms } from "@/db/queries/feedback-forms-queries"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { TrashIcon, SearchIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { FilterIcon } from "lucide-react"

export function FeedbackDashboard() {
  const [feedbackForms, setFeedbackForms] = useState<FeedbackForm[]>([])
  const [clientFilter, setClientFilter] = useState("")
  const [templateFilter, setTemplateFilter] = useState("")
  const { toast } = useToast()
  const [statusFilter, setStatusFilter] = useState<string[]>(["pending", "active", "overdue"])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
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

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feedback Dashboard</CardTitle>
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
  )
}