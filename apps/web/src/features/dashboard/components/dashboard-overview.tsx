"use client"

import * as React from "react"
import { 
  Briefcase, 
  Send, 
  Users, 
  Trophy, 
  XCircle, 
  TrendingUp, 
  Bot, 
  Clock,
  ChevronRight,
  Sparkles,
  Building2,
  MapPin,
  Zap,
  Calendar
} from "lucide-react"
import Link from "next/link"

interface DashboardStats {
  jobsFound: number
  jobsApplied: number
  interviewing: number
  offers: number
  rejections: number
  responseRate: number
}

interface DashboardOverviewProps {
  stats: DashboardStats
  recentJobs: any[]
  upcomingInterviews: any[]
  recentApplications: any[]
  activeAutomations: any[]
}

function StatCard({ label, value, icon: Icon, color, trend }: { 
  label: string; value: number | string; icon: any; color: string; trend?: string 
}) {
  const colorMap: Record<string, string> = {
    blue: "from-blue-500/20 to-blue-600/5 border-blue-500/20 text-blue-400",
    green: "from-emerald-500/20 to-emerald-600/5 border-emerald-500/20 text-emerald-400",
    purple: "from-purple-500/20 to-purple-600/5 border-purple-500/20 text-purple-400",
    yellow: "from-amber-500/20 to-amber-600/5 border-amber-500/20 text-amber-400",
    red: "from-red-500/20 to-red-600/5 border-red-500/20 text-red-400",
    cyan: "from-cyan-500/20 to-cyan-600/5 border-cyan-500/20 text-cyan-400",
  }

  const iconColorMap: Record<string, string> = {
    blue: "text-blue-400 bg-blue-500/10",
    green: "text-emerald-400 bg-emerald-500/10",
    purple: "text-purple-400 bg-purple-500/10",
    yellow: "text-amber-400 bg-amber-500/10",
    red: "text-red-400 bg-red-500/10",
    cyan: "text-cyan-400 bg-cyan-500/10",
  }

  return (
    <div className={`relative overflow-hidden rounded-xl border bg-gradient-to-br ${colorMap[color]} p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group`}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">{label}</p>
          <p className="text-3xl font-bold text-zinc-100">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 text-xs text-emerald-400">
              <TrendingUp className="h-3 w-3" />
              {trend}
            </div>
          )}
        </div>
        <div className={`rounded-xl p-2.5 ${iconColorMap[color]} transition-transform duration-300 group-hover:scale-110`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {/* Decorative glow */}
      <div className={`absolute -bottom-4 -right-4 h-24 w-24 rounded-full blur-2xl opacity-20 ${color === 'blue' ? 'bg-blue-500' : color === 'green' ? 'bg-emerald-500' : color === 'purple' ? 'bg-purple-500' : color === 'yellow' ? 'bg-amber-500' : color === 'red' ? 'bg-red-500' : 'bg-cyan-500'}`} />
    </div>
  )
}

