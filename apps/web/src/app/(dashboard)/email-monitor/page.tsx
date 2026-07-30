import { requireAuth } from "@/dal/auth"
import { prisma } from "@repo/db"
import { EmailMonitorPage } from "@/features/email-monitor/components/email-monitor-page"

export default async function EmailMonitorPageRoute() {
  const session = await requireAuth()

  const [emails, connectedAccounts] = await Promise.all([
    prisma.emailRecord.findMany({
      where: { userId: session.id },
      orderBy: { receivedAt: "desc" },
      take: 50,
    }),
    prisma.connectedAccount.findMany({
      where: { userId: session.id, platform: { in: ["GMAIL", "OUTLOOK"] } },
    }),
  ])

  return (
    <EmailMonitorPage 
      emails={JSON.parse(JSON.stringify(emails))} 
      connectedAccounts={JSON.parse(JSON.stringify(connectedAccounts))} 
    />
  )
}
