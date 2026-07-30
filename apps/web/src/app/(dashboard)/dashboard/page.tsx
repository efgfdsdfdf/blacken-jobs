import { requireAuth } from "@/dal/auth"
import { prisma } from "@repo/db"
import { DashboardOverview } from "@/features/dashboard/components/dashboard-overview"

export default async function DashboardPage() {
  const session = await requireAuth()

  // Wrap each query in try/catch so the dashboard works even if new tables
  // haven't been migrated yet
  let jobsFound = 0, totalApplied = 0, interviewing = 0, offers = 0, rejections = 0
  let recentJobs: any[] = [], upcomingInterviews: any[] = []
  let recentApplications: any[] = [], automations: any[] = []

  try {
    const results = await Promise.all([
      prisma.job.count({ where: { userId: session.id } }).catch(() => 0),
      prisma.job.count({ where: { userId: session.id, status: "APPLIED" } }).catch(() => 0),
      prisma.job.count({ where: { userId: session.id, status: "INTERVIEWING" } }).catch(() => 0),
      prisma.job.count({ where: { userId: session.id, status: "OFFER" } }).catch(() => 0),
      prisma.job.count({ where: { userId: session.id, status: "REJECTED" } }).catch(() => 0),
      prisma.job.findMany({
        where: { userId: session.id },
        orderBy: { createdAt: "desc" },
        take: 5,
      }).catch(() => []),
    ])

    jobsFound = results[0] as number
    const applied = results[1] as number
    interviewing = results[2] as number
    offers = results[3] as number
    rejections = results[4] as number
    recentJobs = results[5] as any[]
    totalApplied = applied + interviewing + offers + rejections
  } catch (e) {
    console.error("Dashboard query error (jobs):", e)
  }

  // These tables might not exist yet if migration hasn't run
  try {
    upcomingInterviews = await prisma.interviewRecord.findMany({
      where: { 
        userId: session.id,
        scheduledAt: { gte: new Date() }
      },
      include: { application: { include: { job: true } } },
      orderBy: { scheduledAt: "asc" },
      take: 5,
    })
  } catch (e) {
    // Table doesn't exist yet — that's fine
  }

  try {
    recentApplications = await prisma.application.findMany({
      where: { userId: session.id },
      include: { job: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    })
  } catch (e) {
    // Table doesn't exist yet
  }

  try {
    automations = await prisma.automation.findMany({
      where: { userId: session.id, isActive: true },
      take: 3,
    })
  } catch (e) {
    // Table doesn't exist yet
  }

  const responseRate = totalApplied > 0 ? Math.round(((interviewing + offers) / totalApplied) * 100) : 0

  return (
    <DashboardOverview 
      stats={{
        jobsFound,
        jobsApplied: totalApplied,
        interviewing,
        offers,
        rejections,
        responseRate,
      }}
      recentJobs={JSON.parse(JSON.stringify(recentJobs))}
      upcomingInterviews={JSON.parse(JSON.stringify(upcomingInterviews))}
      recentApplications={JSON.parse(JSON.stringify(recentApplications))}
      activeAutomations={JSON.parse(JSON.stringify(automations))}
    />
  )
}