export function DashboardOverview({ stats, recentJobs, upcomingInterviews, recentApplications, activeAutomations }: DashboardOverviewProps) {
  return (
    <div className="space-y-8 p-4 md:p-0 animate-fade-in">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-r from-zinc-900/80 via-zinc-900/60 to-primary/5 p-8 backdrop-blur-md">
        <div className="relative z-10">
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
            Job Hunter Dashboard
          </h1>
          <p className="mt-2 text-zinc-400 max-w-2xl">
            Your AI-powered career assistant is working around the clock to find your perfect role. 
            Here's your latest overview.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Jobs Found" value={stats.jobsFound} icon={Briefcase} color="blue" />
        <StatCard label="Applied" value={stats.jobsApplied} icon={Send} color="purple" />
        <StatCard label="Interviewing" value={stats.interviewing} icon={Users} color="cyan" />
        <StatCard label="Offers" value={stats.offers} icon={Trophy} color="green" />
        <StatCard label="Rejections" value={stats.rejections} icon={XCircle} color="red" />
        <StatCard label="Response Rate" value={`${stats.responseRate}%`} icon={TrendingUp} color="yellow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Jobs */}
        <div className="rounded-xl border border-white/5 bg-zinc-900/40 backdrop-blur-md overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-white/5">
            <h2 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary" />
              Recent Jobs Found
            </h2>
            <Link href="/jobs" className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
              View All <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {recentJobs.length === 0 ? (
              <div className="p-8 text-center">
                <Briefcase className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
                <p className="text-sm text-zinc-500">No jobs found yet</p>
                <p className="text-xs text-zinc-600 mt-1">Set up your career profile and start searching!</p>
              </div>
            ) : (
              recentJobs.map((job) => (
                <div key={job.id} className="flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-colors">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 font-semibold text-sm border border-white/5">
                    {job.company.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-200 truncate">{job.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-zinc-500 flex items-center gap-1">
                        <Building2 className="h-3 w-3" /> {job.company}
                      </span>
                      {job.location && (
                        <span className="text-xs text-zinc-500 flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {job.location}
                        </span>
                      )}
                    </div>
                  </div>
                  {job.matchScore && (
                    <div className={`text-xs font-bold px-2 py-1 rounded-md ${
                      job.matchScore >= 70 ? 'bg-emerald-500/10 text-emerald-400' :
                      job.matchScore >= 40 ? 'bg-amber-500/10 text-amber-400' :
                      'bg-red-500/10 text-red-400'
                    }`}>
                      {job.matchScore}%
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Interviews */}
        <div className="rounded-xl border border-white/5 bg-zinc-900/40 backdrop-blur-md overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-white/5">
            <h2 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-400" />
              Upcoming Interviews
            </h2>
            <Link href="/interviews" className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
              View All <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {upcomingInterviews.length === 0 ? (
              <div className="p-8 text-center">
                <Calendar className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
                <p className="text-sm text-zinc-500">No upcoming interviews</p>
                <p className="text-xs text-zinc-600 mt-1">Apply to jobs and we'll track interview invites!</p>
              </div>
            ) : (
              upcomingInterviews.map((interview) => (
                <div key={interview.id} className="flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-colors">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <Users className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-200 truncate">
                      {interview.application?.job?.title || "Interview"}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {interview.application?.job?.company} • {interview.format || "TBD"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-zinc-300">
                      {interview.scheduledAt ? new Date(interview.scheduledAt).toLocaleDateString() : "TBD"}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {interview.scheduledAt ? new Date(interview.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Applications */}
        <div className="rounded-xl border border-white/5 bg-zinc-900/40 backdrop-blur-md overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-white/5">
            <h2 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
              <Send className="h-4 w-4 text-cyan-400" />
              Recent Applications
            </h2>
            <Link href="/applications" className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
              View All <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {recentApplications.length === 0 ? (
              <div className="p-8 text-center">
                <Send className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
                <p className="text-sm text-zinc-500">No applications yet</p>
                <p className="text-xs text-zinc-600 mt-1">Start applying to jobs to track your progress!</p>
              </div>
            ) : (
              recentApplications.map((app) => {
                const statusColors: Record<string, string> = {
                  APPLIED: "bg-blue-500/10 text-blue-400",
                  UNDER_REVIEW: "bg-yellow-500/10 text-yellow-400",
                  INTERVIEWING: "bg-purple-500/10 text-purple-400",
                  ASSESSMENT: "bg-orange-500/10 text-orange-400",
                  OFFER: "bg-emerald-500/10 text-emerald-400",
                  REJECTED: "bg-red-500/10 text-red-400",
                }
                return (
                  <div key={app.id} className="flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-colors">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 font-semibold text-sm border border-white/5">
                      {app.job?.company?.charAt(0) || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-200 truncate">{app.job?.title}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{app.job?.company}</p>
                    </div>
                    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-md ${statusColors[app.status] || statusColors.APPLIED}`}>
                      {app.status.replace("_", " ")}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Active Automations */}
        <div className="rounded-xl border border-white/5 bg-zinc-900/40 backdrop-blur-md overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-white/5">
            <h2 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-400" />
              Active Automations
            </h2>
            <Link href="/automation" className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
              Manage <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {activeAutomations.length === 0 ? (
              <div className="p-8 text-center">
                <Bot className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
                <p className="text-sm text-zinc-500">No active automations</p>
                <p className="text-xs text-zinc-600 mt-1">Set up automation to search for jobs automatically!</p>
              </div>
            ) : (
              activeAutomations.map((auto) => (
                <div key={auto.id} className="flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-colors">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-200 truncate">{auto.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-zinc-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Every {auto.intervalMinutes}min
                      </span>
                      <span className="text-xs text-emerald-400">● Active</span>
                    </div>
                  </div>
                  <div className="text-right text-xs text-zinc-500">
                    {auto.totalJobsFound} found<br/>
                    {auto.totalApplied} applied
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
