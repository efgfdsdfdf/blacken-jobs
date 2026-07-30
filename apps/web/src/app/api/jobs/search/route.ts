import { NextResponse } from 'next/server'
import { requireAuth } from '@/dal/auth'
import { prisma } from '@repo/db'
import { anthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'

export async function POST(req: Request) {
  try {
    const user = await requireAuth()
    const { query, location, locationType, salaryMin } = await req.json()

    const careerProfile = await prisma.careerProfile.findUnique({
      where: { userId: user.id }
    })

    const prompt = `Generate 5-10 realistic mock job postings for the following search:
Query: ${query}
Location: ${location || 'Any'}
Location Type: ${locationType || 'Any'}
Min Salary: ${salaryMin || 'Any'}

User Profile: ${JSON.stringify(careerProfile)}

Return a JSON array of objects with keys: title, company, description, requirements, salary, location, locationType, source, matchScore (0-100), and matchAnalysis (string explaining the score). Only return the raw JSON array.`

    const { text } = await generateText({
      model: anthropic('claude-sonnet-4-5-20250929'),
      prompt,
    })

    const rawJson = text.replace(/^```(json)?/, '').replace(/```$/, '').trim()
    let mockJobs = []
    try {
      mockJobs = JSON.parse(rawJson)
    } catch (e) {
      console.error('Failed to parse mock jobs from AI:', e)
    }

    return NextResponse.json(mockJobs)
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 })
  }
}
