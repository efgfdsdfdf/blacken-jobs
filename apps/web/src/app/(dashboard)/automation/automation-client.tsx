"use client"

import * as React from "react"
import { Bot, Plus, Briefcase, MapPin, Search, CheckCircle2, Play, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { toggleAutomation, updatePortfolioUrl, forceRunJobWorker } from "./actions"

interface Props {
  initialIsActive: boolean;
  initialPortfolioUrl: string;
}

export function AutomationClient({ initialIsActive, initialPortfolioUrl }: Props) {
  const [isActive, setIsActive] = React.useState(initialIsActive)
  const [portfolioUrl, setPortfolioUrl] = React.useState(initialPortfolioUrl)
  const [isPending, startTransition] = React.useTransition()

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

  const handleForceRun = async () => {
    toast.info("Triggering Agent...", { description: "The agent is waking up and scanning for jobs in the background." });
    const success = await forceRunJobWorker();
    if (success) {
      toast.success("Agent Triggered Successfully!", { description: "Check your terminal logs and Jobs dashboard to see the magic happen."});
    } else {
      toast.error("Failed to trigger agent. Is your API server running?");
    }
  }

  return (
    <div className="flex-1 overflow-auto bg-zinc-950 p-6 md:p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Automation</h1>
            <p className="text-zinc-400 mt-1">Configure your 24/7 autonomous job search agents.</p>
          </div>
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <Button onClick={handleForceRun} className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white font-medium">
              <Play className="w-4 h-4 mr-2" />
              Force Run Agent Now
            </Button>
            <Button onClick={() => toast.info("Creating new rule...")} className="w-full md:w-auto bg-primary text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" />
              New Agent
            </Button>
          </div>
        </div>

        {/* Main Agent Card */}
        <Card className="border-zinc-800 bg-zinc-900 shadow-2xl relative overflow-hidden">
          <div className={`absolute top-0 left-0 w-1 h-full ${isActive ? "bg-green-500" : "bg-zinc-700"} transition-colors`} />
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isActive ? "bg-green-500/20 text-green-400" : "bg-zinc-800 text-zinc-400"}`}>
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-zinc-100">Primary Software Engineer Agent</CardTitle>
                  <CardDescription className="text-zinc-400 mt-1">Scans RemoteOK and automatically applies for you.</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Label htmlFor="agent-toggle" className="text-sm text-zinc-400">
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

          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <Label className="text-zinc-300">Target Roles</Label>
                <div className="flex items-center gap-2 relative">
                  <Briefcase className="w-4 h-4 absolute left-3 text-zinc-500" />
                  <Input placeholder="e.g. Frontend Developer" defaultValue="Senior React Engineer" className="pl-9 bg-zinc-950 border-zinc-800" />
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="secondary" className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700">Frontend</Badge>
                  <Badge variant="secondary" className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700">React</Badge>
                  <Badge variant="secondary" className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700">Next.js</Badge>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-zinc-300">Locations</Label>
                <div className="flex items-center gap-2 relative">
                  <MapPin className="w-4 h-4 absolute left-3 text-zinc-500" />
                  <Input placeholder="e.g. New York, Remote" defaultValue="Remote, US" className="pl-9 bg-zinc-950 border-zinc-800" />
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="secondary" className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700">Remote</Badge>
                  <Badge variant="secondary" className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700">EST Timezone</Badge>
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
                    className="pl-9 bg-zinc-950 border-zinc-800" 
                  />
                </div>
                <p className="text-xs text-zinc-500 mt-1">The AI will use this link to analyze your background and inject it into auto-generated cover letters and application forms. (Auto-saves when you click away)</p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-zinc-200">Auto-Apply with AI Cover Letter</h4>
                  <p className="text-sm text-zinc-500 mt-1">If disabled, jobs will be saved to your dashboard for manual review.</p>
                </div>
                <Switch defaultChecked className="data-[state=checked]:bg-primary" />
              </div>
            </div>
          </CardContent>

          <CardFooter className="bg-zinc-950/50 border-t border-zinc-800 pt-4 flex justify-between">
            <span className="text-xs text-zinc-500 flex items-center">
              <Search className="w-3 h-3 mr-1" />
              Last scan: {isActive ? "Running in background..." : "Paused"}
            </span>
            <Button variant="outline" size="sm" className="border-zinc-700 hover:bg-zinc-800">
              View Logs
            </Button>
          </CardFooter>
        </Card>

      </div>
    </div>
  )
}
