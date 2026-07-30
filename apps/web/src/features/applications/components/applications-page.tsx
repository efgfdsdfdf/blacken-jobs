"use client"

import { useState } from "react"
import { LayoutGrid, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ApplicationBoard } from "./application-board"
import { ApplicationTimeline } from "./application-timeline"
import { Card, CardContent } from "@/components/ui/card"

export function ApplicationsPage({ initialApplications }: { initialApplications: any[] }) {
  const [view, setView] = useState<"kanban" | "list">("kanban")

  const stats = {
    total: initialApplications.length,
    applied: initialApplications.filter(a => a.status === "APPLIED").length,
    underReview: initialApplications.filter(a => a.status === "UNDER_REVIEW").length,
    interviewing: initialApplications.filter(a => a.status === "INTERVIEWING").length,
    assessment: initialApplications.filter(a => a.status === "ASSESSMENT").length,
    offers: initialApplications.filter(a => a.status === "OFFER").length,
    rejections: initialApplications.filter(a => a.status === "REJECTED").length,
  }

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Applications</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Track and manage your job applications across all stages.</p>
        </div>
        <div className="flex items-center gap-2 bg-background/40 backdrop-blur-md border border-white/5 p-1 rounded-xl glass-card">
          <Button
            variant={view === "kanban" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setView("kanban")}
            className={`rounded-lg ${view === "kanban" ? "bg-primary/20 text-primary" : "text-muted-foreground"}`}
          >
            <LayoutGrid className="w-4 h-4 mr-2" />
            Kanban
          </Button>
          <Button
            variant={view === "list" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setView("list")}
            className={`rounded-lg ${view === "list" ? "bg-primary/20 text-primary" : "text-muted-foreground"}`}
          >
            <List className="w-4 h-4 mr-2" />
            List
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {[
          { label: "Total", value: stats.total, color: "text-white" },
          { label: "Applied", value: stats.applied, color: "text-blue-400" },
          { label: "Under Review", value: stats.underReview, color: "text-yellow-400" },
          { label: "Interviewing", value: stats.interviewing, color: "text-purple-400" },
          { label: "Assessment", value: stats.assessment, color: "text-orange-400" },
          { label: "Offers", value: stats.offers, color: "text-green-400" },
          { label: "Rejected", value: stats.rejections, color: "text-red-400" },
        ].map((stat, i) => (
          <Card key={i} className="glass-card bg-background/40 backdrop-blur-md border-white/5 hover:bg-background/60 transition-colors animate-slide-in-up" style={{ animationDelay: `${i * 50}ms` }}>
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <span className={`text-2xl font-bold ${stat.color}`}>{stat.value}</span>
              <span className="text-xs text-muted-foreground mt-1 font-medium uppercase tracking-wider">{stat.label}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex-1 min-h-0">
        {view === "kanban" ? (
          <ApplicationBoard applications={initialApplications} />
        ) : (
          <div className="glass-card rounded-xl border border-white/5 bg-background/40 backdrop-blur-md p-6 flex items-center justify-center min-h-[400px]">
             <p className="text-muted-foreground">List view coming soon.</p>
          </div>
        )}
      </div>
    </div>
  )
}
