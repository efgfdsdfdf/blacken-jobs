import { createClient } from "@/lib/supabase/server"
import { prisma } from "@repo/db"
import { anthropic } from "@ai-sdk/anthropic"
import { streamText } from "ai"
import { NextResponse } from "next/server"

export const maxDuration = 60 // Allow up to 60 seconds for AI response

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return new Response("Unauthorized", { status: 401 })
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
CRITICAL: You MUST be extremely proactive. If the user just says "hello" or provides vague instructions, immediately ask them what they want to build today. Proactively collect specific details about the features, UI style, and requirements before writing code.

CRITICAL ARCHITECTURAL REQUIREMENT:
When the user asks you to build or write code for a project, you MUST NOT output standard markdown code blocks (e.g. \`\`\`tsx).
Instead, you MUST package all the code and files into a single, specialized JSON payload inside a \`\`\`project_files\`\`\` block. 
Format it EXACTLY like this:
\`\`\`project_files
[
  { "path": "src/index.js", "content": "console.log('hello');" },
  { "path": "package.json", "content": "{ \\"name\\": \\"app\\" }" }
]
\`\`\`
Outside of this block, explain the specs, what they should expect in the downloaded ZIP, and setup instructions. Do not show the code outside the \`\`\`project_files\`\`\` block.
Be concise, brilliant, and extremely helpful.`

    // Map to strictly CoreMessage shape
    const coreMessages = messages.map((m: any) => ({
      role: m.role as "user" | "assistant" | "system",
      content: m.content
    }))

    // Start streaming from Anthropic
    const result = streamText({
      model: anthropic("claude-sonnet-4-5-20250929"),
      system: systemPrompt,
      messages: coreMessages,
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
          
          // Generate a smart topic title in the background if this is the first turn
          if (messages.length === 1) {
            import("ai").then(async ({ generateText }) => {
              try {
                const { text: topicTitle } = await generateText({
                  model: anthropic("claude-3-5-haiku-20241022"),
                  prompt: `Based on this initial request and response, generate a concise 2-5 word topic title for this chat. Do not use quotes, punctuation, or prefixes like "Title:". Just output the title.\nUser: ${messages[0].content}\nAssistant: ${text.substring(0, 500)}`
                })
                
                await prisma.chat.update({
                  where: { id: activeChatId },
                  data: { title: topicTitle.trim() }
                })
              } catch(e) {
                console.error("Failed to generate title", e)
              }
            })
          }
        } catch (dbError) {
          console.error("Failed to save AI response to DB:", dbError)
        }
      }
    })

    return result.toTextStreamResponse({
      headers: {
        "x-chat-id": activeChatId
      }
    })

  } catch (error: any) {
    console.error("Chat API error:", error)
    return new Response(`Internal Server Error: ${error.message || error}`, { status: 500 })
  }
}
