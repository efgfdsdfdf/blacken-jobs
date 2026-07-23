import * as React from "react"
import { Briefcase, Building, CheckCircle2, Clock, XCircle, MoreVertical, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { requireAuth } from "@/dal/auth"
import { prisma } from "@repo/db"

export default async function JobsPage() {
  const user = await requireAuth()

  const jobs = await prisma.job.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" }
  })

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "APPLIED": return <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"><CheckCircle2 className="w-3 h-3 mr-1"/> Applied</Badge>
      case "INTERVIEWING": return <Badge className="bg-purple-500/10 text-purple-500 hover:bg-purple-500/20"><Clock className="w-3 h-3 mr-1"/> Interviewing</Badge>
      case "REJECTED": return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20"><XCircle className="w-3 h-3 mr-1"/> Rejected</Badge>
      case "OFFER": return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20"><CheckCircle2 className="w-3 h-3 mr-1"/> Offer!</Badge>
      default: return <Badge className="bg-zinc-500/10 text-zinc-400 hover:bg-zinc-500/20">Found</Badge>
    }
  }

  const totalFound = jobs.length
  const autoApplied = jobs.filter(j => j.status !== "FOUND").length
  const interviews = jobs.filter(j => j.status === "INTERVIEWING").length
  const rejections = jobs.filter(j => j.status === "REJECTED").length

  return (
    <div className="flex-1 overflow-auto bg-zinc-950 p-6 md:p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Job Pipeline</h1>
            <p className="text-zinc-400 mt-1">Track the applications submitted by your autonomous agent.</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900 shadow-sm">
            <p className="text-sm font-medium text-zinc-400">Total Found</p>
            <p className="text-3xl font-bold text-zinc-100 mt-2">{totalFound}</p>
          </div>
          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900 shadow-sm">
            <p className="text-sm font-medium text-zinc-400">Auto-Applied</p>
            <p className="text-3xl font-bold text-blue-400 mt-2">{autoApplied}</p>
          </div>
          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900 shadow-sm">
            <p className="text-sm font-medium text-zinc-400">Interviews</p>
            <p className="text-3xl font-bold text-purple-400 mt-2">{interviews}</p>
          </div>
          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900 shadow-sm">
            <p className="text-sm font-medium text-zinc-400">Rejections</p>
            <p className="text-3xl font-bold text-red-400 mt-2">{rejections}</p>
          </div>
        </div>

        {/* Data Table */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
          <Table>
            <TableHeader className="bg-zinc-950/50">
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="w-[250px] text-zinc-400">Company & Role</TableHead>
                <TableHead className="text-zinc-400">Status</TableHead>
                <TableHead className="text-zinc-400">AI Match</TableHead>
                <TableHead className="text-zinc-400">Found Date</TableHead>
                <TableHead className="text-right text-zinc-400"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-zinc-500">
                    No jobs found yet. Ensure your Automation Agent is active!
                  </TableCell>
                </TableRow>
              ) : jobs.map((job) => (
                <TableRow key={job.id} className="border-zinc-800 hover:bg-zinc-800/50">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-zinc-200 flex items-center">
                        <Building className="w-3 h-3 mr-1.5 text-zinc-500" />
                        {job.company}
                      </span>
                      <span className="text-sm text-zinc-500 flex items-center mt-1">
                        <Briefcase className="w-3 h-3 mr-1.5" />
                        {job.role}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(job.status)}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center justify-center px-2 py-1 rounded text-xs font-medium bg-green-500/10 text-green-400">
                      {job.matchScore}%
                    </span>
                  </TableCell>
                  <TableCell className="text-zinc-400 text-sm">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {job.url ? (
                      <a href={job.url} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-100">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </a>
                    ) : (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-100">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

      </div>
    </div>
  )
}
