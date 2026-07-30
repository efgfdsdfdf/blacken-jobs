"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, Calendar, MoreHorizontal, Zap } from "lucide-react"

type Stage = {
  id: string
  label: string
  color: string
  badgeColor: string
  borderColor: string
}

const STAGES: Stage[] = [
  { id: "APPLIED", label: "Applied", color: "bg-blue-500/10", badgeColor: "bg-blue-500/20 text-blue-400", borderColor: "border-blue-500/20" },
  { id: "UNDER_REVIEW", label: "Under Review", color: "bg-yellow-500/10", badgeColor: "bg-yellow-500/20 text-yellow-400", borderColor: "border-yellow-500/20" },
  { id: "INTERVIEWING", label: "Interviewing", color: "bg-purple-500/10", badgeColor: "bg-purple-500/20 text-purple-400", borderColor: "border-purple-500/20" },
  { id: "ASSESSMENT", label: "Assessment", color: "bg-orange-500/10", badgeColor: "bg-orange-500/20 text-orange-400", borderColor: "border-orange-500/20" },
  { id: "OFFER", label: "Offer", color: "bg-green-500/10", badgeColor: "bg-green-500/20 text-green-400", borderColor: "border-green-500/20" },
  { id: "REJECTED", label: "Rejected", color: "bg-red-500/10", badgeColor: "bg-red-500/20 text-red-400", borderColor: "border-red-500/20" },
]

export function ApplicationBoard({ applications }: { applications: any[] }) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory min-h-[600px] h-[calc(100vh-250px)]">
      {STAGES.map((stage) => {
        const stageApps = applications.filter((app) => (app.status || "APPLIED") === stage.id)
        
        return (
          <div key={stage.id} className="flex-shrink-0 w-[320px] snap-center flex flex-col gap-3">
            <div className={`flex items-center justify-between p-3 rounded-lg border ${stage.borderColor} ${stage.color} backdrop-blur-sm`}>
              <h3 className="font-semibold text-sm tracking-wide">{stage.label}</h3>
              <Badge variant="secondary" className={`${stage.badgeColor} border-none font-bold`}>
                {stageApps.length}
              </Badge>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-4 custom-scrollbar">
              {stageApps.map((app) => (
                <Card 
                  key={app.id} 
                  className="glass-card bg-zinc-950/50 backdrop-blur-md border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] cursor-pointer group hover:-translate-y-1"
                >
                  <CardContent className="p-4 flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                          <Building2 className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm line-clamp-1 leading-tight group-hover:text-primary transition-colors">{app.job?.company || "Unknown Company"}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{app.job?.title || "Unknown Title"}</p>
                        </div>
                      </div>
                      <button className="text-muted-foreground/50 hover:text-white transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2 pt-3 border-t border-white/5">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                          {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Unknown'}
                        </span>
                      </div>
                      
                      {app.job?.matchScore && (
                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px] px-1.5 py-0 shadow-[0_0_10px_rgba(var(--primary),0.1)]">
                          <Zap className="w-3 h-3 mr-1 fill-primary/50" />
                          {app.job.matchScore}% Match
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {stageApps.length === 0 && (
                <div className="h-24 border border-dashed border-white/10 rounded-xl flex items-center justify-center bg-white/[0.02]">
                  <p className="text-xs text-muted-foreground">No applications</p>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
