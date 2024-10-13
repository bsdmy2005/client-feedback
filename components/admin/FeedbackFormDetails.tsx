"use client"

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { FeedbackForm } from "@/db/schema/feedback-forms-schema"
import { UserFeedbackForm } from "@/db/schema/user-feedback-forms-schema"
import { FormAnswer } from "@/db/schema/form-answers-schema"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { sendReminderEmail } from "@/actions/reminder-actions"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"; // Import format from date-fns

type UserFormWithName = UserFeedbackForm & { userName: string };

interface FeedbackFormDetailsProps {
  feedbackForm: FeedbackForm;
  userForms: UserFormWithName[];
  formAnswers: FormAnswer[];
}

export function FeedbackFormDetails({ feedbackForm, userForms, formAnswers }: FeedbackFormDetailsProps) {
  const { toast } = useToast();
  const [sendingReminder, setSendingReminder] = useState<string | null>(null);

  // Group form answers by user
  const answersByUser = formAnswers.reduce((acc, answer) => {
    if (!acc[answer.userId]) {
      acc[answer.userId] = [];
    }
    acc[answer.userId].push(answer);
    return acc;
  }, {} as Record<string, FormAnswer[]>);

  const handleSendReminder = async (userForm: UserFormWithName) => {
    setSendingReminder(userForm.id);
    const result = await sendReminderEmail(
      userForm.userId,
      userForm.id,
      feedbackForm.templateName,
      userForm.dueDate
    );
    setSendingReminder(null);

    if (result.isSuccess) {
      toast({
        title: "Reminder Sent",
        description: `Reminder email sent to ${userForm.userName}`,
      });
    } else {
      toast({
        title: "Error",
        description: result.message || "Failed to send reminder email",
        variant: "destructive",
      });
    }
  };

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
              <TableHead>Send Reminder</TableHead>
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
                <TableCell>{format(new Date(userForm.dueDate), 'yyyy/MM/dd')}</TableCell>
                <TableCell>
                  {userForm.status === "submitted" && (
                    <Link href={`/admin/feedback/${feedbackForm.id}/user/${userForm.userId}`}>
                      <Button variant="outline" size="sm">View Responses</Button>
                    </Link>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSendReminder(userForm)}
                    disabled={userForm.status === "submitted" || sendingReminder === userForm.id}
                  >
                    {sendingReminder === userForm.id ? "Sending..." : "Send Reminder"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
