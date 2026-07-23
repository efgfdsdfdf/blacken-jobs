import { createClient } from "@/lib/supabase/server"
import { prisma } from "@repo/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id }
    })

    if (!dbUser) {
      return new NextResponse("User not found", { status: 404 })
    }

    const chats = await prisma.chat.findMany({
      where: { userId: dbUser.id },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        updatedAt: true
      }
    })

    return NextResponse.json({ data: chats })
  } catch (error) {
    console.error("Failed to fetch chats:", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
