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

export async function forceRunJobWorker() {
  const user = await requireAuth()
  
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1"}/jobs/trigger`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Pass auth token if needed, but since it requiresAuth, we might need a bearer token or bypass.
        // Actually, the API route currently has `requireAuth` which expects a Bearer token in the header.
        // Since we are server-side, it's tricky to forward Supabase auth tokens seamlessly without passing the cookie.
        // For this admin action in dev, we can pass a special header or just skip auth for the trigger endpoint.
      }
    });
    return res.ok;
  } catch (error) {
    console.error("Failed to trigger job worker", error);
    return false;
  }
}
