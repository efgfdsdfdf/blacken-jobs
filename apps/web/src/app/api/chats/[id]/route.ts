import { NextResponse } from "next/server"
import { requireAuth } from "@/dal/auth"
import { prisma } from "@repo/db"

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const user = await requireAuth()
    
    // Resolve params explicitly to handle Next.js 15 async route segment params
    const resolvedParams = await Promise.resolve(params)
    const id = resolvedParams.id

    if (!id) {
      return new Response("Missing Chat ID", { status: 400 })
    }

    // Verify ownership and delete
    const chat = await prisma.chat.findUnique({
      where: { id }
    })

    if (!chat || chat.userId !== user.id) {
      return new Response("Unauthorized", { status: 401 })
    }

    await prisma.chat.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete chat:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
