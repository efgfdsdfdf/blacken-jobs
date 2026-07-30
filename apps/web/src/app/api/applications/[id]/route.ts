import { NextResponse } from 'next/server'
import { requireAuth } from '@/dal/auth'
import { prisma } from '@repo/db'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth()
    const app = await prisma.application.findFirst({
      where: { id: params.id, userId: user.id },
      include: { statusHistory: true, interviewRecords: true, job: true }
    })
    if (!app) return new NextResponse('Not found', { status: 404 })
    return NextResponse.json(app)
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    
    const existing = await prisma.application.findFirst({
      where: { id: params.id, userId: user.id }
    })
    if (!existing) return new NextResponse('Not found', { status: 404 })

    const data: any = { ...body }
    
    if (body.status && body.status !== existing.status) {
      data.statusHistory = {
        create: {
          status: body.status,
          notes: body.statusNotes || `Status updated to ${body.status}`
        }
      }
      delete data.statusNotes
    }

    const app = await prisma.application.update({
      where: { id: params.id },
      data,
      include: { statusHistory: true }
    })
    return NextResponse.json(app)
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth()
    const existing = await prisma.application.findFirst({
      where: { id: params.id, userId: user.id }
    })
    if (!existing) return new NextResponse('Not found', { status: 404 })

    await prisma.application.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 })
  }
}
