import { NextResponse } from 'next/server'
import { requireAuth } from '@/dal/auth'
import { prisma } from '@repo/db'

export async function GET(req: Request) {
  try {
    const user = await requireAuth()
    const automations = await prisma.automation.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(automations)
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    const { type, name, config, active } = body

    if (!type || !name || !config) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    const automation = await prisma.automation.create({
      data: {
        userId: user.id,
        type,
        name,
        config,
        status: active ? 'ACTIVE' : 'INACTIVE'
      }
    })
    return NextResponse.json(automation)
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 })
  }
}
