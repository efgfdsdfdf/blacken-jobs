import * as React from "react"
import { FolderGit2, Plus, MessageSquare, Download, Clock, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { requireAuth } from "@/dal/auth"
import { prisma } from "@repo/db"
import Link from "next/link"
import { ProjectDownloadCard } from "@/features/chat/components/project-download-card"

export default async function ProjectsPage() {
  const user = await requireAuth()

  // Fetch all chats and their messages
  const chats = await prisma.chat.findMany({
    where: { userId: user.id },
    include: { messages: true },
    orderBy: { updatedAt: "desc" }
  })

  // Filter chats that actually have project files, or just show all chats as projects
  const projects = chats.map(chat => {
    let projectFiles = null
    
    // Find the last assistant message with project_files
    for (let i = chat.messages.length - 1; i >= 0; i--) {
      const msg = chat.messages[i]
      if (msg.role === "ASSISTANT" && msg.content.includes("```project_files")) {
        try {
          const match = msg.content.match(/```project_files\n([\s\S]*?)\n```/)
          if (match && match[1]) {
            projectFiles = JSON.parse(match[1])
          }
        } catch(e) {}
        break
      }
    }
    
    return {
      ...chat,
      projectFiles
    }
  })

  return (
    <div className="flex-1 overflow-auto bg-zinc-950 p-6 md:p-8 animate-fade-in">
      <div className="mx-auto max-w-5xl space-y-8">
        
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-100">AI Projects</h1>
            <p className="text-zinc-400 mt-1">Access and download the applications you built with BLACK AI.</p>
          </div>
          <Link href="/dashboard">
            <Button className="w-full md:w-auto bg-primary text-primary-foreground shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] transition-all">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </Link>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {projects.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center mb-6">
                <FolderGit2 className="w-10 h-10 text-zinc-500" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-300">No projects yet</h3>
              <p className="text-zinc-500 mt-2 max-w-md">Start a chat with BLACK AI and ask it to build an application for you. Your generated projects will appear here.</p>
            </div>
          )}
          
          {projects.map((project) => (
            <Card key={project.id} className="glass-card flex flex-col justify-between overflow-hidden group">
              <div>
                <CardHeader className="pb-3 border-b border-white/5 bg-zinc-900/30">
                  <div className="flex items-start justify-between">
                    <div className="p-2.5 bg-primary/10 rounded-xl text-primary border border-primary/20 shadow-inner group-hover:bg-primary/20 transition-colors">
                      <FolderGit2 className="w-5 h-5" />
                    </div>
                    <span className="text-xs text-zinc-500 flex items-center font-medium bg-zinc-900/80 px-2.5 py-1 rounded-full border border-white/5">
                      <Clock className="w-3 h-3 mr-1.5" />
                      {new Date(project.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <CardTitle className="text-xl text-zinc-100 mt-4 group-hover:text-primary transition-colors">{project.title}</CardTitle>
                  <CardDescription className="text-zinc-400 mt-1 flex items-center">
                    <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                    {project.messages.length} messages in chat
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pt-4 pb-2">
                  {project.projectFiles ? (
                    <div className="w-full">
                      <ProjectDownloadCard files={project.projectFiles} />
                    </div>
                  ) : (
                    <div className="p-6 text-center text-zinc-500 bg-zinc-900/30 rounded-xl border border-white/5 mt-2">
                      <p className="text-sm">No downloadable files detected in this chat.</p>
                    </div>
                  )}
                </CardContent>
              </div>
              
              <CardFooter className="pt-2 border-t border-white/5 bg-zinc-900/20">
                <Link href={`/chat/${project.id}`} className="w-full">
                  <Button variant="ghost" className="w-full text-zinc-300 hover:text-white hover:bg-white/5">
                    Open Chat Context
                    <ExternalLink className="w-4 h-4 ml-2 opacity-50" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
