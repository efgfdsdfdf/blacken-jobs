"use client"

import * as React from "react"
import {
  Mail,
  AlertCircle,
  Calendar,
  MessageSquare,
  Trophy,
  XCircle,
  FileCode,
  Link2,
  Clock,
  Filter,
  ArrowUpRight,
  Sparkles,
  Shield,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmailItem {
  id: string
  from: string
  subject: string
  body: string | null
  receivedAt: string
  category: string
  priority: string | null
  aiSummary: string | null
  actionRequired: string | null
  deadline: string | null
  isProcessed: boolean
}

interface ConnectedAccount {
  id: string
  platform: string
  isActive: boolean
  lastSyncAt: string | null
}

const categoryConfig: Record<string, { icon: any; color: string; label: string }> = {
  INTERVIEW_INVITATION: { icon: Calendar, color: "text-purple-400 bg-purple-500/10 border-purple-500/20", label: "Interview" },
  RECRUITER_MESSAGE: { icon: MessageSquare, color: "text-blue-400 bg-blue-500/10 border-blue-500/20", label: "Recruiter" },
  ASSESSMENT_LINK: { icon: FileCode, color: "text-orange-400 bg-orange-500/10 border-orange-500/20", label: "Assessment" },
  OFFER_LETTER: { icon: Trophy, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", label: "Offer" },
  REJECTION: { icon: XCircle, color: "text-red-400 bg-red-500/10 border-red-500/20", label: "Rejection" },
  FOLLOW_UP: { icon: ArrowUpRight, color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20", label: "Follow Up" },
  GENERAL: { icon: Mail, color: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20", label: "General" },
  SPAM: { icon: Shield, color: "text-zinc-600 bg-zinc-700/10 border-zinc-700/20", label: "Spam" },
}

const priorityColors: Record<string, string> = {
  high: "text-red-400 bg-red-500/10",
  medium: "text-amber-400 bg-amber-500/10",
  low: "text-zinc-500 bg-zinc-700/10",
}

export function EmailMonitorPage({ emails, connectedAccounts }: { emails: EmailItem[]; connectedAccounts: ConnectedAccount[] }) {
  const [filter, setFilter] = React.useState("ALL")
  const [selectedEmail, setSelectedEmail] = React.useState<EmailItem | null>(null)

  const filtered = filter === "ALL" ? emails : emails.filter(e => e.category === filter)

  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = {}
    emails.forEach(e => {
      counts[e.category] = (counts[e.category] || 0) + 1
    })
    return counts
  }, [emails])

  return (
    <div className="space-y-8 p-4 md:p-0 animate-fade-in">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-r from-zinc-900/80 via-zinc-900/60 to-blue-500/5 p-8 backdrop-blur-md">
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-3">
              <Mail className="h-6 w-6 text-blue-400" />
              Email Monitor
            </h1>
            <p className="mt-2 text-zinc-400">
              AI-powered email monitoring that detects interview invitations, offers, rejections, and more.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {connectedAccounts.length > 0 ? (
              <div className="flex items-center gap-2">
                {connectedAccounts.map(acc => (
                  <span key={acc.id} className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {acc.platform} Connected
                  </span>
                ))}
              </div>
            ) : (
              <Button className="bg-blue-500/20 text-blue-400 border border-blue-500/20 hover:bg-blue-500/30">
                <Link2 className="h-4 w-4 mr-2" />
                Connect Email
              </Button>
            )}
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      </div>

      {/* Category Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <button
          onClick={() => setFilter("ALL")}
          className={`rounded-lg border p-3 text-center transition-all ${
            filter === "ALL" ? "border-primary/30 bg-primary/5" : "border-white/5 bg-zinc-900/40 hover:bg-white/[0.02]"
          }`}
        >
          <p className="text-lg font-bold text-zinc-200">{emails.length}</p>
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider">All</p>
        </button>
        {Object.entries(categoryConfig).filter(([k]) => k !== "SPAM").map(([key, config]) => {
          const Icon = config.icon
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`rounded-lg border p-3 text-center transition-all ${
                filter === key ? "border-primary/30 bg-primary/5" : "border-white/5 bg-zinc-900/40 hover:bg-white/[0.02]"
              }`}
            >
              <p className="text-lg font-bold text-zinc-200">{categoryCounts[key] || 0}</p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{config.label}</p>
            </button>
          )
        })}
      </div>

      {/* Email List */}
      <div className="flex gap-6">
        <div className={`flex-1 space-y-2 ${selectedEmail ? 'hidden md:block md:max-w-md' : ''}`}>
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-white/5 bg-zinc-900/40 backdrop-blur-md p-12 text-center">
              <Mail className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-400 font-medium">No emails in this category</p>
              <p className="text-sm text-zinc-600 mt-1">Connect your email to start monitoring recruiter responses</p>
            </div>
          ) : (
            filtered.map((email) => {
              const config = categoryConfig[email.category] || categoryConfig.GENERAL
              const Icon = config.icon
              return (
                <div
                  key={email.id}
                  onClick={() => setSelectedEmail(email)}
                  className={`rounded-xl border bg-zinc-900/40 backdrop-blur-md p-4 transition-all cursor-pointer hover:border-white/10 ${
                    selectedEmail?.id === email.id ? "border-primary/30 ring-1 ring-primary/20" : "border-white/5"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${config.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-zinc-200 truncate">{email.subject}</p>
                        {email.priority && (
                          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${priorityColors[email.priority] || priorityColors.low}`}>
                            {email.priority}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5">{email.from}</p>
                      {email.aiSummary && (
                        <p className="text-xs text-zinc-400 mt-1.5 line-clamp-2 flex items-start gap-1">
                          <Sparkles className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                          {email.aiSummary}
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[10px] text-zinc-600">{new Date(email.receivedAt).toLocaleDateString()}</p>
                      {email.deadline && (
                        <p className="text-[10px] text-red-400 flex items-center gap-0.5 mt-1">
                          <Clock className="h-2.5 w-2.5" /> Deadline
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Detail Panel */}
        {selectedEmail && (
          <div className="flex-1 rounded-xl border border-white/5 bg-zinc-900/40 backdrop-blur-md p-6 space-y-4 animate-fade-in">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-lg font-semibold text-zinc-100">{selectedEmail.subject}</p>
                <p className="text-sm text-zinc-500 mt-1">From: {selectedEmail.from}</p>
                <p className="text-xs text-zinc-600 mt-0.5">
                  {new Date(selectedEmail.receivedAt).toLocaleString()}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedEmail(null)} className="text-zinc-500">
                Close
              </Button>
            </div>

            {/* AI Summary */}
            {selectedEmail.aiSummary && (
              <div className="rounded-lg bg-primary/5 border border-primary/10 p-4">
                <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" /> AI Summary
                </p>
                <p className="text-sm text-zinc-300">{selectedEmail.aiSummary}</p>
              </div>
            )}

            {/* Action Required */}
            {selectedEmail.actionRequired && (
              <div className="rounded-lg bg-amber-500/5 border border-amber-500/10 p-4">
                <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5" /> Action Required
                </p>
                <p className="text-sm text-zinc-300">{selectedEmail.actionRequired}</p>
                {selectedEmail.deadline && (
                  <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Deadline: {new Date(selectedEmail.deadline).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}

            {/* Email Body */}
            <div className="rounded-lg bg-zinc-800/40 p-4 max-h-96 overflow-y-auto">
              <pre className="text-xs text-zinc-400 whitespace-pre-wrap">{selectedEmail.body || "No body content available"}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
