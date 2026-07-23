import { requireAuth } from "@/dal/auth"
import { prisma } from "@repo/db"
import { AutomationClient } from "./automation-client"

export default async function AutomationPage() {
  const user = await requireAuth()

  // Fetch the user's primary automation agent
  const automation = await prisma.automation.findFirst({
    where: { userId: user.id }
  })

  // Fetch the user's profile for the portfolio URL
  const profile = await prisma.profile.findUnique({
    where: { userId: user.id }
  })

  const initialIsActive = automation?.isActive ?? false
  const initialPortfolioUrl = profile?.website ?? ""

  return <AutomationClient initialIsActive={initialIsActive} initialPortfolioUrl={initialPortfolioUrl} />
}
