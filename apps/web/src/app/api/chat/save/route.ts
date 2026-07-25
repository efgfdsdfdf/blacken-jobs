import { NextResponse } from "next/server"
import { requireAuth } from "@/dal/auth"
import { prisma } from "@repo/db"

export async function POST(req: Request) {
  try {
    const session = await requireAuth()
    const { chatId, message } = await req.json()

    if (!chatId || !message || !message.content) {
      return new NextResponse("Invalid payload", { status: 400 })
    }

    // Verify chat ownership
    const chat = await prisma.chat.findUnique({
      where: { id: chatId }
    })

    if (!chat || chat.userId !== session.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Check if the message already exists to avoid duplicates
    const existingMsg = await prisma.message.findFirst({
      where: {
        chatId: chatId,
        content: message.content,
        role: "ASSISTANT"
      }
    })

    if (existingMsg) {
      return new NextResponse("Message already saved", { status: 200 })
    }

    await prisma.message.create({
      data: {
        chatId: chatId,
        role: "ASSISTANT",
        content: message.content
      }
    })

    return new NextResponse("Saved successfully", { status: 200 })
  } catch (error: any) {
    console.error("Save message error:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
