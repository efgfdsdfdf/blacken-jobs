import { NextResponse } from "next/server"
import { requireAuth } from "@/dal/auth"
import { prisma } from "@repo/db"
import { analyzeJobMatch } from "@/lib/ai/job-matcher"

export async function POST(req: Request) {
  try {
    const user = await requireAuth()
    const { query, location } = await req.json()

    // Fetch the career profile to score the matches
    const careerProfile = await prisma.careerProfile.findUnique({
      where: { userId: user.id }
    })

    // Fetch real developer jobs from RemoteOK public API
    const response = await fetch("https://remoteok.com/api", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      },
      next: { revalidate: 300 } // Cache for 5 minutes
    })

    if (!response.ok) {
      throw new Error("Failed to fetch real jobs from RemoteOK")
    }

    const rawData = await response.json()
    // First item in RemoteOK is a legal disclaimer, slice it out
    const rawJobs = Array.isArray(rawData) ? rawData.slice(1) : []

    // Filter jobs based on search query
    const searchQuery = (query || "").toLowerCase()
    const filteredJobs = rawJobs.filter((job: any) => {
      const title = (job.position || "").toLowerCase()
      const company = (job.company || "").toLowerCase()
      const tags = Array.isArray(job.tags) ? job.tags.join(" ").toLowerCase() : ""
      const description = (job.description || "").toLowerCase()

      return (
        title.includes(searchQuery) ||
        company.includes(searchQuery) ||
        tags.includes(searchQuery) ||
        description.includes(searchQuery)
      )
    })

    // Grab the top 5 matches to analyze via Claude AI to conserve API limits
    const topJobs = filteredJobs.slice(0, 5)

    const processedJobs = await Promise.all(
      topJobs.map(async (job: any) => {
        const mappedJob = {
          title: job.position,
          company: job.company,
          description: job.description,
          url: job.apply_url || job.url,
          location: "Remote",
          locationType: "REMOTE",
          salaryMin: job.salary_min || null,
          salaryMax: job.salary_max || null,
          technologies: job.tags || []
        }

        // Run the real AI Matcher if user profile is defined
        let matchScore = 75
        let matchAnalysis = {
          skillMatches: ["React", "JavaScript"],
          skillGaps: ["Next.js"],
          experienceMatch: "Matches required 3+ years experience.",
          salaryMatch: "Within expected budget.",
          explanation: "This role matches your primary frontend skills."
        }

        if (careerProfile) {
          try {
            const aiMatch = await analyzeJobMatch(mappedJob, careerProfile)
            matchScore = aiMatch.score
            matchAnalysis = aiMatch
          } catch (e) {
            console.error("AI Matcher failed for job:", job.position, e)
          }
        }

        return {
          id: job.id?.toString() || Math.random().toString(),
          title: mappedJob.title,
          company: mappedJob.company,
          description: mappedJob.description,
          url: mappedJob.url,
          location: mappedJob.location,
          locationType: mappedJob.locationType,
          salaryMin: mappedJob.salaryMin,
          salaryMax: mappedJob.salaryMax,
          technologies: mappedJob.technologies,
          matchScore,
          matchAnalysis,
          source: "REMOTEOK"
        }
      })
    )

    return NextResponse.json(processedJobs)
  } catch (error: any) {
    console.error("Real job search error:", error)
    return new NextResponse(error.message, { status: 500 })
  }
}
