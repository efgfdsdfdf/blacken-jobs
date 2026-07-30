import { NextResponse } from 'next/server'
import { requireAuth } from '@/dal/auth'
import { prisma } from '@repo/db'
import { anthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'

export async function GET(req: Request) {
  try {
    const user = await requireAuth()
    const resumes = await prisma.resume.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(resumes)
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    const { name, content, fileUrl, isBase } = body

    let atsScore = 0
    let parsedData = {}
    
    if (content) {
      const prompt = `Parse this resume and evaluate it for ATS readiness.
Resume: ${content}
Return a JSON object with keys: atsScore (0-100), parsedData (object with skills, experience, education).`

      try {
        const { text } = await generateText({
          model: anthropic('claude-sonnet-4-5-20250929'),
          prompt,
        })
        const rawJson = text.replace(/^```(json)?/, '').replace(/```$/, '').trim()
        const parsed = JSON.parse(rawJson)
        atsScore = parsed.atsScore || 0
        parsedData = parsed.parsedData || {}
      } catch (e) {
        console.error('AI parsing failed', e)
      }
    }

    const resume = await prisma.resume.create({
      data: {
        userId: user.id,
        name,
        content,
        fileUrl,
        isBase: isBase || false,
        atsScore,
        parsedData
      }
    })
    return NextResponse.json(resume)
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 })
  }
}
