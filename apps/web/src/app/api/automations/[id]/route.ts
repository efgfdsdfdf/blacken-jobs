import { NextResponse } from 'next/server'
import { requireAuth } from '@/dal/auth'
import { prisma } from '@repo/db'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth()
    const automation = await prisma.automation.findFirst({
      where: { id: params.id, userId: user.id }
    })
    if (!automation) return new NextResponse('Not found', { status: 404 })
    return NextResponse.json(automation)
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    
    const existing = await prisma.automation.findFirst({
      where: { id: params.id, userId: user.id }
    })
    if (!existing) return new NextResponse('Not found', { status: 404 })

    const automation = await prisma.automation.update({
      where: { id: params.id },
      data: body
    })
    return NextResponse.json(automation)
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth()
    const existing = await prisma.automation.findFirst({
      where: { id: params.id, userId: user.id }
    })
    if (!existing) return new NextResponse('Not found', { status: 404 })

    await prisma.automation.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 })
  }
}
