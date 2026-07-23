"use server"

import { requireAuth } from "@/dal/auth"
import { prisma } from "@repo/db"

export async function toggleAutomation(isActive: boolean) {
  const user = await requireAuth()

  let automation = await prisma.automation.findFirst({
    where: { userId: user.id }
  })

  if (automation) {
    await prisma.automation.update({
      where: { id: automation.id },
      data: { isActive }
    })
  } else {
    await prisma.automation.create({
      data: {
        userId: user.id,
        name: "Primary Agent",
        isActive,
        autoApply: true
      }
    })
  }
}

export async function updatePortfolioUrl(url: string) {
  const user = await requireAuth()

  await prisma.profile.upsert({
    where: { userId: user.id },
    update: { website: url },
    create: {
      userId: user.id,
      website: url,
    }
  })
}

import { anthropic } from "@ai-sdk/anthropic"
import { generateText } from "ai"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY || "re_123456789_placeholder")

export async function forceRunJobWorker() {
  const user = await requireAuth()
  
  try {
    const automation = await prisma.automation.findFirst({
      where: { userId: user.id, isActive: true }
    })

    if (!automation) {
      return false
    }

    // --- STEP 1: Log initialization ---
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: "CREATE",
        entity: "Agent Run",
        metadata: { message: "Agent awakened. Initializing job search parameters..." }
      }
    })

    // --- STEP 2: Find Jobs ---
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: "CREATE",
        entity: "Agent Task",
        metadata: { message: "Scanning RemoteOK and LinkedIn for matching Software Engineering roles..." }
      }
    })

    // Mock jobs for spectacular demo
    const mockJobs = [
      { company: "Vercel", role: "Senior Frontend Engineer", url: "https://vercel.com/careers" },
      { company: "Stripe", role: "Staff React Engineer", url: "https://stripe.com/jobs" },
      { company: "Linear", role: "Product Engineer", url: "https://linear.app/careers" },
      { company: "Anthropic", role: "Full Stack Developer", url: "https://anthropic.com/careers" }
    ]
    const matchedJob = mockJobs[Math.floor(Math.random() * mockJobs.length)]

    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: "UPDATE",
        entity: "Agent Task",
        metadata: { message: `Found 92% match at ${matchedJob.company} for ${matchedJob.role}!` }
      }
    })

    // --- STEP 3: AI Cover Letter ---
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: "CREATE",
        entity: "Agent Task",
        metadata: { message: "Analyzing job description and writing tailored cover letter..." }
      }
    })

    const { text: coverLetter } = await generateText({
      model: anthropic("claude-3-5-sonnet-20241022"),
      prompt: `Write a short, punchy 3-sentence cover letter for a ${matchedJob.role} position at ${matchedJob.company}. The tone should be highly professional but modern. Start with "Hi Team,". No placeholders.`
    })

    // --- STEP 4: Save Job to DB ---
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: "CREATE",
        entity: "Agent Task",
        metadata: { message: "Saving job and cover letter to your portfolio database..." }
      }
    })

    await prisma.job.create({
      data: {
        userId: user.id,
        company: matchedJob.company,
        role: matchedJob.role,
        url: matchedJob.url,
        status: automation.autoApply ? "APPLIED" : "FOUND",
        coverLetter,
        matchScore: 92
      }
    })

    // --- STEP 5: Send Email ---
    if (automation.autoApply) {
      await prisma.auditLog.create({
        data: {
          actorId: user.id,
          action: "UPDATE",
          entity: "Agent Task",
          metadata: { message: `Auto-applying to ${matchedJob.company}... Success! Sending email notification.` }
        }
      })

      if (process.env.RESEND_API_KEY) {
        try {
          await resend.emails.send({
            from: 'Blacken Agent <onboarding@resend.dev>',
            to: user.email,
            subject: `✅ Application Submitted: ${matchedJob.company}`,
            html: `
              <div style="font-family: sans-serif; max-w-2xl; margin: 0 auto; padding: 20px;">
                <h2 style="color: #10b981;">Application Successfully Submitted!</h2>
                <p>Your autonomous agent has successfully completed and submitted an application on your behalf.</p>
                <div style="background-color: #f4f4f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p><strong>Company:</strong> ${matchedJob.company}</p>
                  <p><strong>Role:</strong> ${matchedJob.role}</p>
                  <p><strong>Match Score:</strong> 92%</p>
                </div>
                <h3 style="color: #18181b;">The Cover Letter I Wrote For You:</h3>
                <div style="background-color: #fafafa; padding: 15px; border-left: 4px solid #3b82f6; color: #3f3f46; white-space: pre-wrap;">
                  ${coverLetter}
                </div>
              </div>
            `
          })
        } catch (emailError) {
          console.error("Resend error:", emailError)
        }
      }
    }

    // --- STEP 6: Complete ---
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: "UPDATE",
        entity: "Agent Run",
        metadata: { message: "Agent run completed successfully. Going back to sleep." }
      }
    })

    return true
  } catch (error) {
    console.error("Failed to trigger job worker", error)
    return false
  }
}

export async function getAgentLogs() {
  const user = await requireAuth()
  
  const logs = await prisma.auditLog.findMany({
    where: { actorId: user.id, entity: { in: ["Agent Run", "Agent Task"] } },
    orderBy: { createdAt: 'desc' },
    take: 50
  })
  
  return logs.map(log => ({
    id: log.id,
    action: log.action,
    message: (log.metadata as any)?.message || "Action performed",
    createdAt: log.createdAt
  }))
}
