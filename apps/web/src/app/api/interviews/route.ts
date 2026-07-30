import { NextResponse } from 'next/server'
import { requireAuth } from '@/dal/auth'
import { prisma } from '@repo/db'

export async function GET(req: Request) {
  try {
    const user = await requireAuth()
    const interviews = await prisma.interviewRecord.findMany({
      where: { application: { userId: user.id } },
      include: { application: { include: { job: true } } },
      orderBy: { scheduledAt: 'asc' }
    })
    return NextResponse.json(interviews)
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    
    const { applicationId, scheduledAt, type, round } = body
    
    const app = await prisma.application.findFirst({
      where: { id: applicationId, userId: user.id }
    })
    if (!app) return new NextResponse('Application not found', { status: 404 })

    const interview = await prisma.interviewRecord.create({
      data: {
        applicationId,
        scheduledAt: new Date(scheduledAt),
        type,
        round
      }
    })
    return NextResponse.json(interview)
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 })
  }
}
