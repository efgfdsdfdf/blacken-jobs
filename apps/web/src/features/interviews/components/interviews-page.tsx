"use client"

import * as React from "react"
import {
  Calendar,
  Clock,
  Video,
  Phone,
  MapPin,
  Building2,
  ChevronRight,
  Brain,
  BookOpen,
  MessageSquare,
  ExternalLink,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface Interview {
  id: string
  scheduledAt: string | null
  duration: number | null
  timezone: string | null
  format: string | null
  meetingLink: string | null
  location: string | null
  stage: string | null
  interviewerName: string | null
  interviewerTitle: string | null
  outcome: string | null
  application: {
    job: {
      title: string
      company: string
      companyLogo: string | null
      location: string | null
    }
  }
}

export function InterviewsPage({ interviews }: { interviews: Interview[] }) {
  const upcoming = interviews.filter(i => i.scheduledAt && new Date(i.scheduledAt) >= new Date())
  const past = interviews.filter(i => !i.scheduledAt || new Date(i.scheduledAt) < new Date())

  const formatIcon = (format: string | null) => {
    switch (format) {
      case "VIDEO": return <Video className="h-4 w-4" />
      case "PHONE": return <Phone className="h-4 w-4" />
      case "ONSITE": return <MapPin className="h-4 w-4" />
      default: return <Calendar className="h-4 w-4" />
    }
  }

  const outcomeColors: Record<string, string> = {
    passed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    failed: "bg-red-500/10 text-red-400 border-red-500/20",
    pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  }

  return (
    <div className="space-y-8 p-4 md:p-0 animate-fade-in">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-r from-zinc-900/80 via-zinc-900/60 to-purple-500/5 p-8 backdrop-blur-md">
        <div className="relative z-10">
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-3">
            <Calendar className="h-6 w-6 text-purple-400" />
            Interview Center
          </h1>
          <p className="mt-2 text-zinc-400">
            Track your interviews, prepare with AI coaching, and monitor outcomes.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {interviews.length > 0 ? (
          <Link 
            href={`/interviews/${interviews[0].id}/prep`}
            className="flex items-center gap-4 p-5 rounded-xl border border-white/5 bg-zinc-900/40 backdrop-blur-md hover:bg-white/[0.03] transition-all group cursor-pointer"
          >
            <div className="rounded-xl p-3 bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
              <Brain className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-zinc-200">AI Mock Interview</p>
              <p className="text-xs text-zinc-500">Practice with AI-generated questions</p>
            </div>
            <ChevronRight className="h-4 w-4 text-zinc-600 ml-auto" />
          </Link>
        ) : (
          <button 
            onClick={() => toast.info("Please schedule an interview for one of your job applications first to practice!")}
            className="flex items-center gap-4 p-5 rounded-xl border border-white/5 bg-zinc-900/40 backdrop-blur-md hover:bg-white/[0.03] transition-all group cursor-pointer text-left w-full"
          >
            <div className="rounded-xl p-3 bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
              <Brain className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-zinc-200">AI Mock Interview</p>
              <p className="text-xs text-zinc-500">Practice with AI-generated questions</p>
            </div>
            <ChevronRight className="h-4 w-4 text-zinc-600 ml-auto" />
          </button>
        )}
        
        <button className="flex items-center gap-4 p-5 rounded-xl border border-white/5 bg-zinc-900/40 backdrop-blur-md hover:bg-white/[0.03] transition-all group">
          <div className="rounded-xl p-3 bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
            <BookOpen className="h-5 w-5" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-zinc-200">Prep Materials</p>
            <p className="text-xs text-zinc-500">Review company research & tips</p>
          </div>
          <ChevronRight className="h-4 w-4 text-zinc-600 ml-auto" />
        </button>
        
        <button className="flex items-center gap-4 p-5 rounded-xl border border-white/5 bg-zinc-900/40 backdrop-blur-md hover:bg-white/[0.03] transition-all group">
          <div className="rounded-xl p-3 bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-zinc-200">Questions to Ask</p>
            <p className="text-xs text-zinc-500">Smart questions for your interviewers</p>
          </div>
          <ChevronRight className="h-4 w-4 text-zinc-600 ml-auto" />
        </button>
      </div>

      {/* Upcoming Interviews */}
      <div>
        <h2 className="text-lg font-semibold text-zinc-200 mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-400" />
          Upcoming Interviews
        </h2>
        {upcoming.length === 0 ? (
          <div className="rounded-xl border border-white/5 bg-zinc-900/40 backdrop-blur-md p-12 text-center">
            <Calendar className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-400 font-medium">No upcoming interviews</p>
            <p className="text-sm text-zinc-600 mt-1">Keep applying — your next interview is just around the corner!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {upcoming.map((interview) => (
              <div key={interview.id} className="rounded-xl border border-white/5 bg-zinc-900/40 backdrop-blur-md p-6 hover:border-purple-500/20 transition-all group">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 text-lg font-bold">
                    {interview.application.job.company.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold text-zinc-100">{interview.application.job.title}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-1">
                      <span className="text-sm text-zinc-400 flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5" /> {interview.application.job.company}
                      </span>
                      {interview.stage && (
                        <span className="text-xs px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-white/5">
                          {interview.stage}
                        </span>
                      )}
                      {interview.format && (
                        <span className="text-xs text-zinc-500 flex items-center gap-1">
                          {formatIcon(interview.format)} {interview.format}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {interview.scheduledAt && (
                      <div className="text-right">
                        <p className="text-sm font-medium text-zinc-200 flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-purple-400" />
                          {new Date(interview.scheduledAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </p>
                        <p className="text-xs text-zinc-500 flex items-center gap-1.5 mt-0.5">
                          <Clock className="h-3 w-3" />
                          {new Date(interview.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {interview.duration && ` · ${interview.duration}min`}
                        </p>
                      </div>
                    )}
                    <div className="flex flex-col gap-2">
                      <Link href={`/interviews/${interview.id}/prep`}>
                        <Button size="sm" className="w-full bg-purple-500/20 text-purple-400 border border-purple-500/20 hover:bg-purple-500/30">
                          <Brain className="h-3.5 w-3.5 mr-1.5" />
                          Practice
                        </Button>
                      </Link>
                      {interview.meetingLink && (
                        <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="outline" className="w-full border-white/5 text-zinc-300">
                            <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                            Join
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                {interview.interviewerName && (
                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-xs text-zinc-500">
                    <span>Interviewer:</span>
                    <span className="text-zinc-300 font-medium">{interview.interviewerName}</span>
                    {interview.interviewerTitle && <span>({interview.interviewerTitle})</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Interviews */}
      {past.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-zinc-200 mb-4">Past Interviews</h2>
          <div className="space-y-3">
            {past.map((interview) => (
              <div key={interview.id} className="rounded-xl border border-white/5 bg-zinc-900/20 p-5 flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-zinc-500 font-semibold text-sm">
                  {interview.application.job.company.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-300 truncate">{interview.application.job.title}</p>
                  <p className="text-xs text-zinc-500">{interview.application.job.company} · {interview.stage || "Interview"}</p>
                </div>
                {interview.outcome && (
                  <span className={`text-xs font-semibold uppercase px-2.5 py-1 rounded-md border ${outcomeColors[interview.outcome] || outcomeColors.pending}`}>
                    {interview.outcome}
                  </span>
                )}
                {interview.scheduledAt && (
                  <span className="text-xs text-zinc-600">
                    {new Date(interview.scheduledAt).toLocaleDateString()}
                  </span>
                )}
                <div className="ml-auto">
                  <Link href={`/interviews/${interview.id}/prep`}>
                    <Button size="sm" className="bg-purple-500/20 text-purple-400 border border-purple-500/20 hover:bg-purple-500/30">
                      <Brain className="h-3.5 w-3.5 mr-1.5" />
                      Practice
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
