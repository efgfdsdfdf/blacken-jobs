import { NextResponse } from 'next/server'
import { requireAuth } from '@/dal/auth'
import { prisma } from '@repo/db'

export async function GET(req: Request) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    
    const where: any = { userId: user.id }
    if (status) where.status = status

    const apps = await prisma.application.findMany({
      where,
      include: { job: true },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(apps)
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    const { jobId, status, method, tailoredResumeId } = body

    const app = await prisma.application.create({
      data: {
        userId: user.id,
        jobId,
        status: status || 'APPLIED',
        method,
        tailoredResumeId,
        statusHistory: {
          create: {
            status: status || 'APPLIED',
            notes: 'Application created'
          }
        }
      },
      include: { statusHistory: true }
    })
    return NextResponse.json(app)
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 })
  }
}
