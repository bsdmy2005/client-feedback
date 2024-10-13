"use client";

import { useState, useMemo } from "react";
import { UserFeedbackForm, userFeedbackFormStatusEnum } from "@/db/schema/user-feedback-forms-schema";
import CompleteFormButton from "./CompleteFormButton";
import DeleteSubmissionButton from "./DeleteSubmissionButton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CalendarIcon, AlertCircle, CheckCircle, Clock, XCircle, Filter } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface FeedbackFormListProps {
  forms: UserFeedbackForm[];
}

export default function FeedbackFormList({ forms }: FeedbackFormListProps) {
  const [showSubmitted, setShowSubmitted] = useState(false);

  const sortedForms = useMemo(() => {
    return [...forms].sort((a, b) => 
      new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );
  }, [forms]);

  const filteredForms = useMemo(() => {
    return showSubmitted ? sortedForms : sortedForms.filter(form => form.status !== "submitted");
  }, [sortedForms, showSubmitted]);

  const getStatusBadge = (status: typeof userFeedbackFormStatusEnum.enumValues[number] | null) => {
    switch (status) {
      case "pending":
        return <Badge variant="default" className="flex items-center gap-1"><Clock size={14} />Pending</Badge>;
      case "active":
        return <Badge variant="secondary" className="flex items-center gap-1"><AlertCircle size={14} />Active</Badge>;
      case "overdue":
        return <Badge variant="destructive" className="flex items-center gap-1"><XCircle size={14} />Overdue</Badge>;
      case "closed":
        return <Badge variant="outline" className="flex items-center gap-1"><CheckCircle size={14} />Closed</Badge>;
      case "submitted":
        return <Badge variant="secondary" className="flex items-center gap-1 bg-green-100 text-green-800"><CheckCircle size={14} />Submitted</Badge>;
      default:
        return <Badge variant="default" className="flex items-center gap-1"><AlertCircle size={14} />Unknown</Badge>;
    }
  };

  const renderFormTable = (forms: UserFeedbackForm[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Form Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Due/Completed Date</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {forms.map(form => (
          <TableRow key={form.id} className="hover:bg-muted/50 transition-colors">
            <TableCell className="font-medium">{form.templateName}</TableCell>
            <TableCell>{getStatusBadge(form.status)}</TableCell>
            <TableCell className="whitespace-nowrap">
              <span className="flex items-center gap-2">
                <CalendarIcon size={14} className="text-muted-foreground" />
                {format(new Date(form.status === "submitted" ? form.lastUpdated : form.dueDate), 'PPP')}
              </span>
            </TableCell>
            <TableCell className="text-right">
              {form.status === "submitted" || form.status === "closed" ? (
                <DeleteSubmissionButton formId={form.id} />
              ) : (
                <CompleteFormButton formId={form.id} />
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">Feedback Forms</CardTitle>
        <div className="flex items-center space-x-2">
          <Switch
            id="show-submitted"
            checked={showSubmitted}
            onCheckedChange={setShowSubmitted}
          />
          <Label htmlFor="show-submitted" className="text-sm font-medium">
            Show Submitted
          </Label>
        </div>
      </CardHeader>
      <CardContent>
        {filteredForms.length > 0 ? (
          renderFormTable(filteredForms)
        ) : (
          <p className="text-muted-foreground text-center py-8">No forms available.</p>
        )}
      </CardContent>
    </Card>
  );
}
