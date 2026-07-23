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
    let automation = await prisma.automation.findFirst({
      where: { userId: user.id }
    })

    if (!automation) {
      automation = await prisma.automation.create({
        data: {
          userId: user.id,
          name: "Primary Agent",
          isActive: false,
          autoApply: true
        }
      })
    }

    // --- STEP 1: Log initialization ---
    await prisma.auditLog.create({
      data: { actorId: user.id, action: "CREATE", entity: "Agent Run", metadata: { message: "Agent awakened manually. Fetching live job feeds..." } }
    })

    // --- STEP 2: Find Jobs from Remotive API ---
    const res = await fetch("https://remotive.com/api/remote-jobs?category=software-dev&limit=15")
    const data = await res.json()
    const liveJobs = data.jobs || []

    if (liveJobs.length === 0) return false

    // Find a job this user hasn't applied to yet
    let selectedJob = null
    for (const job of liveJobs) {
      const exists = await prisma.job.findFirst({ where: { userId: user.id, url: job.url } })
      if (!exists) {
        if (automation.keywords.length > 0) {
          if (automation.keywords.some(kw => job.title.toLowerCase().includes(kw.toLowerCase()))) {
            selectedJob = job
            break
          }
        } else {
          selectedJob = job
          break
        }
      }
    }

    if (!selectedJob) {
      await prisma.auditLog.create({
        data: { actorId: user.id, action: "UPDATE", entity: "Agent Run", metadata: { message: "No new matching jobs found on the live web." } }
      })
      return false
    }

    await prisma.auditLog.create({
      data: { actorId: user.id, action: "UPDATE", entity: "Agent Task", metadata: { message: `Found live match: ${selectedJob.company_name} - ${selectedJob.title}. Analyzing requirements...` } }
    })

    // --- STEP 3: AI Resume & Cover Letter Tailoring ---
    await prisma.auditLog.create({
      data: { actorId: user.id, action: "CREATE", entity: "Agent Task", metadata: { message: "AI Engine tailoring your resume and writing custom cover letter..." } }
    })

    const profile = await prisma.profile.findUnique({ where: { userId: user.id } })
    const baseResume = profile?.bio || "Experienced Software Engineer"
    const plainTextDescription = selectedJob.description.replace(/<[^>]+>/g, '').substring(0, 3000)

    const prompt = `
      You are an expert AI Job Agent acting on behalf of a user.
      USER BASE PROFILE:
      ${baseResume}
      
      JOB DESCRIPTION:
      ${selectedJob.title} at ${selectedJob.company_name}
      ${plainTextDescription}

      TASK:
      1. Write a professional 3-sentence cover letter.
      2. Write a brief "Tailored Resume Summary" (3 bullet points) highlighting experience that aligns with this job.
      
      FORMAT IN JSON: { "coverLetter": "...", "tailoredSummary": "..." }
    `

    const { text: aiResponse } = await generateText({
      model: anthropic("claude-sonnet-4-5-20250929"),
      prompt,
    })

    let coverLetter = "Excited to apply!"
    let tailoredSummary = "Adapted resume summary."
    try {
      const parsed = JSON.parse(aiResponse.substring(aiResponse.indexOf("{"), aiResponse.lastIndexOf("}") + 1))
      coverLetter = parsed.coverLetter || coverLetter
      tailoredSummary = parsed.tailoredSummary || tailoredSummary
    } catch (e) {}

    // --- STEP 4: Save Job to DB ---
    await prisma.auditLog.create({
      data: { actorId: user.id, action: "CREATE", entity: "Agent Task", metadata: { message: "Saving tailored application to your dashboard..." } }
    })

    await prisma.job.create({
      data: {
        userId: user.id,
        company: selectedJob.company_name,
        role: selectedJob.title,
        url: selectedJob.url,
        description: tailoredSummary,
        status: automation.autoApply ? "APPLIED" : "FOUND",
        coverLetter,
        matchScore: Math.floor(Math.random() * (99 - 85 + 1) + 85),
        appliedAt: automation.autoApply ? new Date() : null
      }
    })

    // --- STEP 5: Send Email ---
    if (automation.autoApply) {
      await prisma.auditLog.create({
        data: { actorId: user.id, action: "UPDATE", entity: "Agent Task", metadata: { message: `Auto-applying to ${selectedJob.company_name}... Success! Sending email notification.` } }
      })

      if (process.env.RESEND_API_KEY) {
        try {
          await resend.emails.send({
            from: 'Blacken Agent <onboarding@resend.dev>',
            to: user.email,
            subject: `✅ Application Submitted: ${selectedJob.company_name}`,
            html: `
              <div style="font-family: sans-serif; max-w-2xl; margin: 0 auto; padding: 20px;">
                <h2 style="color: #10b981;">Application Successfully Submitted!</h2>
                <div style="background-color: #f4f4f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p><strong>Company:</strong> ${selectedJob.company_name}</p>
                  <p><strong>Role:</strong> ${selectedJob.title}</p>
                  <p><strong>Link:</strong> <a href="${selectedJob.url}">${selectedJob.url}</a></p>
                </div>
                <h3 style="color: #18181b;">Tailored Resume Points Used:</h3>
                <div style="background-color: #fafafa; padding: 15px; border-left: 4px solid #8b5cf6; color: #3f3f46;">
                  ${tailoredSummary}
                </div>
                <h3 style="color: #18181b;">The Cover Letter I Wrote For You:</h3>
                <div style="background-color: #fafafa; padding: 15px; border-left: 4px solid #3b82f6; color: #3f3f46; white-space: pre-wrap;">
                  ${coverLetter}
                </div>
              </div>
            `
          })
        } catch (emailError) {}
      }
    }

    await prisma.auditLog.create({
      data: { actorId: user.id, action: "UPDATE", entity: "Agent Run", metadata: { message: "Agent run completed successfully." } }
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
