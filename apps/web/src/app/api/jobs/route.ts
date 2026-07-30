import { NextResponse } from 'next/server'
import { requireAuth } from '@/dal/auth'
import { prisma } from '@repo/db'

export async function GET(req: Request) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const locationType = searchParams.get('locationType')
    const source = searchParams.get('source')
    const minScore = searchParams.get('minScore')
    const search = searchParams.get('search')
    const skip = parseInt(searchParams.get('skip') || '0', 10)
    const take = parseInt(searchParams.get('take') || '20', 10)

    const where: any = { userId: user.id }
    if (status) where.status = status
    if (locationType) where.locationType = locationType
    if (source) where.source = source
    if (minScore) where.matchScore = { gte: parseFloat(minScore) }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
      ]
    }

    const jobs = await prisma.job.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(jobs)
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    const job = await prisma.job.create({
      data: { ...body, userId: user.id }
    })
    return NextResponse.json(job)
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 })
  }
}
