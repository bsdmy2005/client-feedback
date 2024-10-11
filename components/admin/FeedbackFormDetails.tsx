"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { FeedbackForm } from "@/db/schema/feedback-forms-schema"
import { UserFeedbackForm } from "@/db/schema/user-feedback-forms-schema"
import { FormAnswer } from "@/db/schema/form-answers-schema"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Link from "next/link"
import { Button } from "@/components/ui/button"

type UserFormWithName = UserFeedbackForm & { userName: string };

interface FeedbackFormDetailsProps {
  feedbackForm: FeedbackForm;
  userForms: UserFormWithName[];
  formAnswers: FormAnswer[];
}

export function FeedbackFormDetails({ feedbackForm, userForms, formAnswers }: FeedbackFormDetailsProps) {
  // Group form answers by user
  const answersByUser = formAnswers.reduce((acc, answer) => {
    if (!acc[answer.userId]) {
      acc[answer.userId] = [];
    }
    acc[answer.userId].push(answer);
    return acc;
  }, {} as Record<string, FormAnswer[]>);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{feedbackForm.templateName} - {feedbackForm.clientName}</CardTitle>
      </CardHeader>
      <CardContent>
        <h3 className="text-lg font-semibold mb-4">User Statuses</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userForms.map((userForm) => (
              <TableRow key={userForm.id}>
                <TableCell>{userForm.userName}</TableCell>
                <TableCell>
                  <Badge variant={userForm.status === "submitted" ? "default" : "secondary"}>
                    {userForm.status}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(userForm.dueDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  {userForm.status === "submitted" && (
                    <Link href={`/admin/feedback/${feedbackForm.id}/user/${userForm.userId}`}>
                      <Button variant="outline" size="sm">View Responses</Button>
                    </Link>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}