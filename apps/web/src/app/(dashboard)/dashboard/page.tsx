import { requireAuth } from "@/dal/auth"
import { prisma } from "@repo/db"
import { DashboardOverview } from "@/features/dashboard/components/dashboard-overview"

export default async function DashboardPage() {
  const session = await requireAuth()

  // Fetch all stats in parallel
  const [
    jobsFound,
    jobsApplied,
    interviewing,
    offers,
    rejections,
    recentJobs,
    upcomingInterviews,
    recentApplications,
    automations
  ] = await Promise.all([
    prisma.job.count({ where: { userId: session.id } }),
    prisma.job.count({ where: { userId: session.id, status: "APPLIED" } }),
    prisma.job.count({ where: { userId: session.id, status: "INTERVIEWING" } }),
    prisma.job.count({ where: { userId: session.id, status: "OFFER" } }),
    prisma.job.count({ where: { userId: session.id, status: "REJECTED" } }),
    prisma.job.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.interviewRecord.findMany({
      where: { 
        userId: session.id,
        scheduledAt: { gte: new Date() }
      },
      include: { application: { include: { job: true } } },
      orderBy: { scheduledAt: "asc" },
      take: 5,
    }),
    prisma.application.findMany({
      where: { userId: session.id },
      include: { job: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.automation.findMany({
      where: { userId: session.id, isActive: true },
      take: 3,
    }),
  ])

  const totalApplied = jobsApplied + interviewing + offers + rejections
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
      recentJobs={recentJobs}
      upcomingInterviews={upcomingInterviews}
      recentApplications={recentApplications}
      activeAutomations={automations}
    />
  )
}
