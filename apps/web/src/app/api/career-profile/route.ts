import { NextResponse } from 'next/server'
import { requireAuth } from '@/dal/auth'
import { prisma } from '@repo/db'

export async function GET(req: Request) {
  try {
    const user = await requireAuth()
    const profile = await prisma.careerProfile.findUnique({
      where: { userId: user.id }
    })
    return NextResponse.json(profile)
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    const profile = await prisma.careerProfile.create({
      data: { ...body, userId: user.id }
    })
    return NextResponse.json(profile)
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    const profile = await prisma.careerProfile.update({
      where: { userId: user.id },
      data: body
    })
    return NextResponse.json(profile)
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 })
  }
}
