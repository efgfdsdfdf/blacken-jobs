import { requireAuth } from "@/dal/auth"
import { prisma } from "@repo/db"
import { InterviewsPage } from "@/features/interviews/components/interviews-page"

export default async function InterviewsPageRoute() {
  const session = await requireAuth()

  const interviews = await prisma.interviewRecord.findMany({
    where: { userId: session.id },
    include: {
      application: {
        include: { job: true }
      }
    },
    orderBy: { scheduledAt: "desc" },
  })

  return <InterviewsPage interviews={JSON.parse(JSON.stringify(interviews))} />
}
