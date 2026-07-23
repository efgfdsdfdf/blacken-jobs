"use client"

import * as React from "react"
import { Bot, Plus, Briefcase, MapPin, Search, CheckCircle2, Play, Activity, Terminal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toggleAutomation, updatePortfolioUrl, forceRunJobWorker, getAgentLogs } from "./actions"

interface Props {
  initialIsActive: boolean;
  initialPortfolioUrl: string;
}

export function AutomationClient({ initialIsActive, initialPortfolioUrl }: Props) {
  const [isActive, setIsActive] = React.useState(initialIsActive)
  const [portfolioUrl, setPortfolioUrl] = React.useState(initialPortfolioUrl)
  const [isPending, startTransition] = React.useTransition()
  const [logs, setLogs] = React.useState<any[]>([])
  const [isLogsOpen, setIsLogsOpen] = React.useState(false)
  const [isLoadingLogs, setIsLoadingLogs] = React.useState(false)

  const handleToggle = (checked: boolean) => {
    setIsActive(checked) // Optimistic update
    
    if (checked) {
      toast.success("Job Agent activated! It will now search and apply in the background.")
    } else {
      toast.info("Job Agent paused.")
    }

    startTransition(async () => {
      try {
        await toggleAutomation(checked)
      } catch (error) {
        toast.error("Failed to save state. Reverting.")
        setIsActive(!checked)
      }
    })
  }

  const handlePortfolioBlur = () => {
    if (portfolioUrl === initialPortfolioUrl && portfolioUrl !== "") return;
    
    startTransition(async () => {
      try {
        await updatePortfolioUrl(portfolioUrl)
        toast.success("Portfolio URL updated successfully!")
      } catch (error) {
        toast.error("Failed to save portfolio URL.")
      }
    })
  }

  const fetchLogs = async () => {
    try {
      const data = await getAgentLogs()
      setLogs(data)
    } catch (e) {
      toast.error("Failed to load logs")
    }
  }

  // Poll for logs if the dialog is open
  React.useEffect(() => {
    if (!isLogsOpen) return
    fetchLogs() // Initial fetch
    
    const interval = setInterval(() => {
      fetchLogs()
    }, 5000)
    
    return () => clearInterval(interval)
  }, [isLogsOpen])

  const handleForceRun = async () => {
    toast.info("Triggering Agent...", { description: "The agent is waking up and scanning for jobs." });
    const success = await forceRunJobWorker();
    if (success) {
      toast.success("Agent Run Complete!", { description: "Open the Logs to see the magic happen."});
      if (isLogsOpen) fetchLogs();
    } else {
      toast.error("Failed to trigger agent.");
    }
  }

  return (
    <div className="flex-1 overflow-auto p-4 md:p-8">
      <div className="mx-auto max-w-5xl space-y-8 animate-fade-in">
        
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-100 drop-shadow-md">Automation</h1>
            <p className="text-zinc-400 mt-1">Configure your 24/7 autonomous job search agents.</p>
          </div>
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <Button onClick={handleForceRun} className="w-full md:w-auto bg-green-500 hover:bg-green-600 text-green-950 font-bold shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all">
              <Play className="w-4 h-4 mr-2" />
              Force Run Agent Now
            </Button>
            <Button onClick={() => toast.info("Creating new rule...")} className="w-full md:w-auto bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4 mr-2" />
              New Agent
            </Button>
          </div>
        </div>

        {/* Main Agent Card */}
        <Card className="glass-card relative overflow-hidden group">
          <div className={`absolute top-0 left-0 w-1.5 h-full ${isActive ? "bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]" : "bg-zinc-700"} transition-all duration-500`} />
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${isActive ? "bg-green-500/20 text-green-400 border border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.15)]" : "bg-zinc-800 text-zinc-400 border border-white/5"} transition-all duration-500`}>
                  <Bot className="w-7 h-7" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-zinc-100 group-hover:text-white transition-colors">Primary Software Engineer Agent</CardTitle>
                  <CardDescription className="text-zinc-400 mt-1">Scans RemoteOK and automatically applies for you.</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Label htmlFor="agent-toggle" className="text-sm font-medium text-zinc-300">
                  {isActive ? "Active" : "Paused"}
                </Label>
                <Switch 
                  id="agent-toggle" 
                  checked={isActive}
                  onCheckedChange={handleToggle}
                  disabled={isPending}
                  className="data-[state=checked]:bg-green-500"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <Label className="text-zinc-300">Target Roles</Label>
                <div className="flex items-center gap-2 relative">
                  <Briefcase className="w-4 h-4 absolute left-3 text-zinc-500" />
                  <Input placeholder="e.g. Frontend Developer" defaultValue="Senior React Engineer" className="pl-9 bg-zinc-950/50 border-white/10 focus-visible:border-primary/50 transition-colors" />
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="secondary" className="bg-zinc-800/80 text-zinc-300 border border-white/5 hover:bg-zinc-700">Frontend</Badge>
                  <Badge variant="secondary" className="bg-zinc-800/80 text-zinc-300 border border-white/5 hover:bg-zinc-700">React</Badge>
                  <Badge variant="secondary" className="bg-zinc-800/80 text-zinc-300 border border-white/5 hover:bg-zinc-700">Next.js</Badge>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-zinc-300">Locations</Label>
                <div className="flex items-center gap-2 relative">
                  <MapPin className="w-4 h-4 absolute left-3 text-zinc-500" />
                  <Input placeholder="e.g. New York, Remote" defaultValue="Remote, US" className="pl-9 bg-zinc-950/50 border-white/10 focus-visible:border-primary/50 transition-colors" />
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="secondary" className="bg-zinc-800/80 text-zinc-300 border border-white/5 hover:bg-zinc-700">Remote</Badge>
                  <Badge variant="secondary" className="bg-zinc-800/80 text-zinc-300 border border-white/5 hover:bg-zinc-700">EST Timezone</Badge>
                </div>
              </div>

              <div className="space-y-3 md:col-span-2">
                <Label className="text-zinc-300">Portfolio / Resume Link</Label>
                <div className="flex items-center gap-2 relative">
                  <Search className="w-4 h-4 absolute left-3 text-zinc-500" />
                  <Input 
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    onBlur={handlePortfolioBlur}
                    placeholder="https://your-portfolio.com" 
                    className="pl-9 bg-zinc-950/50 border-white/10 focus-visible:border-primary/50 transition-colors" 
                  />
                </div>
                <p className="text-xs text-zinc-500 mt-1">The AI will use this link to analyze your background and inject it into auto-generated cover letters and application forms.</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-950/50 border border-white/5 space-y-4 shadow-inner">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-zinc-200">Auto-Apply with AI Cover Letter</h4>
                  <p className="text-sm text-zinc-400 mt-1">If disabled, jobs will be saved to your dashboard for manual review.</p>
                </div>
                <Switch defaultChecked className="data-[state=checked]:bg-primary" />
              </div>
            </div>
          </CardContent>

          <CardFooter className="bg-black/20 border-t border-white/5 pt-4 flex justify-between rounded-b-xl">
            <span className="text-xs text-zinc-500 flex items-center font-medium">
              <Search className="w-3.5 h-3.5 mr-1.5" />
              Last scan: {isActive ? <span className="text-green-400/80 ml-1 flex items-center gap-1">Running<span className="animate-pulse">...</span></span> : "Paused"}
            </span>
            
            <Dialog open={isLogsOpen} onOpenChange={(open) => { setIsLogsOpen(open); if(open) fetchLogs(); }}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="border-white/10 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300">
                  <Terminal className="w-4 h-4 mr-2 text-zinc-400" />
                  View Logs
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-panel border-white/10 text-zinc-100 max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-primary" />
                    Agent Audit Logs
                  </DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[400px] w-full rounded-md border border-white/5 bg-black/40 p-4 font-mono text-sm shadow-inner">
                  {isLoadingLogs ? (
                    <div className="flex items-center justify-center h-full text-zinc-500">Loading logs...</div>
                  ) : logs.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-zinc-500">No logs found. Trigger the agent to see activity.</div>
                  ) : (
                    <div className="space-y-3">
                      {logs.map((log) => (
                        <div key={log.id} className="flex gap-3 text-zinc-400 pb-3 border-b border-white/5 last:border-0 animate-fade-in">
                          <span className="text-zinc-600 shrink-0">[{new Date(log.createdAt).toLocaleTimeString()}]</span>
                          <span className={log.action === "UPDATE" ? "text-green-400" : "text-primary/80"}>
                            {log.message}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </Card>

      </div>
    </div>
  )
}
