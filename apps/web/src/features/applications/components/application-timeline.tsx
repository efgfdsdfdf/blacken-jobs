"use client"

import { CheckCircle2, Clock, Circle, ArrowRight } from "lucide-react"

type StatusHistoryItem = {
  id: string
  status: string
  previousStatus?: string
  date: string
  note?: string
}

export function ApplicationTimeline({ history }: { history: StatusHistoryItem[] }) {
  if (!history || history.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-4">
        No history available for this application.
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPLIED": return "text-blue-500 bg-blue-500/10 border-blue-500/20"
      case "UNDER_REVIEW": return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20"
      case "INTERVIEWING": return "text-purple-500 bg-purple-500/10 border-purple-500/20"
      case "ASSESSMENT": return "text-orange-500 bg-orange-500/10 border-orange-500/20"
      case "OFFER": return "text-green-500 bg-green-500/10 border-green-500/20"
      case "REJECTED": return "text-red-500 bg-red-500/10 border-red-500/20"
      default: return "text-primary bg-primary/10 border-primary/20"
    }
  }

  return (
    <div className="relative border-l border-white/10 ml-3 space-y-6 mt-4">
      {history.map((item, index) => {
        const isLast = index === history.length - 1
        const isFirst = index === 0
        const colorClass = getStatusColor(item.status)
        
        return (
          <div key={item.id} className="relative pl-6 animate-slide-in-up" style={{ animationDelay: `${index * 100}ms` }}>
            {/* Timeline Dot */}
            <div className={`absolute -left-3 top-0 flex h-6 w-6 items-center justify-center rounded-full border bg-background ${colorClass}`}>
              {isFirst ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : (
                <Circle className="h-2 w-2 fill-current" />
              )}
            </div>

            {/* Content */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    {item.status.replace("_", " ")}
                  </span>
                  {item.previousStatus && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-white/5 px-2 py-0.5 rounded-full">
                      <span>{item.previousStatus.replace("_", " ")}</span>
                      <ArrowRight className="w-3 h-3" />
                      <span>{item.status.replace("_", " ")}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <time dateTime={item.date}>
                    {new Date(item.date).toLocaleDateString(undefined, { 
                      month: 'short', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </time>
                </div>
              </div>
              
              {item.note && (
                <div className="mt-2 text-sm text-muted-foreground bg-white/5 p-3 rounded-lg border border-white/5">
                  {item.note}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
