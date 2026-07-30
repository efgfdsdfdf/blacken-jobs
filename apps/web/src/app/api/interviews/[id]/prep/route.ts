import { NextResponse } from "next/server"
import { requireAuth } from "@/dal/auth"
import { prisma } from "@repo/db"
import { generateInterviewPrep } from "@/lib/ai/interview-coach"
import { anthropic } from "@ai-sdk/anthropic"
import { generateText } from "ai"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    const { id } = await params

    const interview = await prisma.interviewRecord.findUnique({
      where: { id },
      include: { application: { include: { job: true } } }
    })

    if (!interview || interview.userId !== session.id) {
      return new NextResponse("Not Found", { status: 404 })
    }

    // If prep report doesn't exist, generate it
    if (!interview.prepReport || !interview.mockQuestions) {
      const careerProfile = await prisma.careerProfile.findUnique({
        where: { userId: session.id }
      })

      const prepData = await generateInterviewPrep(interview.application.job, careerProfile || {})

      const updated = await prisma.interviewRecord.update({
        where: { id },
        data: {
          prepReport: prepData.prepReport,
          mockQuestions: prepData.mockQuestions,
          companyResearch: prepData.companyResearch,
          technicalTopics: prepData.technicalTopics,
          suggestedQuestions: prepData.suggestedAnswers, // mapped to suggestedQuestions column
        }
      })

      return NextResponse.json(updated)
    }

    return NextResponse.json(interview)
  } catch (error: any) {
    console.error("Prep fetch error:", error)
    return new NextResponse(error.message, { status: 500 })
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    const { id } = await params
    const { answers } = await req.json() // Array of { question: string, answer: string }

    const interview = await prisma.interviewRecord.findUnique({
      where: { id },
      include: { application: { include: { job: true } } }
    })

    if (!interview || interview.userId !== session.id) {
      return new NextResponse("Not Found", { status: 404 })
    }

    const prompt = `Evaluate the candidate's answers for the job interview at ${interview.application.job.company} for the role of ${interview.application.job.title}.
Candidate answers:
${answers.map((a: any, i: number) => `Q${i+1}: ${a.question}\nAnswer: ${a.answer}`).join("\n\n")}

Evaluate each answer and return a JSON object with:
- overallScore: number (0-100)
- generalFeedback: string
- evaluations: array of objects, each with:
  - question: string
  - score: number (0-100)
  - feedback: string (what was good, what to improve)
  - modelAnswer: string (a perfect answer they should have given)
Only return raw JSON.`

    const { text } = await generateText({
      model: anthropic("claude-sonnet-4-5-20250929"),
      prompt
    })

    const rawJson = text.replace(/^```(json)?/, "").replace(/```$/, "").trim()
    const evaluation = JSON.parse(rawJson)

    // Save feedback to DB
    await prisma.interviewRecord.update({
      where: { id },
      data: {
        feedback: JSON.stringify(evaluation)
      }
    })

    return NextResponse.json(evaluation)
  } catch (error: any) {
    console.error("Prep evaluation error:", error)
    return new NextResponse(error.message, { status: 500 })
  }
}
