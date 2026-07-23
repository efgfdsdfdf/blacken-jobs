import * as React from "react"
import { FileText, Plus, File, ExternalLink, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { requireAuth } from "@/dal/auth"
import { prisma } from "@repo/db"

export default async function ProjectsPage() {
  const user = await requireAuth()

  // Fetch real resumes for the user
  const resumes = await prisma.resume.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" }
  })

  // Fetch cover letters generated for jobs
  const appliedJobs = await prisma.job.findMany({
    where: { 
      userId: user.id, 
      coverLetter: { not: "" },
      status: { not: "FOUND" }
    },
    orderBy: { createdAt: "desc" }
  })

  return (
    <div className="flex-1 overflow-auto bg-zinc-950 p-6 md:p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Resumes & Cover Letters</h1>
            <p className="text-zinc-400 mt-1">Manage your base resumes and AI-tailored application materials.</p>
          </div>
          <Button className="w-full md:w-auto bg-primary text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" />
            Upload Base Resume
          </Button>
        </div>

        {/* Resumes Section */}
        <div>
          <h2 className="text-xl font-semibold text-zinc-100 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-zinc-400" />
            Resumes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resumes.length === 0 && (
              <p className="text-zinc-500 text-sm col-span-full">No resumes uploaded yet.</p>
            )}
            {resumes.map((resume) => (
              <Card key={resume.id} className="border-zinc-800 bg-zinc-900 shadow-md group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                      <FileText className="w-5 h-5" />
                    </div>
                    {resume.isDefault && (
                      <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-none">Default</Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg text-zinc-100 mt-3">{resume.title}</CardTitle>
                  <CardDescription className="text-zinc-400">{resume.content.substring(0, 50)}...</CardDescription>
                </CardHeader>
                <CardFooter className="pt-2 border-t border-zinc-800 flex items-center justify-between mt-2">
                  <span className="text-xs text-zinc-500">Updated {new Date(resume.updatedAt).toLocaleDateString()}</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-100">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        {/* Cover Letters Section */}
        <div className="pt-4">
          <h2 className="text-xl font-semibold text-zinc-100 mb-4 flex items-center">
            <File className="w-5 h-5 mr-2 text-zinc-400" />
            AI Generated Cover Letters
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {appliedJobs.length === 0 && (
              <p className="text-zinc-500 text-sm col-span-full">No AI cover letters generated yet. Turn on Auto-Apply!</p>
            )}
            {appliedJobs.map((job) => (
              <Card key={job.id} className="border-zinc-800 bg-zinc-900 shadow-md group">
                <CardHeader className="pb-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400 w-fit group-hover:bg-purple-500/20 transition-colors">
                    <File className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-lg text-zinc-100 mt-3">{job.company}</CardTitle>
                  <CardDescription className="text-zinc-400">{job.role}</CardDescription>
                </CardHeader>
                <CardFooter className="pt-2 border-t border-zinc-800 flex items-center justify-between mt-2">
                  <span className="text-xs text-zinc-500">Applied {new Date(job.createdAt).toLocaleDateString()}</span>
                  <a href={job.url || "#"} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-100">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </a>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
