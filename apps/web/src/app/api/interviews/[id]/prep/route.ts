import { NextResponse } from "next/server"
import { requireAuth } from "@/dal/auth"
import { prisma } from "@repo/db"
import { generateInterviewPrep } from "@/lib/ai/interview-coach"
import { anthropic } from "@ai-sdk/anthropic"
import { generateText } from "ai"
import { Resend } from "resend"

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

    // If prep report doesn't exist or mock questions are empty, generate it
    const hasQuestions = Array.isArray(interview.mockQuestions) && (interview.mockQuestions as string[]).length > 0;
    if (!interview.prepReport || !interview.mockQuestions || !hasQuestions) {
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

    // Create a real DB notification for the user
    await prisma.notification.create({
      data: {
        userId: session.id,
        title: "Interview Practice Scored",
        message: `Practice session for ${interview.application.job.company} scored: ${evaluation.overallScore}%. Feedback sent to email!`,
        type: "SUCCESS",
        link: `/interviews/${id}/prep`
      }
    }).catch(err => console.error("Failed to create database notification:", err))

    // Send feedback email using Resend
    if (process.env.RESEND_API_KEY && session.email) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY)
        await resend.emails.send({
          from: "Blacken AI Interview Coach <onboarding@resend.dev>",
          to: [session.email],
          subject: `📊 Mock Interview Feedback: ${interview.application.job.company} - ${interview.application.job.title}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #18181b;">
              <h2 style="color: #8b5cf6;">Interview Preparation Evaluation</h2>
              <p>Hello,</p>
              <p>You have successfully completed your mock practice interview for the <strong>${interview.application.job.title}</strong> role at <strong>${interview.application.job.company}</strong>.</p>
              
              <div style="background-color: #f4f4f5; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e4e4e7;">
                <p style="margin: 0; font-size: 14px; text-transform: uppercase; color: #71717a;">Overall Score</p>
                <h1 style="margin: 5px 0 10px 0; color: #8b5cf6; font-size: 48px;">${evaluation.overallScore}%</h1>
                <p style="margin: 0; font-size: 15px; line-height: 1.5;">${evaluation.generalFeedback}</p>
              </div>

              <h3>Question by Question Feedback:</h3>
              ${evaluation.evaluations?.map((ev: any, idx: number) => `
                <div style="margin-bottom: 25px; padding-bottom: 20px; border-bottom: 1px solid #e4e4e7;">
                  <p><strong>Q${idx + 1}: ${ev.question}</strong></p>
                  <p style="font-size: 14px; color: #71717a; margin-top: 5px;"><em>Your Answer: "${answers[idx]?.answer || "No response provided."}"</em></p>
                  <p style="font-size: 14px; margin-top: 5px;"><strong>Score:</strong> ${ev.score}%</p>
                  <p style="font-size: 14px; margin-top: 5px;"><strong>AI Feedback:</strong> ${ev.feedback}</p>
                  ${ev.modelAnswer ? `
                    <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 10px 15px; margin-top: 10px; border-radius: 4px;">
                      <p style="margin: 0; font-size: 13px; color: #065f46; font-weight: bold;">Ideal Answer:</p>
                      <p style="margin: 5px 0 0 0; font-size: 13px; color: #047857;">${ev.modelAnswer}</p>
                    </div>
                  ` : ''}
                </div>
              `).join('')}

              <p style="font-size: 12px; color: #a1a1aa; margin-top: 40px; border-top: 1px solid #e4e4e7; padding-top: 20px;">
                This email was auto-generated by the Blacken AI Interview Coach.
              </p>
            </div>
          `
        })
      } catch (err) {
        console.error("Failed to send interview feedback email:", err)
      }
    }

    return NextResponse.json(evaluation)
  } catch (error: any) {
    console.error("Prep evaluation error:", error)
    return new NextResponse(error.message, { status: 500 })
  }
}
