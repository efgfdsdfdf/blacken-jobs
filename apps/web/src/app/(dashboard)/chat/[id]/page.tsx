import { requireAuth } from "@/dal/auth"
import { ChatInterface } from "@/features/chat/components/chat-interface"
import { prisma } from "@repo/db"
import { notFound } from "next/navigation"

export default async function ActiveChatPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth()
  const resolvedParams = await params
  
  if (resolvedParams.id === "new") {
    return <ChatInterface chatId="new" />
  }
  
  // Fetch initial history
  const chat = await prisma.chat.findUnique({
    where: { id: resolvedParams.id, userId: session.id },
    include: {
      messages: {
        orderBy: { createdAt: "asc" }
      }
    }
  })

  if (!chat) {
    notFound()
  }

  // Map to frontend message format for Vercel AI SDK
  const initialMessages = chat.messages.map(msg => ({
    id: msg.id,
    role: msg.role.toLowerCase() as "user" | "assistant" | "system",
    content: msg.content
  }))

  return <ChatInterface key={chat.id} chatId={chat.id} initialMessages={initialMessages} />
}
