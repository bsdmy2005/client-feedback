"use server"

import { db } from "@/db/db"
import { adhocFeedbackTable, AdhocFeedback, AdhocFeedbackWithClientName, Message } from "@/db/schema/adhoc-feedback-schema"
import { ActionResult } from "@/types/actions/actions-types"
import { auth } from "@clerk/nextjs/server"
import { eq, and, desc } from "drizzle-orm"
import { clientsTable } from "@/db/schema/clients-schema"
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

async function getAIResponse(conversation: Message[]): Promise<string> {
  const systemMessage = `You are an AI chatbot designed to collect ad hoc feedback from consultants working at a technology consulting company. Your goal is to engage consultants in focused conversations about specific themes. Be friendly, professional, and empathetic, but keep the conversation strictly related to the selected theme and use only the provided clarification questions. Do not ask open-ended questions outside of the given set. Maintain confidentiality and ensure the consultant feels safe sharing their thoughts.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: systemMessage },
      ...conversation,
      { role: "system", content: "Respond to the user's input and ask one or more of the provided clarification questions if appropriate. Keep the conversation focused on the selected theme." }
    ],
    max_tokens: 150
  });

  return completion.choices[0].message.content || "Thank you for your feedback.";
}

export async function submitAdhocFeedback(clientId: string | null, initialMessage: Message[]): Promise<ActionResult<Message[]>> {
  try {
    const { userId } = auth()
    if (!userId) {
      return { isSuccess: false, message: "User not authenticated" }
    }

    const aiResponse = await getAIResponse(initialMessage)
    const conversation = [...initialMessage, { role: 'assistant', content: aiResponse }]

    await db.insert(adhocFeedbackTable).values({
      userId,
      clientId: clientId || null,
      conversation,
    })

    return { isSuccess: true, data: conversation as Message[], message: "Feedback submitted successfully" }
  } catch (error) {
    console.error("Failed to submit adhoc feedback:", error)
    return { isSuccess: false, message: "Failed to submit feedback" }
  }
}

export async function continueAdhocFeedback(clientId: string | null, updatedConversation: Message[]): Promise<ActionResult<Message[]>> {
  try {
    const { userId } = auth()
    if (!userId) {
      return { isSuccess: false, message: "User not authenticated" }
    }

    const aiResponse = await getAIResponse(updatedConversation)
    const newConversation = [...updatedConversation, { role: 'assistant', content: aiResponse }]

    await db.update(adhocFeedbackTable)
      .set({ conversation: newConversation, updatedAt: new Date() })
      .where(and(
        eq(adhocFeedbackTable.userId, userId),
        clientId ? eq(adhocFeedbackTable.clientId, clientId) : undefined
      ))

    return { isSuccess: true, data: newConversation as Message[], message: "Feedback updated successfully" }
  } catch (error) {
    console.error("Failed to update adhoc feedback:", error)
    return { isSuccess: false, message: "Failed to update feedback" }
  }
}

export async function getAdhocFeedbackByUserId(userId: string): Promise<ActionResult<AdhocFeedbackWithClientName[]>> {
  try {
    const feedback = await db.select({
      id: adhocFeedbackTable.id,
      clientName: clientsTable.name,
      conversation: adhocFeedbackTable.conversation,
      createdAt: adhocFeedbackTable.createdAt,
      updatedAt: adhocFeedbackTable.updatedAt,
    })
    .from(adhocFeedbackTable)
    .innerJoin(clientsTable, eq(adhocFeedbackTable.clientId, clientsTable.clientId))
    .where(eq(adhocFeedbackTable.userId, userId))
    .orderBy(desc(adhocFeedbackTable.updatedAt))

    return { isSuccess: true, data: feedback as AdhocFeedbackWithClientName[], message: "Adhoc feedback retrieved successfully" }
  } catch (error) {
    console.error("Failed to retrieve adhoc feedback:", error)
    return { isSuccess: false, message: "Failed to retrieve adhoc feedback" }
  }
}
