"use client";

import { useState, useEffect } from "react";
import { UserFeedbackForm } from "@/db/schema/user-feedback-forms-schema";
import { submitFormAnswer } from "@/actions/form-answers-actions";
import { updateFeedbackForm } from "@/actions/feedback-forms-actions";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2 } from "lucide-react";
import { updateUserFeedbackFormAction } from "@/actions/user-feedback-forms-actions";
import { updateFeedbackFormTemplate } from "@/actions/feedback-form-templates-actions";
import { format } from "date-fns";

interface QuestionOption {
  id: string;
  optionText: string;
}

interface Question {
  questionId: string;
  questionText: string;
  questionType: string;
  questionTheme: string;
  options: QuestionOption[];
}

interface FeedbackFormCompletionProps {
  form: UserFeedbackForm; // This should be the correct type from user-feedback-forms-schema.ts
  questions: Question[];
  userId: string;
}

export default function FeedbackFormCompletion({ form, questions, userId }: FeedbackFormCompletionProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openQuestions, setOpenQuestions] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const completedQuestions = Object.keys(answers).length;
    setProgress((completedQuestions / questions.length) * 100);
  }, [answers, questions]);

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const toggleQuestion = (questionId: string) => {
    setOpenQuestions(prev =>
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log("Form data before submission:", {
        answers,
        userId,
        formuserId: form.id,
        submittedAt: new Date(),
      });

      const submitResult = await submitFormAnswer({
        answers: answers,
        userId: userId,
        formuserId: form.id,
        submittedAt: new Date(),
      });

      console.log("Submit result:", submitResult);

      if (submitResult.isSuccess) {
        await updateUserFeedbackFormAction(form.id, { status: "submitted" });
        
        toast({
          title: "Form submitted successfully",
          description: "Thank you for your feedback!",
        });
        router.push("/feedback");
      } else {
        throw new Error(submitResult.message);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: "Failed to submit the form. Please try again.",
        variant: "destructive",
      });
    }

    setIsSubmitting(false);
  };

  const renderQuestionInput = (question: Question) => {
    switch (question.questionType) {
      case 'free_text':
        return (
          <textarea
            className="w-full min-h-[8rem] p-2 border rounded-md resize-none"
            value={answers[question.questionId] || ''}
            onChange={(e) => {
              handleAnswerChange(question.questionId, e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
          />
        );
      case 'multiple_choice':
        return (
          <RadioGroup
            onValueChange={(value) => handleAnswerChange(question.questionId, value)}
            value={answers[question.questionId]}
          >
            {question.options.map(option => (
              <div key={option.id} className="flex items-center space-x-2">
                <RadioGroupItem value={option.id} id={option.id} />
                <Label htmlFor={option.id}>{option.optionText}</Label>
              </div>
            ))}
          </RadioGroup>
        );
      case 'drop_down':
        return (
          <Select
            onValueChange={(value) => handleAnswerChange(question.questionId, value)}
            value={answers[question.questionId]}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {question.options.map(option => (
                <SelectItem key={option.id} value={option.id}>
                  {option.optionText}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      default:
        return null;
    }
  };

  const allQuestionsAnswered = questions.every(q => answers[q.questionId]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Consultant Feedback Form</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Welcome to the Consultant Feedback Form for {form.clientName}.</p>
          <p className="mb-4">This form is designed as a key tool for us to gather invaluable insights directly from our consultants who are on the front lines with our clients every day. Your unique perspectives and experiences are critical in shaping our strategies across business development, crisis management, opportunity identification, and overall performance improvement.</p>
          <p className="mb-4">By sharing your observations, challenges, successes, and suggestions, you play a pivotal role in our continuous effort to enhance our services, strengthen client relationships, and foster a productive and positive work environment. Your feedback is confidential and will be used constructively to inform decisions and actions at the management level.</p>
          <p className="mb-4">We thank you in advance for your time and thoughtful input.</p>
          <p className="font-semibold">Due: {form.dueDate ? format(new Date(form.dueDate), 'PPP') : 'No due date'}</p>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="mb-4">
          <Label>Progress</Label>
          <Progress value={progress} className="w-full" />
        </div>
        {questions.map((question, index) => (
          <Collapsible
            key={question.questionId}
            open={openQuestions.includes(question.questionId)}
            onOpenChange={() => toggleQuestion(question.questionId)}
          >
            <Card className={`${answers[question.questionId] ? "border-l-4 border-l-green-500" : ""} transition-all duration-300 ease-in-out`}>
              <CardHeader className="flex flex-row items-center space-x-4 p-4">
                <div className="flex-none w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <span className="font-medium text-gray-600">{index + 1}</span>
                  {answers[question.questionId] && (
                    <CheckCircle2 className="text-green-500 w-4 h-4 ml-1" />
                  )}
                </div>
                <div className="flex-grow">
                  <CollapsibleTrigger asChild>
                    <CardTitle className="flex items-center justify-between cursor-pointer text-base font-medium">
                      <span>{question.questionText}</span>
                    </CardTitle>
                  </CollapsibleTrigger>
                </div>
              </CardHeader>
              <CollapsibleContent>
                <CardContent className="pl-16 pr-4 pb-4">
                  {renderQuestionInput(question)}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))}
        <Button type="submit" disabled={isSubmitting || !allQuestionsAnswered} className="w-full">
          {isSubmitting ? "Submitting..." : "Submit Form"}
        </Button>
      </form>
    </div>
  );
}