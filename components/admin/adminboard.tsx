"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { AddClientForm } from "./AddClientForm"
import { QuestionManager } from "./QuestionManager"
import { TemplateManager } from "./TemplateManager"
import { UserAssignment } from "./UserAssignment"
import { FeedbackFormManager } from "./FeedbackFormManager"
import { MoonIcon, SunIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@clerk/nextjs"



export default function AdminBoard() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const { userId } = useAuth()

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle("dark")
  }

  if (!userId) {
    return <div>Loading...</div>
  }

  return (
    <div className={`min-h-screen bg-background ${isDarkMode ? "dark" : ""}`}>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
            {isDarkMode ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6" />}
          </Button>
        </div>
        <Card className="mb-6">
          <CardContent className="p-6">
            <Tabs defaultValue="clients" className="space-y-4">
              <TabsList className="grid w-full grid-cols-5 gap-4">
                <TabsTrigger value="clients">Clients</TabsTrigger>
                <TabsTrigger value="questions">Questions</TabsTrigger>
                <TabsTrigger value="templates">Templates</TabsTrigger>
                <TabsTrigger value="assignments">Assignments</TabsTrigger>
                <TabsTrigger value="feedback-forms">Feedback Forms</TabsTrigger>
              </TabsList>
              <TabsContent value="clients" className="p-4 bg-card rounded-md">
                <h2 className="text-2xl font-semibold mb-4">Manage Clients</h2>
                <AddClientForm  />
              </TabsContent>
              <TabsContent value="questions" className="p-4 bg-card rounded-md">
                <h2 className="text-2xl font-semibold mb-4">Manage Questions</h2>
                <QuestionManager />
              </TabsContent>
              <TabsContent value="templates" className="p-4 bg-card rounded-md">
                <h2 className="text-2xl font-semibold mb-4">Manage Templates</h2>
                <TemplateManager />
              </TabsContent>
              <TabsContent value="assignments" className="p-4 bg-card rounded-md">
                <h2 className="text-2xl font-semibold mb-4">User Assignments</h2>
                <UserAssignment />
              </TabsContent>
              <TabsContent value="feedback-forms" className="p-4 bg-card rounded-md">
                <h2 className="text-2xl font-semibold mb-4">Manage Feedback Forms</h2>
                <FeedbackFormManager />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
