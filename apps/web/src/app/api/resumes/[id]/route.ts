import { NextResponse } from 'next/server'
import { requireAuth } from '@/dal/auth'
import { prisma } from '@repo/db'
import { anthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth()
    const resume = await prisma.resume.findFirst({
      where: { id: params.id, userId: user.id }
    })
    if (!resume) return new NextResponse('Not found', { status: 404 })
    return NextResponse.json(resume)
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    
    const existing = await prisma.resume.findFirst({
      where: { id: params.id, userId: user.id }
    })
    if (!existing) return new NextResponse('Not found', { status: 404 })

    const data: any = { ...body }

    if (body.content && body.content !== existing.content) {
      const prompt = `Parse this resume and evaluate it for ATS readiness.
Resume: ${body.content}
Return a JSON object with keys: atsScore (0-100), parsedData (object with skills, experience, education).`

      try {
        const { text } = await generateText({
          model: anthropic('claude-sonnet-4-5-20250929'),
          prompt,
        })
        const rawJson = text.replace(/^```(json)?/, '').replace(/```$/, '').trim()
        const parsed = JSON.parse(rawJson)
        data.atsScore = parsed.atsScore || existing.atsScore
        data.parsedData = parsed.parsedData || existing.parsedData
      } catch (e) {
        console.error('AI parsing failed', e)
      }
    }

    const resume = await prisma.resume.update({
      where: { id: params.id },
      data
    })
    return NextResponse.json(resume)
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth()
    const existing = await prisma.resume.findFirst({
      where: { id: params.id, userId: user.id }
    })
    if (!existing) return new NextResponse('Not found', { status: 404 })

    await prisma.resume.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 })
  }
}
