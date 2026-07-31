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

  // If activated, trigger a background scan cycle immediately on the Render server
  if (isActive) {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://blacken-jobs.onrender.com/api/v1"
      await fetch(`${apiUrl}/automation/trigger`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      })
    } catch (e) {
      console.error("Failed to trigger background automation on activation:", e)
    }
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
    // Check prerequisites
    const careerProfile = await prisma.careerProfile.findUnique({
      where: { userId: user.id }
    })
    const defaultResume = await prisma.resume.findFirst({
      where: { userId: user.id, isDefault: true }
    })

    const missing = []
    if (!careerProfile) {
      missing.push("Career Profile details")
    } else if (careerProfile.skills.length === 0) {
      missing.push("Skills in your Career Profile")
    }
    if (!defaultResume) {
      missing.push("A default Resume (mark one as default under Resumes)")
    }

    if (missing.length > 0) {
      return {
        success: false,
        error: "Prerequisites missing: " + missing.join(", ")
      }
    }

    // Audit log manual run trigger
    await prisma.auditLog.create({
      data: { actorId: user.id, action: "CREATE", entity: "Agent Run", metadata: { message: "Agent awakened manually. Waking up background cloud crawler..." } }
    })

    // Ping Render backend to trigger the real worker cycle (Indeed crawler + RemoteOK + Claude Matcher)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://blacken-jobs.onrender.com/api/v1"
    const res = await fetch(`${apiUrl}/automation/trigger`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    })

    if (!res.ok) {
      throw new Error("Render trigger request failed")
    }

    return { success: true, message: "Cloud crawler successfully triggered! Open Logs to see progress." }
  } catch (error) {
    console.error("Failed to trigger job worker", error)
    return { success: false, error: "Could not contact Render background worker." }
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

export async function saveIndeedCredentials(email: string, password: string) {
  const user = await requireAuth()

  await prisma.connectedAccount.upsert({
    where: {
      userId_platform: {
        userId: user.id,
        platform: "INDEED"
      }
    },
    update: {
      platformUserId: email,
      accessToken: password,
      isActive: true,
      lastSyncAt: new Date()
    },
    create: {
      userId: user.id,
      platform: "INDEED",
      platformUserId: email,
      accessToken: password,
      isActive: true,
      lastSyncAt: new Date()
    }
  })
}

export async function getIndeedCredentials() {
  const user = await requireAuth()

  const account = await prisma.connectedAccount.findUnique({
    where: {
      userId_platform: {
        userId: user.id,
        platform: "INDEED"
      }
    }
  })

  if (!account) return null

  return {
    email: account.platformUserId || "",
    password: account.accessToken || ""
  }
}

export async function updateTargetPreferences(titles: string[], locations: string[]) {
  const user = await requireAuth()

  // Update Career Profile
  await prisma.careerProfile.upsert({
    where: { userId: user.id },
    update: {
      preferredJobTitles: titles,
      preferredCountries: locations
    },
    create: {
      userId: user.id,
      preferredJobTitles: titles,
      preferredCountries: locations
    }
  })

  // Update Automation
  const automation = await prisma.automation.findFirst({
    where: { userId: user.id }
  })

  if (automation) {
    await prisma.automation.update({
      where: { id: automation.id },
      data: {
        keywords: titles,
        locations: locations
      }
    })
  }
}

export async function fetchNotifications() {
  const user = await requireAuth()
  return await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 15
  })
}

export async function markNotificationAsRead(id: string) {
  const user = await requireAuth()
  await prisma.notification.updateMany({
    where: { id, userId: user.id },
    data: { isRead: true, readAt: new Date() }
  })
}

export async function markAllNotificationsAsRead() {
  const user = await requireAuth()
  await prisma.notification.updateMany({
    where: { userId: user.id, isRead: false },
    data: { isRead: true, readAt: new Date() }
  })
}
