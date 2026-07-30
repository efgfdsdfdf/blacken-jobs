const fs = require('fs');
const path = require('path');

const root = 'c:\\\\Users\\\\ezeil\\\\OneDrive\\\\Desktop\\\\blacken';

const files = {
    'apps/web/src/app/api/career-profile/route.ts': `import { NextResponse } from 'next/server'
import { requireAuth } from '@/dal/auth'
import { prisma } from '@repo/db'

export async function GET(req: Request) {
  try {
    const user = await requireAuth()
    const profile = await prisma.careerProfile.findUnique({
      where: { userId: user.id }
    })
    return NextResponse.json(profile)
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    const profile = await prisma.careerProfile.create({
      data: { ...body, userId: user.id }
    })
    return NextResponse.json(profile)
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    const profile = await prisma.careerProfile.update({
      where: { userId: user.id },
      data: body
    })
    return NextResponse.json(profile)
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 })
  }
}`,

    'apps/web/src/app/api/jobs/route.ts': `import { NextResponse } from 'next/server'
import { requireAuth } from '@/dal/auth'
import { prisma } from '@repo/db'

export async function GET(req: Request) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const locationType = searchParams.get('locationType')
    const source = searchParams.get('source')
    const minScore = searchParams.get('minScore')
    const search = searchParams.get('search')
    const skip = parseInt(searchParams.get('skip') || '0', 10)
    const take = parseInt(searchParams.get('take') || '20', 10)

    const where: any = { userId: user.id }
    if (status) where.status = status
    if (locationType) where.locationType = locationType
    if (source) where.source = source
    if (minScore) where.matchScore = { gte: parseFloat(minScore) }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
      ]
    }

    const jobs = await prisma.job.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(jobs)
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    const job = await prisma.job.create({
      data: { ...body, userId: user.id }
    })
    return NextResponse.json(job)
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 })
  }
}`,

    'apps/web/src/app/api/jobs/[id]/route.ts': `import { NextResponse } from 'next/server'
import { requireAuth } from '@/dal/auth'
import { prisma } from '@repo/db'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth()
    const job = await prisma.job.findFirst({
      where: { id: params.id, userId: user.id }
    })
    if (!job) return new NextResponse('Not found', { status: 404 })
    return NextResponse.json(job)
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    
    const existing = await prisma.job.findFirst({
      where: { id: params.id, userId: user.id }
    })
    if (!existing) return new NextResponse('Not found', { status: 404 })

    const job = await prisma.job.update({
      where: { id: params.id },
      data: body
    })
    return NextResponse.json(job)
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth()
    const existing = await prisma.job.findFirst({
      where: { id: params.id, userId: user.id }
    })
    if (!existing) return new NextResponse('Not found', { status: 404 })

    await prisma.job.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 })
  }
}`,

    'apps/web/src/app/api/jobs/search/route.ts': `import { NextResponse } from 'next/server'
import { requireAuth } from '@/dal/auth'
import { prisma } from '@repo/db'
import { anthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'

export async function POST(req: Request) {
  try {
    const user = await requireAuth()
    const { query, location, locationType, salaryMin } = await req.json()

    const careerProfile = await prisma.careerProfile.findUnique({
      where: { userId: user.id }
    })

    const prompt = \`Generate 5-10 realistic mock job postings for the following search:
Query: \${query}
Location: \${location || 'Any'}
Location Type: \${locationType || 'Any'}
Min Salary: \${salaryMin || 'Any'}

User Profile: \${JSON.stringify(careerProfile)}

Return a JSON array of objects with keys: title, company, description, requirements, salary, location, locationType, source, matchScore (0-100), and matchAnalysis (string explaining the score). Only return the raw JSON array.\`

    const { text } = await generateText({
      model: anthropic('claude-sonnet-4-5-20250929'),
      prompt,
    })

    const rawJson = text.replace(/^\\\`\\\`\\\`(json)?/, '').replace(/\\\`\\\`\\\`$/, '').trim()
    let mockJobs = []
    try {
      mockJobs = JSON.parse(rawJson)
    } catch (e) {
      console.error('Failed to parse mock jobs from AI:', e)
    }

    // Optionally save these to DB or just return them
    return NextResponse.json(mockJobs)
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 })
  }
}`,

    'apps/web/src/app/api/applications/route.ts': `import { NextResponse } from 'next/server'
import { requireAuth } from '@/dal/auth'
import { prisma } from '@repo/db'

export async function GET(req: Request) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    
    const where: any = { userId: user.id }
    if (status) where.status = status

    const apps = await prisma.application.findMany({
      where,
      include: { job: true },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(apps)
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    const { jobId, status, method, tailoredResumeId } = body

    const app = await prisma.application.create({
      data: {
        userId: user.id,
        jobId,
        status: status || 'APPLIED',
        method,
        tailoredResumeId,
        statusHistory: {
          create: {
            status: status || 'APPLIED',
            notes: 'Application created'
          }
        }
      },
      include: { statusHistory: true }
    })
    return NextResponse.json(app)
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 })
  }
}`,

    'apps/web/src/app/api/applications/[id]/route.ts': `import { NextResponse } from 'next/server'
import { requireAuth } from '@/dal/auth'
import { prisma } from '@repo/db'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth()
    const app = await prisma.application.findFirst({
      where: { id: params.id, userId: user.id },
      include: { statusHistory: true, interviewRecords: true, job: true }
    })
    if (!app) return new NextResponse('Not found', { status: 404 })
    return NextResponse.json(app)
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    
    const existing = await prisma.application.findFirst({
      where: { id: params.id, userId: user.id }
    })
    if (!existing) return new NextResponse('Not found', { status: 404 })

    const data: any = { ...body }
    
    if (body.status && body.status !== existing.status) {
      data.statusHistory = {
        create: {
          status: body.status,
          notes: body.statusNotes || \`Status updated to \${body.status}\`
        }
      }
      delete data.statusNotes
    }

    const app = await prisma.application.update({
      where: { id: params.id },
      data,
      include: { statusHistory: true }
    })
    return NextResponse.json(app)
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth()
    const existing = await prisma.application.findFirst({
      where: { id: params.id, userId: user.id }
    })
    if (!existing) return new NextResponse('Not found', { status: 404 })

    await prisma.application.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 })
  }
}`,

    'apps/web/src/app/api/resumes/route.ts': `import { NextResponse } from 'next/server'
import { requireAuth } from '@/dal/auth'
import { prisma } from '@repo/db'
import { anthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'

export async function GET(req: Request) {
  try {
    const user = await requireAuth()
    const resumes = await prisma.resume.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(resumes)
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    const { name, content, fileUrl, isBase } = body

    let atsScore = 0
    let parsedData = {}
    
    if (content) {
      const prompt = \`Parse this resume and evaluate it for ATS readiness.
Resume: \${content}
Return a JSON object with keys: atsScore (0-100), parsedData (object with skills, experience, education).\`

      try {
        const { text } = await generateText({
          model: anthropic('claude-sonnet-4-5-20250929'),
          prompt,
        })
        const rawJson = text.replace(/^\\\`\\\`\\\`(json)?/, '').replace(/\\\`\\\`\\\`$/, '').trim()
        const parsed = JSON.parse(rawJson)
        atsScore = parsed.atsScore || 0
        parsedData = parsed.parsedData || {}
      } catch (e) {
        console.error('AI parsing failed', e)
      }
    }

    const resume = await prisma.resume.create({
      data: {
        userId: user.id,
        name,
        content,
        fileUrl,
        isBase: isBase || false,
        atsScore,
        parsedData
      }
    })
    return NextResponse.json(resume)
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 })
  }
}`,

    'apps/web/src/app/api/resumes/[id]/route.ts': `import { NextResponse } from 'next/server'
import { requireAuth } from '@/dal/auth'
import { prisma } from '@repo/db'
import { anthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth()
    const resume = await prisma.resume.findFirst({
      where: { id: params.id, userId: user.id }
    })
    if (!resume) return new NextResponse('Not found', { status: 404 })
    return NextResponse.json(resume)
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    
    const existing = await prisma.resume.findFirst({
      where: { id: params.id, userId: user.id }
    })
    if (!existing) return new NextResponse('Not found', { status: 404 })

    const data: any = { ...body }

    if (body.content && body.content !== existing.content) {
      const prompt = \`Parse this resume and evaluate it for ATS readiness.
Resume: \${body.content}
Return a JSON object with keys: atsScore (0-100), parsedData (object with skills, experience, education).\`

      try {
        const { text } = await generateText({
          model: anthropic('claude-sonnet-4-5-20250929'),
          prompt,
        })
        const rawJson = text.replace(/^\\\`\\\`\\\`(json)?/, '').replace(/\\\`\\\`\\\`$/, '').trim()
        const parsed = JSON.parse(rawJson)
        data.atsScore = parsed.atsScore || existing.atsScore
        data.parsedData = parsed.parsedData || existing.parsedData
      } catch (e) {
        console.error('AI parsing failed', e)
      }
    }

    const resume = await prisma.resume.update({
      where: { id: params.id },
      data
    })
    return NextResponse.json(resume)
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth()
    const existing = await prisma.resume.findFirst({
      where: { id: params.id, userId: user.id }
    })
    if (!existing) return new NextResponse('Not found', { status: 404 })

    await prisma.resume.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 })
  }
}`,

    'apps/web/src/app/api/analytics/route.ts': `import { NextResponse } from 'next/server'
import { requireAuth } from '@/dal/auth'
import { prisma } from '@repo/db'

export async function GET(req: Request) {
  try {
    const user = await requireAuth()
    
    const [jobsCount, appsCount, offersCount, rejectionsCount] = await Promise.all([
      prisma.job.count({ where: { userId: user.id } }),
      prisma.application.count({ where: { userId: user.id } }),
      prisma.application.count({ where: { userId: user.id, status: 'OFFER' } }),
      prisma.application.count({ where: { userId: user.id, status: 'REJECTED' } })
    ])

    const appsByStatusRaw = await prisma.application.groupBy({
      by: ['status'],
      where: { userId: user.id },
      _count: true
    })
    const appsByStatus = appsByStatusRaw.reduce((acc: Record<string, number>, curr: any) => {
      acc[curr.status] = curr._count; return acc
    }, {})

    const interviewsCount = await prisma.interviewRecord.count({
      where: { application: { userId: user.id } }
    })

    const responseRate = appsCount > 0 ? ((interviewsCount + offersCount + rejectionsCount) / appsCount) * 100 : 0
    const interviewRate = appsCount > 0 ? (interviewsCount / appsCount) * 100 : 0

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentApps = await prisma.application.findMany({
      where: { userId: user.id, createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true }
    })

    const weeklyActivity = recentApps.reduce((acc: Record<string, number>, app: any) => {
      const date = app.createdAt.toISOString().split('T')[0]
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {})

    return NextResponse.json({
      totalJobs: jobsCount,
      totalApplied: appsCount,
      offers: offersCount,
      rejections: rejectionsCount,
      responseRate,
      interviewRate,
      appsByStatus,
      weeklyActivity
    })
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 })
  }
}`,

    'apps/web/src/app/api/automations/route.ts': `import { NextResponse } from 'next/server'
import { requireAuth } from '@/dal/auth'
import { prisma } from '@repo/db'

export async function GET(req: Request) {
  try {
    const user = await requireAuth()
    const automations = await prisma.automation.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(automations)
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    const { type, name, config, active } = body

    if (!type || !name || !config) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    const automation = await prisma.automation.create({
      data: {
        userId: user.id,
        type,
        name,
        config,
        status: active ? 'ACTIVE' : 'INACTIVE'
      }
    })
    return NextResponse.json(automation)
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 })
  }
}`,

    'apps/web/src/app/api/automations/[id]/route.ts': `import { NextResponse } from 'next/server'
import { requireAuth } from '@/dal/auth'
import { prisma } from '@repo/db'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth()
    const automation = await prisma.automation.findFirst({
      where: { id: params.id, userId: user.id }
    })
    if (!automation) return new NextResponse('Not found', { status: 404 })
    return NextResponse.json(automation)
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    
    const existing = await prisma.automation.findFirst({
      where: { id: params.id, userId: user.id }
    })
    if (!existing) return new NextResponse('Not found', { status: 404 })

    const automation = await prisma.automation.update({
      where: { id: params.id },
      data: body
    })
    return NextResponse.json(automation)
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth()
    const existing = await prisma.automation.findFirst({
      where: { id: params.id, userId: user.id }
    })
    if (!existing) return new NextResponse('Not found', { status: 404 })

    await prisma.automation.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 })
  }
}`,

    'apps/web/src/app/api/interviews/route.ts': `import { NextResponse } from 'next/server'
import { requireAuth } from '@/dal/auth'
import { prisma } from '@repo/db'

export async function GET(req: Request) {
  try {
    const user = await requireAuth()
    const interviews = await prisma.interviewRecord.findMany({
      where: { application: { userId: user.id } },
      include: { application: { include: { job: true } } },
      orderBy: { scheduledAt: 'asc' }
    })
    return NextResponse.json(interviews)
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    
    const { applicationId, scheduledAt, type, round } = body
    
    const app = await prisma.application.findFirst({
      where: { id: applicationId, userId: user.id }
    })
    if (!app) return new NextResponse('Application not found', { status: 404 })

    const interview = await prisma.interviewRecord.create({
      data: {
        applicationId,
        scheduledAt: new Date(scheduledAt),
        type,
        round
      }
    })
    return NextResponse.json(interview)
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 })
  }
}`,

    'apps/web/src/lib/ai/job-matcher.ts': `import { anthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'

export async function analyzeJobMatch(job: any, careerProfile: any) {
  const prompt = \`Analyze the compatibility between this job and the candidate's career profile.
Job: \${JSON.stringify(job)}
Profile: \${JSON.stringify(careerProfile)}

Return a JSON object with:
- score: number (0-100)
- skillMatches: string[]
- skillGaps: string[]
- experienceMatch: string (brief explanation)
- salaryMatch: string (brief explanation)
- explanation: string (overall summary)
Only return the raw JSON object.\`

  try {
    const { text } = await generateText({
      model: anthropic('claude-sonnet-4-5-20250929'),
      prompt,
    })
    const rawJson = text.replace(/^\\\`\\\`\\\`(json)?/, '').replace(/\\\`\\\`\\\`$/, '').trim()
    return JSON.parse(rawJson)
  } catch (e) {
    console.error('AI match analysis failed', e)
    throw e
  }
}`,

    'apps/web/src/lib/ai/resume-optimizer.ts': `import { anthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'

export async function optimizeResume(resumeText: string, jobDescription: string) {
  const prompt = \`Optimize this resume for this job description to maximize ATS score.
Resume: \${resumeText}
Job: \${jobDescription}

Return a JSON object with:
- optimizedResume: string (the full optimized text)
- keywords: string[] (keywords added)
- improvements: string[] (list of changes made)
Only return the raw JSON object.\`

  try {
    const { text } = await generateText({
      model: anthropic('claude-sonnet-4-5-20250929'),
      prompt,
    })
    const rawJson = text.replace(/^\\\`\\\`\\\`(json)?/, '').replace(/\\\`\\\`\\\`$/, '').trim()
    return JSON.parse(rawJson)
  } catch (e) {
    console.error('AI resume optimization failed', e)
    throw e
  }
}

export async function generateCoverLetter(resumeText: string, jobDescription: string, companyName: string) {
  const prompt = \`Write a compelling cover letter for \${companyName} based on this resume and job description.
Resume: \${resumeText}
Job: \${jobDescription}

Return a JSON object with:
- coverLetter: string (the letter content)
Only return the raw JSON object.\`

  try {
    const { text } = await generateText({
      model: anthropic('claude-sonnet-4-5-20250929'),
      prompt,
    })
    const rawJson = text.replace(/^\\\`\\\`\\\`(json)?/, '').replace(/\\\`\\\`\\\`$/, '').trim()
    return JSON.parse(rawJson).coverLetter || text
  } catch (e) {
    console.error('AI cover letter generation failed', e)
    throw e
  }
}`,

    'apps/web/src/lib/ai/interview-coach.ts': `import { anthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'

export async function generateInterviewPrep(job: any, careerProfile: any) {
  const prompt = \`Create a full interview prep report for this candidate and job.
Job: \${JSON.stringify(job)}
Profile: \${JSON.stringify(careerProfile)}

Return a JSON object with:
- prepReport: string (summary strategy)
- mockQuestions: string[] (5 likely questions)
- suggestedAnswers: string[] (answers for those questions)
- companyResearch: string (key facts about company, assuming generic if not specified)
- technicalTopics: string[] (topics to brush up on)
Only return the raw JSON object.\`

  try {
    const { text } = await generateText({
      model: anthropic('claude-sonnet-4-5-20250929'),
      prompt,
    })
    const rawJson = text.replace(/^\\\`\\\`\\\`(json)?/, '').replace(/\\\`\\\`\\\`$/, '').trim()
    return JSON.parse(rawJson)
  } catch (e) {
    console.error('AI interview prep generation failed', e)
    throw e
  }
}`,

    'apps/web/src/lib/ai/email-classifier.ts': `import { anthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'

export async function classifyEmail(subject: string, body: string) {
  const prompt = \`Classify this email related to a job application.
Subject: \${subject}
Body: \${body}

Return a JSON object with:
- category: string ('INTERVIEW', 'REJECTION', 'OFFER', 'UPDATE', 'OTHER')
- summary: string (brief summary)
- actionRequired: boolean
- deadline: string (ISO date if found, or null)
- priority: string ('HIGH', 'MEDIUM', 'LOW')
Only return the raw JSON object.\`

  try {
    const { text } = await generateText({
      model: anthropic('claude-sonnet-4-5-20250929'),
      prompt,
    })
    const rawJson = text.replace(/^\\\`\\\`\\\`(json)?/, '').replace(/\\\`\\\`\\\`$/, '').trim()
    return JSON.parse(rawJson)
  } catch (e) {
    console.error('AI email classification failed', e)
    throw e
  }
}`
};

for (const [relPath, content] of Object.entries(files)) {
    const fullPath = path.join(root, relPath);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(\`Created \${fullPath}\`);
}
