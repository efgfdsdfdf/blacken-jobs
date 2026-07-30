import { NextResponse } from 'next/server'
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
}
