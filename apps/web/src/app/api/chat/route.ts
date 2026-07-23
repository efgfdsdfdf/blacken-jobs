import { createClient } from "@/lib/supabase/server"
import { prisma } from "@repo/db"
import { anthropic } from "@ai-sdk/anthropic"
import { streamText } from "ai"
import { NextResponse } from "next"

export const maxDuration = 60 // Allow up to 60 seconds for AI response

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Get the user ID from Prisma
    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id }
    })

    if (!dbUser) {
      return new NextResponse("User not found in database", { status: 404 })
    }

    const { messages, chatId } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return new NextResponse("Invalid messages array", { status: 400 })
    }

    // Determine the chat to use or create a new one
    let activeChatId = chatId
    
    if (!activeChatId || activeChatId === "new") {
      // Get the first user message for the title
      const firstUserMsg = messages.find((m: any) => m.role === "user")?.content || "New Chat"
      const title = firstUserMsg.slice(0, 50) + (firstUserMsg.length > 50 ? "..." : "")
      
      const newChat = await prisma.chat.create({
        data: {
          title,
          userId: dbUser.id
        }
      })
      activeChatId = newChat.id
    } else {
      // Verify chat exists and belongs to user
      const existingChat = await prisma.chat.findUnique({
        where: { id: activeChatId }
      })
      
      if (!existingChat || existingChat.userId !== dbUser.id) {
        return new NextResponse("Chat not found or unauthorized", { status: 404 })
      }
    }

    // Extract the latest user message
    const latestMessage = messages[messages.length - 1]

    // Save the latest user message to the DB
    if (latestMessage && latestMessage.role === "user") {
      await prisma.message.create({
        data: {
          chatId: activeChatId,
          role: "USER",
          content: latestMessage.content
        }
      })
    }

    const systemPrompt = `You are BLACK AI, an expert software engineer, UI/UX designer, and App Builder.
You are chatting with a user inside their dashboard. 
Your goal is to help them build React components, Next.js applications, and write production-ready code.
Always format your code beautifully using Markdown code blocks. Include comments explaining complex parts.
When designing UI, prefer Tailwind CSS classes.
Be concise, brilliant, and extremely helpful.`

    // Start streaming from Anthropic
    const result = streamText({
      model: anthropic("claude-3-5-sonnet-latest"),
      system: systemPrompt,
      messages,
      onFinish: async ({ text }) => {
        // Save the assistant's response to the DB when the stream finishes
        try {
          await prisma.message.create({
            data: {
              chatId: activeChatId,
              role: "ASSISTANT",
              content: text
            }
          })
        } catch (dbError) {
          console.error("Failed to save AI response to DB:", dbError)
        }
      }
    })

    // Return the streaming response along with the chatId in custom headers
    // so the client knows the generated chatId if a new one was created.
    return result.toDataStreamResponse({
      headers: {
        "x-chat-id": activeChatId
      }
    })

  } catch (error) {
    console.error("Chat API error:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
