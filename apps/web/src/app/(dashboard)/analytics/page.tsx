import { requireAuth } from "@/dal/auth"
import { prisma } from "@repo/db"
import { AnalyticsPage } from "@/features/analytics/components/analytics-page"

export const metadata = {
  title: "Analytics | BLACK AI",
  description: "View your job hunting analytics and performance.",
}

export default async function Page() {
  const user = await requireAuth()

  // Fetch all jobs for user to compute stats
  const jobs = await prisma.job.findMany({
    where: { userId: user.id },
  })

  const applications = await prisma.application.findMany({
    where: { userId: user.id },
    include: { job: true },
  })

  // Basic stats computation
  const totalJobsFound = jobs.length
  const totalApplications = applications.length
  
  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status || "APPLIED"] = (acc[app.status || "APPLIED"] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const underReview = statusCounts["UNDER_REVIEW"] || 0
  const interviewing = statusCounts["INTERVIEWING"] || 0
  const offers = statusCounts["OFFER"] || 0

  const responseRate = totalApplications > 0 ? Math.round(((interviewing + offers + (statusCounts["REJECTED"] || 0)) / totalApplications) * 100) : 0
  const interviewRate = totalApplications > 0 ? Math.round(((interviewing + offers) / totalApplications) * 100) : 0
  
  const avgMatchScore = applications.reduce((acc, app) => acc + (app.job?.matchScore || 0), 0) / (totalApplications || 1)

  // Funnel actual counts
  const funnel = {
    found: totalJobsFound,
    applied: totalApplications,
    underReview,
    interviewing,
    offer: offers
  }

  // Generate 7 days of activity based purely on real data
  const today = new Date()
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (6 - i))
    d.setHours(0, 0, 0, 0)
    
    // Count apps on this day
    const count = applications.filter(a => {
      const appDate = new Date(a.submittedAt || a.createdAt)
      return appDate.toDateString() === d.toDateString()
    }).length
    
    return {
      date: d.toLocaleDateString(undefined, { weekday: 'short' }),
      count
    }
  })

  // Group and count actual technologies from user's jobs
  const skillCounts: Record<string, number> = {}
  jobs.forEach(j => {
    // If technologies is a JSON/Array field
    const techArray = Array.isArray(j.technologies) ? (j.technologies as string[]) : []
    techArray.forEach(tech => {
      const name = tech.trim()
      if (name) {
        skillCounts[name] = (skillCounts[name] || 0) + 1
      }
    })
  })

  const topSkills = Object.entries(skillCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => {
      const percent = totalJobsFound > 0 ? Math.round((count / totalJobsFound) * 100) : 0
      return { name, count, percent }
    })

  // If no skills found, fallback to empty array (no mocks)
  const finalSkills = topSkills.length > 0 ? topSkills : [
    { name: "No Data", count: 0, percent: 0 }
  ]

  // Group and count actual job sources by parsing domain names from URLs
  const sourcesMap: Record<string, number> = {}
  jobs.forEach(j => {
    if (!j.url) return
    let sourceName = "Direct / Other"
    const url = j.url.toLowerCase()
    if (url.includes("indeed.com")) sourceName = "Indeed"
    else if (url.includes("remoteok.com") || url.includes("remoteok")) sourceName = "RemoteOK"
    else if (url.includes("remotive.com") || url.includes("remotive")) sourceName = "Remotive"
    else if (url.includes("linkedin.com")) sourceName = "LinkedIn"
    
    sourcesMap[sourceName] = (sourcesMap[sourceName] || 0) + 1
  })

  const sourcesColors: Record<string, string> = {
    "Indeed": "#2164f4",
    "RemoteOK": "#ff4747",
    "Remotive": "#6366f1",
    "LinkedIn": "#0077b5",
    "Direct / Other": "#71717a"
  }

  const sources = Object.entries(sourcesMap).map(([name, value]) => ({
    name,
    value,
    color: sourcesColors[name] || "#3b82f6"
  }))

  const finalSources = sources.length > 0 ? sources : [
    { name: "No Data", value: 0, color: "#71717a" }
  ]

  const analyticsData = {
    overview: {
      totalJobsFound,
      totalApplications,
      responseRate,
      interviewRate,
      avgMatchScore: Math.round(avgMatchScore) || 0,
      offers
    },
    funnel,
    weeklyActivity: last7Days,
    topSkills: finalSkills,
    sources: finalSources
  }

  return <AnalyticsPage data={analyticsData} />
}
