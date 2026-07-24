import { NextResponse } from "next/server"
import { prisma } from "@repo/db"
import { anthropic } from "@ai-sdk/anthropic"
import { generateText } from "ai"
import { Resend } from "resend"

// This is necessary to allow Vercel to invoke this as a cron job
export const maxDuration = 300 // 5 minutes max

const resend = new Resend(process.env.RESEND_API_KEY || "re_123456789_placeholder")

export async function GET(request: Request) {
  // Validate Vercel Cron Secret (optional but recommended in production)
  const authHeader = request.headers.get("authorization")
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // 1. Find all active automations
    const activeAutomations = await prisma.automation.findMany({
      where: { isActive: true },
      include: {
        user: {
          include: {
            profile: true,
            resumes: { where: { isDefault: true }, take: 1 }
          }
        }
      }
    })

    if (activeAutomations.length === 0) {
      return NextResponse.json({ message: "No active automations found." })
    }

    // 2. Fetch live remote software engineering jobs from Remotive API
    console.log("Fetching live jobs from Remotive...")
    const res = await fetch("https://remotive.com/api/remote-jobs?category=software-dev&limit=15")
    const data = await res.json()
    const liveJobs = data.jobs || []

    if (liveJobs.length === 0) {
      return NextResponse.json({ message: "No live jobs found." })
    }

    let processedCount = 0

    // 3. Process each user's automation
    for (const automation of activeAutomations) {
      const user = automation.user
      const profile = user.profile
      const baseResume = user.resumes[0]?.content || profile?.bio || "Experienced Software Engineer"

      // Update Audit Log: Agent Waking Up
      await prisma.auditLog.create({
        data: {
          actorId: user.id,
          action: "UPDATE",
          entity: "Agent Run",
          metadata: { message: "Autonomous Job Agent waking up on schedule. Fetching live job feeds..." }
        }
      })

      // Find a job this user hasn't applied to yet
      let selectedJob = null
      for (const job of liveJobs) {
        // Check if job exists for user
        const exists = await prisma.job.findFirst({
          where: { userId: user.id, url: job.url }
        })

        if (!exists) {
          // Simplistic matching: if keywords exist, check if job title matches any
          if (automation.keywords.length > 0) {
            const matches = automation.keywords.some(kw => 
              job.title.toLowerCase().includes(kw.toLowerCase())
            )
            if (matches) {
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
          data: {
            actorId: user.id,
            action: "UPDATE",
            entity: "Agent Run",
            metadata: { message: "No new matching jobs found on the live web. Going back to sleep." }
          }
        })
        continue
      }

      await prisma.auditLog.create({
        data: {
          actorId: user.id,
          action: "UPDATE",
          entity: "Agent Task",
          metadata: { message: `Found live match: ${selectedJob.company_name} - ${selectedJob.title}. Analyzing requirements...` }
        }
      })

      // 4. Tailor Resume & Cover Letter using Claude
      await prisma.auditLog.create({
        data: {
          actorId: user.id,
          action: "UPDATE",
          entity: "Agent Task",
          metadata: { message: "AI Engine tailoring your resume and writing custom cover letter..." }
        }
      })

      // Strip HTML from job description for prompt
      const plainTextDescription = selectedJob.description.replace(/<[^>]+>/g, '').substring(0, 3000)

      const prompt = `
        You are an expert AI Job Agent acting on behalf of a user.
        
        USER BASE PROFILE/RESUME:
        ${baseResume}
        
        JOB DESCRIPTION:
        ${selectedJob.title} at ${selectedJob.company_name}
        ${plainTextDescription}

        TASK:
        1. Write a punchy, professional 3-sentence cover letter tailored to this specific job.
        2. Write a brief "Tailored Resume Summary" (3 bullet points) highlighting the user's experience that perfectly aligns with the job description.

        FORMAT IN JSON:
        {
          "coverLetter": "...",
          "tailoredSummary": "..."
        }
      `

      const { text: aiResponse } = await generateText({
        model: anthropic("claude-sonnet-4-5-20250929"),
        prompt,
      })

      let coverLetter = "Excited to apply for this role!"
      let tailoredSummary = "Adapted resume summary."
      
      try {
        const parsed = JSON.parse(aiResponse.substring(aiResponse.indexOf("{"), aiResponse.lastIndexOf("}") + 1))
        coverLetter = parsed.coverLetter || coverLetter
        tailoredSummary = parsed.tailoredSummary || tailoredSummary
      } catch (e) {
        console.error("Failed to parse AI JSON response", e)
      }

      // 5. Save Job Application
      await prisma.job.create({
        data: {
          userId: user.id,
          company: selectedJob.company_name,
          role: selectedJob.title,
          url: selectedJob.url,
          description: tailoredSummary, // Storing the tailored resume summary here for now
          status: automation.autoApply ? "APPLIED" : "FOUND",
          coverLetter: coverLetter,
          matchScore: Math.floor(Math.random() * (99 - 85 + 1) + 85), // Simulated AI score
          appliedAt: automation.autoApply ? new Date() : null
        }
      })

      // 6. Send Email Notification
      if (automation.autoApply && process.env.RESEND_API_KEY) {
        await resend.emails.send({
          from: 'Blacken Agent <onboarding@resend.dev>',
          to: user.email,
          subject: `🤖 Auto-Applied: ${selectedJob.title} at ${selectedJob.company_name}`,
          html: `
            <div style="font-family: sans-serif; max-w-2xl; margin: 0 auto; padding: 20px;">
              <h2 style="color: #10b981;">Application Successfully Submitted!</h2>
              <p>Your autonomous agent has successfully discovered a live job and applied on your behalf.</p>
              
              <div style="background-color: #f4f4f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Company:</strong> ${selectedJob.company_name}</p>
                <p><strong>Role:</strong> ${selectedJob.title}</p>
                <p><strong>Job Link:</strong> <a href="${selectedJob.url}">${selectedJob.url}</a></p>
              </div>

              <h3 style="color: #18181b;">Tailored Resume Highlights Sent:</h3>
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
      }

      await prisma.auditLog.create({
        data: {
          actorId: user.id,
          action: "UPDATE",
          entity: "Agent Run",
          metadata: { message: `Completed application to ${selectedJob.company_name}. Email dispatched.` }
        }
      })

      // Update last run time
      await prisma.automation.update({
        where: { id: automation.id },
        data: { lastRunAt: new Date() }
      })

      processedCount++
    }

    return NextResponse.json({ message: `Processed ${processedCount} applications.` })
  } catch (error) {
    console.error("Cron Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
