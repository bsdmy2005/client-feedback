"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircleIcon, XCircleIcon, PencilIcon, TrashIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { InsertQuestion } from "@/db/schema/questions-schema";
import { getAllClientsAction, getClientByIdAction } from "@/actions/clients-actions";
import { createQuestion, updateQuestion, deleteQuestion, getAllQuestions } from "@/actions/questions-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

type QuestionType = 'free_text' | 'multiple_choice' | 'drop_down';
type QuestionTheme = 'competition' | 'environment' | 'personal' | 'bus_dev';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function QuestionManager() {
  const [question, setQuestion] = useState<Partial<InsertQuestion>>({
    questionType: 'multiple_choice',
    questionTheme: 'competition',
    global: 'true',
  });
  const [options, setOptions] = useState([""]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const { toast } = useToast();
  const [bulkOptions, setBulkOptions] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const questionsResult = await getAllQuestions();
      if (questionsResult.isSuccess && questionsResult.data) {
        setQuestions(questionsResult.data);
      }
      const clientsResult = await getAllClientsAction();
      if (clientsResult.isSuccess && clientsResult.data) {
        setClients(clientsResult.data);
      }
    };
    fetchData();
  }, []);

  const handleAddOption = () => {
    setOptions([...options, ""]);
  };

  const handleRemoveOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleBulkOptionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBulkOptions(e.target.value);
  };

  const handleBulkOptionsSubmit = () => {
    const newOptions = bulkOptions.split('\n').filter(option => option.trim() !== '');
    setOptions(newOptions);
    setBulkOptions("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const questionData = {
      ...question,
      options: question.questionType === 'free_text' ? undefined : options,
    };

    if (editingQuestionId) {
      // Update existing question
      const result = await updateQuestion(editingQuestionId, {
        ...questionData,
        global: questionData.global === 'true' ? 'true' : 'false',
        clientId: questionData.global === 'true' ? undefined : questionData.clientId ?? undefined
      });
      if (result.isSuccess) {
        setQuestions(questions.map(q => q.id === editingQuestionId ? { ...q, ...questionData } : q));
        setEditingQuestionId(null);
        toast({
          title: "Success",
          description: "Question updated successfully",
          variant: "default",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update question",
          variant: "destructive",
        });
      }
      setIsEditDialogOpen(false);
    } else {
      // Create new question
      const result = await createQuestion(
        questionData.questionText!,
        questionData.questionType as QuestionType,
        questionData.questionTheme as QuestionTheme,
        questionData.global === 'true',
        questionData.global === 'true' ? undefined : questionData.clientId ?? undefined,
        questionData.options
      );

      if (result.isSuccess && result.data) {
        setQuestions([...questions, { ...questionData, id: result.data.id }]);
        toast({
          title: "Success",
          description: "Question added successfully",
          variant: "default",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to add question",
          variant: "destructive",
        });
      }
    }

    resetForm();
  };

  const resetForm = () => {
    setQuestion({
      questionType: 'multiple_choice',
      questionTheme: 'competition',
      global: 'true',
    });
    setOptions([""]);
    setEditingQuestionId(null);
  };

  const handleEdit = (q: any) => {
    setQuestion({
      questionType: q.questionType,
      questionTheme: q.questionTheme,
      global: q.global,
      questionText: q.questionText,
    });
    setOptions(q.options || [""]);
    setEditingQuestionId(q.id);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const result = await deleteQuestion(id);
    if (result.isSuccess) {
      setQuestions(questions.filter(q => q.id !== id));
      toast({
        title: "Success",
        description: "Question deleted successfully",
        variant: "default",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to delete question",
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    resetForm();
    setIsEditDialogOpen(false);
  };

  return (
    <div className="container mx-auto p-4">
      <Tabs defaultValue="view" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="add">Add Question</TabsTrigger>
          <TabsTrigger value="view">View Questions</TabsTrigger>
        </TabsList>
        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>Add New Question</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="questionType">Question Type</Label>
                    <Select
                      value={question.questionType}
                      onValueChange={(value: QuestionType) => setQuestion({ ...question, questionType: value })}
                    >
                      <SelectTrigger className="w-64">
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
                      onValueChange={(value: QuestionTheme) => setQuestion({ ...question, questionTheme: value })}
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
                </div>
                <div className="space-y-2">
                  <Label htmlFor="questionText">Question</Label>
                  <Textarea
                    id="questionText"
                    value={question.questionText || ''}
                    onChange={(e) => setQuestion({ ...question, questionText: e.target.value })}
                    placeholder="Enter your question"
                    required
                    className="min-h-[100px]"
                  />
                </div>
                {(question.questionType === "multiple_choice" || question.questionType === "drop_down") && (
                  <div className="space-y-2">
                    <Label>Options</Label>
                    <div className="space-y-2">
                      <Label htmlFor="bulkOptions">Bulk Add Options (one per line)</Label>
                      <Textarea
                        id="bulkOptions"
                        value={bulkOptions}
                        onChange={handleBulkOptionsChange}
                        placeholder="Enter options, one per line"
                        className="min-h-[100px]"
                      />
                      <Button type="button" onClick={handleBulkOptionsSubmit} className="w-full">
                        Add Bulk Options
                      </Button>
                    </div>
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
                <div className="space-y-2">
                  <Label htmlFor="global">Global Question</Label>
                  <div className="flex items-center space-x-2">
                    <span>Global</span>
                    <Switch
                      id="global"
                      checked={question.global === 'true'}
                      onCheckedChange={(checked) => setQuestion({ ...question, global: checked ? 'true' : 'false' })}
                    />
                  </div>
                </div>
                {question.global === 'false' && (
                  <div className="space-y-2">
                    <Label htmlFor="clientId">Client</Label>
                    <Select
                      value={question.clientId ?? undefined}
                      onValueChange={(value) => setQuestion({ ...question, clientId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="flex justify-end space-x-2">
                  <Button type="submit">
                    {editingQuestionId ? 'Update Question' : 'Add Question'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="view">
          <Card>
            <CardHeader>
              <CardTitle>Existing Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                {questions.map((q) => (
                  <Card key={q.id} className="mb-4">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-semibold">{q.questionText}</h3>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <Badge>{q.questionType}</Badge>
                            <Badge variant="outline">{q.questionTheme}</Badge>
                            <Badge variant="secondary">{q.global === 'true' ? 'Global' : 'Client-specific'}</Badge>
                            {q.global === 'false' && q.clientName && (
                              <Badge variant="secondary">Client: {q.clientName}</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button onClick={() => handleEdit(q)} size="sm" variant="outline">
                            <PencilIcon className="h-4 w-4 mr-1" /> Edit
                          </Button>
                          <Button onClick={() => handleDelete(q.id)} size="sm" variant="destructive">
                            <TrashIcon className="h-4 w-4 mr-1" /> Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="questionType">Question Type</Label>
                <Select
                  value={question.questionType}
                  onValueChange={(value: QuestionType) => setQuestion({ ...question, questionType: value })}
                >
                  <SelectTrigger className="w-64">
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
                  onValueChange={(value: QuestionTheme) => setQuestion({ ...question, questionTheme: value })}
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="questionText">Question</Label>
              <Textarea
                id="questionText"
                value={question.questionText || ''}
                onChange={(e) => setQuestion({ ...question, questionText: e.target.value })}
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
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={handleCancelEdit}>
                Cancel
              </Button>
              <Button type="submit">
                Update Question
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}