"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { FeedbackForm } from "@/db/schema/feedback-forms-schema"
import { updateFeedbackForm, deleteFeedbackForm, getFeedbackFormResponses } from "@/actions/feedback-forms-actions"
import { getAllFeedbackFormsWithProgress } from "@/db/queries/feedback-forms-queries"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { TrashIcon, SearchIcon, EyeIcon, DownloadIcon, FileTextIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { FilterIcon } from "lucide-react"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"
import { ExecutiveSummaryReport } from "./ExecutiveSummaryReport"
import { Dialog, DialogContent } from "@/components/ui/dialog"

type FeedbackFormWithProgress = FeedbackForm & { percentComplete: number }

export function FeedbackDashboard() {
  const [feedbackForms, setFeedbackForms] = useState<FeedbackFormWithProgress[]>([])
  const [clientFilter, setClientFilter] = useState("")
  const [templateFilter, setTemplateFilter] = useState("")
  const { toast } = useToast()
  const [statusFilter, setStatusFilter] = useState<string[]>(["pending", "active", "overdue"])
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const fetchData = async () => {
    try {
      const formsResult = await getAllFeedbackFormsWithProgress()
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

  const handleDownload = async (formId: string) => {
    try {
      const responses = await getFeedbackFormResponses(formId);
      if (responses.isSuccess && responses.data) {
        const csvContent = generateCSV(responses.data);
        downloadCSV(csvContent, `feedback_responses_${formId}.csv`);
      } else {
        toast({
          title: "Error",
          description: "Failed to download responses",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error downloading responses:", error);
      toast({
        title: "Error",
        description: "Failed to download responses",
        variant: "destructive",
      });
    }
  };

  const generateCSV = (responses: any[]) => {
    if (responses.length === 0) return '';

    const allQuestions = new Set<string>();
    responses.forEach(response => {
      Object.keys(response.answers).forEach(question => allQuestions.add(question));
    });

    const questions = Array.from(allQuestions);
    const headers = ['User', 'Submission Date', ...questions];
    const csvRows = [headers.map(escapeCSVField).join(',')];

    responses.forEach(response => {
      const submissionDate = new Date(response.submittedAt).toLocaleString();
      const row = [
        response.userName,
        submissionDate,
        ...questions.map(q => escapeCSVField(response.answers[q] || ''))
      ];
      csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
  };

  const escapeCSVField = (field: string): string => {
    // If the field contains commas, newlines, or double quotes, enclose it in double quotes
    if (/[",\n\r]/.test(field)) {
      // Replace any double quotes with two double quotes
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  };

  const downloadCSV = (content: string, fileName: string) => {
    // Add BOM to ensure Excel recognizes the file as UTF-8
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Feedback Dashboard</CardTitle>
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
                  <TableHead>Progress</TableHead>
                  <TableHead>Actions</TableHead>
                  <TableHead>Download</TableHead>
                  <TableHead>Summary</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFeedbackForms.map((form) => (
                  <TableRow key={form.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell>
                      <Link href={`/admin/feedback/${form.id}`} className="text-blue-600 hover:text-blue-800 hover:underline flex items-center">
                        {form.templateName}
                        <EyeIcon className="ml-2 h-4 w-4" />
                      </Link>
                    </TableCell>
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
                      <div className="flex items-center space-x-2">
                        <Progress value={form.percentComplete} className="w-[60px]" />
                        <span>{form.percentComplete}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Link href={`/admin/feedback/${form.id}`}>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </Link>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(form.id)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(form.id)}
                      >
                        <DownloadIcon className="h-4 w-4 mr-2" />
                        CSV
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedFormId(form.id)}
                      >
                        <FileTextIcon className="h-4 w-4 mr-2" />
                        Generate Summary
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={selectedFormId !== null} onOpenChange={() => setSelectedFormId(null)}>
        <DialogContent className="max-w-4xl">
          {selectedFormId && (
            <ExecutiveSummaryReport 
              feedbackFormId={selectedFormId} 
              onClose={() => setSelectedFormId(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
