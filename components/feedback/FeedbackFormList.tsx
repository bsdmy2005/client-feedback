"use client";

import { UserFeedbackForm } from "@/db/schema";
import CompleteFormButton from "./CompleteFormButton";
import DeleteSubmissionButton from "./DeleteSubmissionButton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CalendarIcon, CheckCircleIcon, XCircleIcon, Edit, Trash2 } from "lucide-react";

interface FeedbackFormListProps {
  forms: UserFeedbackForm[];
}

export default function FeedbackFormList({ forms }: FeedbackFormListProps) {
  // Sort forms by due date (ascending order)
  const sortedForms = [...forms].sort((a, b) => 
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  const renderFormTable = (forms: UserFeedbackForm[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[60px]">ID</TableHead>
          <TableHead>Form Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Due/Completed Date</TableHead>
          <TableHead className="w-[100px]">
            <div className="flex justify-end">Action</div>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {forms.map(form => (
          <TableRow key={form.id} className="hover:bg-muted/50 transition-colors">
            <TableCell className="font-medium text-center whitespace-nowrap">{form.id}</TableCell>
            <TableCell>{form.templateName}</TableCell>
            <TableCell>
              <Badge 
                variant={form.status === "submitted" ? "secondary" : "default"}
                className="flex items-center gap-1"
              >
                {form.status === "submitted" ? (
                  <>
                    <CheckCircleIcon size={14} />
                    Submitted
                  </>
                ) : (
                  <>
                    <XCircleIcon size={14} />
                    Pending
                  </>
                )}
              </Badge>
            </TableCell>
            <TableCell className="whitespace-nowrap">
              <span className="flex items-center gap-2">
                <CalendarIcon size={14} className="text-muted-foreground" />
                {format(new Date(form.status === "submitted" ? form.lastUpdated : form.dueDate), 'PPP')}
              </span>
            </TableCell>
            <TableCell>
              <div className="flex justify-end">
                {form.status === "submitted" ? (
                  <DeleteSubmissionButton formId={form.id} />
                ) : (
                  <CompleteFormButton formId={form.id} />
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>All Forms</CardTitle>
      </CardHeader>
      <CardContent>
        {sortedForms.length > 0 ? (
          renderFormTable(sortedForms)
        ) : (
          <p className="text-muted-foreground text-center py-8">No forms available.</p>
        )}
      </CardContent>
    </Card>
  );
}