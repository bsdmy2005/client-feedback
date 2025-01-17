"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Message } from "@/db/schema/adhoc-feedback-schema"
import { continueAdhocFeedback, submitAdhocFeedback } from "@/actions/adhoc-feedback-actions"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { getAllClientsAction } from "@/actions/clients-actions"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function AdhocFeedbackChat() {
  const [conversation, setConversation] = useState<Message[]>([])
  const [userInput, setUserInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [clients, setClients] = useState<{id: string, name: string}[]>([])
  const [selectedClient, setSelectedClient] = useState<string | null>(null)
  const [selectedThemes, setSelectedThemes] = useState<string[]>([])
  const { toast } = useToast()

  useEffect(() => {
    async function fetchClients() {
      const result = await getAllClientsAction()
      if (result.isSuccess && result.data) {
        setClients(result.data)
      }
    }
    fetchClients()
  }, [])

  const feedbackThemes = useMemo(() => [
    {
      id: "blockers",
      name: "Blockers",
      question: "Were there any obstacles that impeded your progress over the past two weeks?",
      clarifications: [
        "How did these blockers affect your work and project timelines?",
        "Have you identified any potential solutions or support needed to overcome these challenges?",
        "Is there anything we can do to help mitigate these issues in the future?"
      ]
    },
    {
      id: "wins",
      name: "Celebrating Wins",
      question: "Let's talk about your accomplishments. What successes or milestones are you proud of from the past two weeks?",
      clarifications: [
        "How did these achievements impact your team or the client?",
        "Were there any key learnings or best practices you discovered?",
        "How can we recognize or build upon these successes moving forward?"
      ]
    },
    {
      id: "clientInsights",
      name: "Client Insights",
      question: "We'd love to hear your observations about the client environment. Please share any insights you have on the following areas:",
      clarifications: [
        "Have there been any new hires, departures, or changes in the management structure within the client team?",
        "What are your observations about how our team is perceived by the client?",
        "Do you have any insights into the general job satisfaction levels among client employees?",
        "Have there been any conflicts or collaborations with external teams or businesses that stand out?",
        "Have you received any feedback on your performance from the client manager, colleagues, or business stakeholders?"
      ]
    },
    {
      id: "utilization",
      name: "Utilization Levels",
      question: "In your current role, do you feel: over-utilized, fairly utilized, or under-utilized?",
      clarifications: [
        "Can you share more about why you feel this way?",
        "How does your current workload impact your productivity and job satisfaction?",
        "What adjustments, if any, would you suggest to optimize your utilization?"
      ]
    },
    {
      id: "opportunities",
      name: "New Opportunities",
      question: "Are there any new opportunities within the client organization that you believe we should explore?",
      clarifications: [
        "Could you provide details about these opportunities and how they align with our services?",
        "Who are the key stakeholders involved, and what are the potential benefits?",
        "How do you suggest we approach these opportunities?"
      ]
    },
    {
      id: "satisfaction",
      name: "Role/Job Satisfaction",
      question: "How are you finding your current role? We'd appreciate your honest feedback.",
      clarifications: [
        "What aspects of your role do you enjoy the most?",
        "Are there any challenges or areas where you'd like additional support?",
        "How do you see your career progressing within our company?"
      ]
    },
    {
      id: "internalIncidents",
      name: "Internal Incidents (ES Incidents)",
      question: "Are there any incidents or issues caused by our team that we need to be aware of?",
      clarifications: [
        "What were the circumstances surrounding these incidents?",
        "How have they impacted your work or the client's perception?",
        "What steps do you recommend we take to address these issues?"
      ]
    },
    {
      id: "externalIncidents",
      name: "External Incidents",
      question: "Have there been any major incidents external to our team that we should be informed about?",
      clarifications: [
        "How might these incidents affect our projects or collaboration with the client?",
        "Are there any risks we should anticipate and prepare for?",
        "What support might you need to navigate these situations?"
      ]
    }
  ], [])

  const welcomeMessage = useMemo(() => (
    <>
      <p className="mb-4">
        This platform is designed to collect real-time feedback that helps us act quicker and make better decisions. Your feedback is confidential and crucial for our collective success. The management team regularly reviews these insights to make informed decisions and provide better support.
      </p>
      <p className="font-semibold mb-2">To get started:</p>
      <ol className="list-decimal pl-5 mb-4">
        <li>Select the client you&apos;re working with from the dropdown below.</li>
        <li>In the chat, you&apos;ll be able to choose feedback themes to discuss.</li>
        <li>Answer the specific questions provided for each theme.</li>
      </ol>
      <p className="font-semibold">
        Thank you for your commitment to our continuous improvement. Let&apos;s begin!
      </p>
    </>
  ), [])

  const handleClientSelect = useCallback((clientId: string) => {
    setSelectedClient(clientId)
  }, [])

  const handleThemeSelect = useCallback((themeId: string) => {
    const theme = feedbackThemes.find(t => t.id === themeId)
    if (theme) {
      const themeChangeMessage: Message = { role: 'system', content: `Theme changed to: ${theme.name}` }
      const promptMessage: Message = { role: 'assistant', content: theme.question }
      const newConversation = [...conversation, themeChangeMessage, promptMessage]

      // Add clarification questions
      theme.clarifications.forEach(clarification => {
        newConversation.push({ role: 'assistant', content: clarification })
      })

      setConversation(newConversation)

      // Persist the initial conversation to the database
      if (selectedClient) {
        submitAdhocFeedback(selectedClient, newConversation)
          .catch(error => {
            console.error("Failed to save initial conversation:", error)
            toast({
              title: "Error",
              description: "Failed to save the conversation",
              variant: "destructive",
            })
          })
      }
    }
  }, [feedbackThemes, conversation, selectedClient, toast])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedClient) {
      toast({
        title: "Error",
        description: "Please select a client before submitting",
        variant: "destructive",
      })
      return
    }
    if (!userInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive",
      })
      return
    }

    const newMessage: Message = { role: 'user', content: userInput }
    const updatedConversation = [...conversation, newMessage]
    setConversation(updatedConversation)
    setUserInput("")
    setIsLoading(true)

    try {
      const result = await continueAdhocFeedback(selectedClient, updatedConversation)

      setIsLoading(false)
      if (result.isSuccess && result.data) {
        setConversation(result.data)
      } else {
        throw new Error(result.message || "Failed to continue conversation")
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }, [selectedClient, userInput, conversation, toast])

  const handleEndConversation = useCallback(() => {
    setConversation([])
    setSelectedClient(null)
    setUserInput("")
    toast({
      title: "Conversation Ended",
      description: "Thank you for your feedback!",
    })
  }, [toast])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserInput(e.target.value)
  }, [])

  const WelcomeSection = useMemo(() => (
    <div className="p-4 rounded bg-blue-50 border border-blue-200">
      <h2 className="text-2xl font-bold mb-4">Welcome to our Adhoc Feedback Chat!</h2>
      <div className="space-y-4 mb-6">
        {welcomeMessage}
      </div>
      <Select onValueChange={handleClientSelect} value={selectedClient || undefined}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a client" />
        </SelectTrigger>
        <SelectContent>
          {clients.map((client) => (
            <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  ), [clients, selectedClient, handleClientSelect, welcomeMessage])

  const ChatSection = useMemo(() => (
    <div className="flex h-full">
      <div className="w-1/4 p-4 border-r">
        <p className="font-semibold mb-2">Selected Client:</p>
        <p className="mb-4">{clients.find(c => c.id === selectedClient)?.name}</p>
        
        <p className="font-semibold mb-2">Select a Theme:</p>
        <div className="flex flex-wrap gap-2 mb-4">
          <TooltipProvider>
            {feedbackThemes.map((theme) => (
              <Tooltip key={theme.id}>
                <TooltipTrigger>
                  <Badge
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => handleThemeSelect(theme.id)}
                  >
                    {theme.name}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p><strong>{theme.question}</strong></p>
                  <ul className="list-disc pl-4 mt-2">
                    {theme.clarifications.map((clarification, index) => (
                      <li key={index}>{clarification}</li>
                    ))}
                  </ul>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
      </div>
      <div className="w-3/4 flex flex-col">
        <div className="flex-grow overflow-y-auto p-4 space-y-2">
          {conversation.map((message, index) => {
            if (message.role === 'system') {
              return (
                <div key={index} className="p-2 rounded bg-yellow-100 text-center">
                  <p><strong>{message.content}</strong></p>
                </div>
              )
            }
            return (
              <div key={index} className={`p-2 rounded ${message.role === 'user' ? 'bg-blue-100 ml-auto' : 'bg-green-100'} max-w-[80%]`}>
                <p><strong>{message.role === 'user' ? 'You' : 'AI'}:</strong> {message.content}</p>
              </div>
            )
          })}
          {isLoading && (
            <div className="p-2 rounded bg-gray-100">
              <p>AI is typing...</p>
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="p-4 border-t flex space-x-2">
          <Textarea 
            value={userInput}
            onChange={handleInputChange}
            placeholder="Type your message here..."
            className="flex-grow"
            rows={2}
          />
          <Button type="submit" disabled={isLoading || !selectedClient}>Send</Button>
          <Button type="button" variant="destructive" onClick={handleEndConversation}>End Conversation</Button>
        </form>
      </div>
    </div>
  ), [clients, selectedClient, conversation, isLoading, userInput, handleSubmit, handleEndConversation, handleInputChange, feedbackThemes, handleThemeSelect])

  return (
    <div className="h-[calc(100vh-200px)]">
      {!selectedClient ? WelcomeSection : ChatSection}
    </div>
  )
}
