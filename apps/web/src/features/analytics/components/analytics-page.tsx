"use client"

import { StatCard } from "./stat-card"
import { FunnelChart } from "./funnel-chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, Send, MessageSquare, Mic, Star, Award, TrendingUp, Activity, BarChart3, PieChart } from "lucide-react"

export function AnalyticsPage({ data }: { data: any }) {
  const { overview, funnel, weeklyActivity, topSkills, sources } = data

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">Analytics Dashboard</h1>
        <p className="text-muted-foreground mt-1">Deep dive into your job hunting performance and metrics.</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard label="Jobs Found" value={overview.totalJobsFound} icon={<Briefcase className="w-5 h-5" />} trend="up" trendValue="12%" />
        <StatCard label="Applied" value={overview.totalApplications} icon={<Send className="w-5 h-5" />} trend="up" trendValue="8%" />
        <StatCard label="Response Rate" value={`${overview.responseRate}%`} icon={<MessageSquare className="w-5 h-5" />} trend="up" trendValue="4%" />
        <StatCard label="Interview Rate" value={`${overview.interviewRate}%`} icon={<Mic className="w-5 h-5" />} trend="neutral" trendValue="0%" />
        <StatCard label="Avg Match Score" value={overview.avgMatchScore} icon={<Star className="w-5 h-5 text-yellow-400" />} />
        <StatCard label="Offers" value={overview.offers} icon={<Award className="w-5 h-5 text-green-400" />} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Chart Area */}
        <div className="xl:col-span-2 space-y-6">
          <Card className="glass-card bg-background/40 backdrop-blur-md border-white/5 shadow-2xl">
            <CardHeader className="border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Application Funnel</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <FunnelChart data={funnel} />
            </CardContent>
          </Card>

          <Card className="glass-card bg-background/40 backdrop-blur-md border-white/5 shadow-2xl">
            <CardHeader className="border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Weekly Activity</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[250px] flex items-end gap-2 sm:gap-4 justify-between pt-8">
                {weeklyActivity.map((day: any, i: number) => {
                  const max = Math.max(...weeklyActivity.map((d: any) => d.count), 1)
                  const height = `${(day.count / max) * 100}%`
                  const isMax = day.count === max && day.count > 0
                  
                  return (
                    <div key={i} className="flex flex-col items-center gap-3 w-full group relative">
                      <div className="absolute -top-8 bg-zinc-800 text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        {day.count} applications
                      </div>
                      <div 
                        className={`w-full max-w-[40px] rounded-t-md transition-all duration-500 ${
                          isMax 
                            ? "bg-gradient-to-t from-purple-500/20 to-purple-500 hover:from-purple-500/40 hover:to-purple-400 hover:shadow-[0_0_15px_rgba(168,85,247,0.5)]" 
                            : "bg-gradient-to-t from-primary/20 to-primary/80 hover:from-primary/40 hover:to-primary hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                        }`}
                        style={{ height: height === "0%" ? "5px" : height }}
                      />
                      <span className="text-xs text-muted-foreground uppercase">{day.date}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          <Card className="glass-card bg-background/40 backdrop-blur-md border-white/5 shadow-2xl">
            <CardHeader className="border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Top Skills in Demand</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              {topSkills.map((skill: any, i: number) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{skill.name}</span>
                    <span className="text-muted-foreground">{skill.count} mentions</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary/50 to-primary rounded-full" 
                      style={{ width: `${skill.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="glass-card bg-background/40 backdrop-blur-md border-white/5 shadow-2xl">
            <CardHeader className="border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Sources</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center gap-6">
                <div 
                  className="w-48 h-48 rounded-full border-4 border-white/5 shadow-[0_0_30px_rgba(var(--primary),0.1)] relative overflow-hidden"
                  style={{
                    background: `conic-gradient(
                      ${sources[0].color} 0% ${sources[0].value}%, 
                      ${sources[1].color} ${sources[0].value}% ${sources[0].value + sources[1].value}%, 
                      ${sources[2].color} ${sources[0].value + sources[1].value}% ${sources[0].value + sources[1].value + sources[2].value}%,
                      ${sources[3].color} ${sources[0].value + sources[1].value + sources[2].value}% 100%
                    )`
                  }}
                >
                  <div className="absolute inset-0 bg-background/5 rounded-full backdrop-blur-[1px]"></div>
                  <div className="absolute inset-4 bg-zinc-950 rounded-full flex flex-col items-center justify-center shadow-inner">
                    <span className="text-2xl font-bold">{sources.reduce((a: any, b: any) => a + b.value, 0)}</span>
                    <span className="text-xs text-muted-foreground">Total</span>
                  </div>
                </div>
                
                <div className="w-full grid grid-cols-2 gap-3">
                  {sources.map((source: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: source.color }} />
                      <span className="flex-1">{source.name}</span>
                      <span className="text-muted-foreground">{source.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
