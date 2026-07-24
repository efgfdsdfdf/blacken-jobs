import { requireAuth } from "@/dal/auth";
import { getUserProfile } from "@/dal/user";
import { prisma } from "@repo/db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Code2,
  MessageSquare,
  CheckCircle,
  Briefcase,
  Plus,
  Search,
  Globe,
  Activity,
  Bot,
  Zap,
  ChevronRight
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { AutoRefresher } from "@/components/common/auto-refresher";

export const metadata: Metadata = {
  title: "Dashboard — BLACK AI",
  description: "Your AI-powered development command center.",
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const session = await requireAuth();
  const profile = await getUserProfile(session.id);

  const firstName = profile?.profile?.firstName ?? "there";
  const greeting = getGreeting();

  const [projectCount, chatCount, jobCount, logsCount, recentLogs] = await Promise.all([
    prisma.job.count({ where: { userId: session.id } }), // Assuming projects are jobs or we just use jobs
    prisma.chat.count({ where: { userId: session.id } }),
    prisma.job.count({ where: { userId: session.id, status: "APPLIED" } }),
    prisma.auditLog.count({ where: { actorId: session.id } }),
    prisma.auditLog.findMany({
      where: { actorId: session.id },
      orderBy: { createdAt: "desc" },
      take: 5
    })
  ]);

  // Stat cards — connected to real data
  const stats = [
    {
      name: "Total Jobs Found",
      value: projectCount.toString(),
      icon: Code2,
      trend: "Live net scraping active",
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20"
    },
    {
      name: "AI Chats",
      value: chatCount.toString(),
      icon: MessageSquare,
      trend: "Conversations with BLACK AI",
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20"
    },
    {
      name: "Agent Actions",
      value: logsCount.toString(),
      icon: Activity,
      trend: "Total autonomous tasks",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20"
    },
    {
      name: "Jobs Applied",
      value: jobCount.toString(),
      icon: Briefcase,
      trend: "Auto-submitted apps",
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20"
    },
  ];

  return (
    <div className="flex flex-col gap-8 animate-fade-in relative z-10 p-6 md:p-8">
      <AutoRefresher intervalMs={5000} />
      
      {/* Welcome Section */}
      <div className="relative">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/20 rounded-full blur-[80px] pointer-events-none" />
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-zinc-100 to-zinc-500 bg-clip-text text-transparent">
          {greeting}, {firstName}
        </h1>
        <p className="text-zinc-400 mt-2 text-lg">
          Your autonomous agents are online and monitoring the web.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="glass-card overflow-hidden group border-white/5 hover:border-white/10 transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-zinc-300">
                {stat.name}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bg} ${stat.color} ${stat.border} border transition-colors duration-300 group-hover:scale-110`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-zinc-100">{stat.value}</div>
              <p className="text-xs text-zinc-500 mt-1 font-medium">
                {stat.trend}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions & Activity Feed */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card className="col-span-1 border-primary/20 bg-gradient-to-br from-zinc-950 to-primary/5 shadow-[0_0_30px_rgba(59,130,246,0.1)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[50px] pointer-events-none group-hover:bg-primary/20 transition-all duration-500" />
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Command Center
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Launch a new task instantly.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Link href="/chat/new">
              <Button className="w-full justify-start h-12 bg-zinc-900/50 hover:bg-zinc-800 border border-white/5 text-zinc-200" variant="outline">
                <MessageSquare className="mr-3 h-5 w-5 text-primary" />
                New AI Chat
              </Button>
            </Link>
            <Link href="/automation">
              <Button className="w-full justify-start h-12 bg-zinc-900/50 hover:bg-zinc-800 border border-white/5 text-zinc-200" variant="outline">
                <Bot className="mr-3 h-5 w-5 text-green-500" />
                Configure Job Agent
              </Button>
            </Link>
            <Link href="/projects">
              <Button className="w-full justify-start h-12 bg-zinc-900/50 hover:bg-zinc-800 border border-white/5 text-zinc-200" variant="outline">
                <Code2 className="mr-3 h-5 w-5 text-purple-500" />
                View Built Projects
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card className="col-span-1 lg:col-span-2 glass-card border-white/5 shadow-xl">
          <CardHeader className="border-b border-white/5 pb-4">
            <CardTitle className="text-xl flex items-center gap-2">
              <Activity className="w-5 h-5 text-zinc-400" />
              Live Agent Feed
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Real-time logs from your autonomous systems.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {recentLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 border border-white/5 mb-4 shadow-inner">
                  <CheckCircle className="h-7 w-7 text-zinc-600" />
                </div>
                <p className="text-base font-semibold text-zinc-300">All systems quiet</p>
                <p className="text-sm text-zinc-500 mt-1 max-w-xs">
                  Trigger an agent run or start a chat to see live activity here.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {recentLogs.map((log, index) => (
                  <div key={log.id} className="flex gap-4 relative animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                    {/* Timeline Line */}
                    {index !== recentLogs.length - 1 && (
                      <div className="absolute top-8 left-[19px] bottom-[-24px] w-px bg-white/5" />
                    )}
                    
                    <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-900 border border-white/10 shadow-inner">
                      {log.action === "CREATE" ? <Plus className="h-4 w-4 text-primary" /> : 
                       log.action === "UPDATE" ? <CheckCircle className="h-4 w-4 text-green-500" /> : 
                       <Activity className="h-4 w-4 text-zinc-400" />}
                    </div>
                    <div className="flex flex-col pt-1">
                      <p className="text-sm font-medium text-zinc-200">
                        {log.entity}
                      </p>
                      <p className="text-sm text-zinc-500 mt-0.5 leading-relaxed">
                        {(log.metadata as any)?.message || `${log.action} performed on ${log.entity}`}
                      </p>
                      <span className="text-xs text-zinc-600 mt-1">
                        {new Date(log.createdAt).toLocaleString(undefined, { 
                          hour: 'numeric', minute: '2-digit', hour12: true, 
                          month: 'short', day: 'numeric' 
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-4 border-t border-white/5 bg-zinc-900/30">
            <Link href="/automation" className="w-full">
              <Button variant="ghost" className="w-full text-zinc-400 hover:text-zinc-200 hover:bg-white/5">
                View Full Logs
                <ChevronRight className="w-4 h-4 ml-1 opacity-50" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
