"use client"

import * as React from "react"
import {
  FileText,
  Plus,
  Star,
  Trash2,
  Eye,
  Sparkles,
  BarChart3,
  Upload,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface ResumeItem {
  id: string
  title: string
  fileName: string | null
  content: string
  atsScore: number | null
  atsAnalysis: any
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export function ResumesPage({ resumes: initialResumes }: { resumes: ResumeItem[] }) {
  const [resumes, setResumes] = React.useState(initialResumes)
  const [showUpload, setShowUpload] = React.useState(false)
  const [uploading, setUploading] = React.useState(false)
  const [selectedResume, setSelectedResume] = React.useState<ResumeItem | null>(null)
  const [title, setTitle] = React.useState("")
  const [content, setContent] = React.useState("")

  const handleUpload = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Please provide a title and resume content")
      return
    }

    setUploading(true)
    try {
      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      })
      if (!res.ok) throw new Error("Failed to create resume")
      const newResume = await res.json()
      setResumes(prev => [newResume, ...prev])
      setShowUpload(false)
      setTitle("")
      setContent("")
      toast.success("Resume created and analyzed!")
    } catch (err) {
      toast.error("Failed to create resume")
    } finally {
      setUploading(false)
    }
  }

  const handleSetDefault = async (id: string) => {
    try {
      const res = await fetch(`/api/resumes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      })
      if (!res.ok) throw new Error()
      setResumes(prev => prev.map(r => ({ ...r, isDefault: r.id === id })))
      toast.success("Default resume updated!")
    } catch {
      toast.error("Failed to update default")
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/resumes/${id}`, { method: "DELETE" })
      setResumes(prev => prev.filter(r => r.id !== id))
      if (selectedResume?.id === id) setSelectedResume(null)
      toast.success("Resume deleted")
    } catch {
      toast.error("Failed to delete")
    }
  }

  const atsColor = (score: number) => {
    if (score >= 80) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
    if (score >= 60) return "text-amber-400 bg-amber-500/10 border-amber-500/20"
    return "text-red-400 bg-red-500/10 border-red-500/20"
  }

  return (
    <div className="space-y-8 p-4 md:p-0 animate-fade-in">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-r from-zinc-900/80 via-zinc-900/60 to-emerald-500/5 p-8 backdrop-blur-md">
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-3">
              <FileText className="h-6 w-6 text-emerald-400" />
              Resume Manager
            </h1>
            <p className="mt-2 text-zinc-400">
              Upload, manage, and optimize your resumes with AI-powered ATS scoring.
            </p>
          </div>
          <Button 
            onClick={() => setShowUpload(true)}
            className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/30"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Resume
          </Button>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      </div>

      {/* Upload Form */}
      {showUpload && (
        <div className="rounded-xl border border-emerald-500/20 bg-zinc-900/60 backdrop-blur-md p-6 space-y-4 animate-fade-in">
          <h3 className="text-lg font-semibold text-zinc-200 flex items-center gap-2">
            <Upload className="h-5 w-5 text-emerald-400" />
            Create New Resume
          </h3>
          <div>
            <label className="text-sm text-zinc-400 mb-1 block">Resume Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior Frontend Developer Resume"
              className="w-full rounded-lg bg-zinc-800/60 border border-white/10 px-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
            />
          </div>
          <div>
            <label className="text-sm text-zinc-400 mb-1 block">Resume Content (paste your resume text)</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your complete resume text here. The AI will analyze it for ATS compatibility..."
              rows={12}
              className="w-full rounded-lg bg-zinc-800/60 border border-white/10 px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 resize-none"
            />
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={handleUpload} 
              disabled={uploading}
              className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/30"
            >
              {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
              {uploading ? "Analyzing..." : "Create & Analyze"}
            </Button>
            <Button variant="ghost" onClick={() => setShowUpload(false)} className="text-zinc-400">
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Resumes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resumes.length === 0 ? (
          <div className="col-span-full rounded-xl border border-white/5 bg-zinc-900/40 backdrop-blur-md p-12 text-center">
            <FileText className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-400 font-medium">No resumes yet</p>
            <p className="text-sm text-zinc-600 mt-1">Upload your first resume to get AI-powered ATS analysis!</p>
          </div>
        ) : (
          resumes.map((resume) => (
            <div
              key={resume.id}
              className={`rounded-xl border bg-zinc-900/40 backdrop-blur-md p-5 transition-all duration-300 hover:border-white/10 hover:shadow-lg cursor-pointer group ${
                resume.isDefault ? "border-emerald-500/30" : "border-white/5"
              } ${selectedResume?.id === resume.id ? "ring-1 ring-primary/50" : ""}`}
              onClick={() => setSelectedResume(resume)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800 border border-white/5">
                    <FileText className="h-5 w-5 text-zinc-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-200 group-hover:text-zinc-100">{resume.title}</p>
                    <p className="text-xs text-zinc-600">{new Date(resume.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                {resume.isDefault && (
                  <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Star className="h-3 w-3" /> Default
                  </span>
                )}
              </div>

              {/* ATS Score */}
              {resume.atsScore !== null && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-zinc-500 flex items-center gap-1">
                      <BarChart3 className="h-3 w-3" /> ATS Score
                    </span>
                    <span className={`text-sm font-bold px-2 py-0.5 rounded-md border ${atsColor(resume.atsScore)}`}>
                      {resume.atsScore}/100
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        resume.atsScore >= 80 ? "bg-emerald-400" :
                        resume.atsScore >= 60 ? "bg-amber-400" : "bg-red-400"
                      }`}
                      style={{ width: `${resume.atsScore}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Preview */}
              <p className="text-xs text-zinc-600 line-clamp-3 mb-4">{resume.content.substring(0, 200)}...</p>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs text-zinc-400 hover:text-zinc-200 h-8"
                  onClick={(e) => { e.stopPropagation(); setSelectedResume(resume) }}
                >
                  <Eye className="h-3 w-3 mr-1.5" /> View
                </Button>
                {!resume.isDefault && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs text-zinc-400 hover:text-emerald-400 h-8"
                    onClick={(e) => { e.stopPropagation(); handleSetDefault(resume.id) }}
                  >
                    <Star className="h-3 w-3 mr-1.5" /> Set Default
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs text-zinc-400 hover:text-red-400 h-8 ml-auto"
                  onClick={(e) => { e.stopPropagation(); handleDelete(resume.id) }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Resume Detail Panel */}
      {selectedResume && (
        <div className="rounded-xl border border-white/5 bg-zinc-900/40 backdrop-blur-md p-6 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-zinc-200">{selectedResume.title}</h3>
            <Button variant="ghost" size="sm" onClick={() => setSelectedResume(null)} className="text-zinc-500">
              Close
            </Button>
          </div>

          {selectedResume.atsAnalysis && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(selectedResume.atsAnalysis as any).strengths && (
                <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/10 p-4">
                  <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Check className="h-3 w-3" /> Strengths
                  </p>
                  <ul className="space-y-1">
                    {((selectedResume.atsAnalysis as any).strengths as string[]).map((s, i) => (
                      <li key={i} className="text-xs text-zinc-400">• {s}</li>
                    ))}
                  </ul>
                </div>
              )}
              {(selectedResume.atsAnalysis as any).improvements && (
                <div className="rounded-lg bg-amber-500/5 border border-amber-500/10 p-4">
                  <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> Improvements
                  </p>
                  <ul className="space-y-1">
                    {((selectedResume.atsAnalysis as any).improvements as string[]).map((s, i) => (
                      <li key={i} className="text-xs text-zinc-400">• {s}</li>
                    ))}
                  </ul>
                </div>
              )}
              {(selectedResume.atsAnalysis as any).keywords && (
                <div className="rounded-lg bg-blue-500/5 border border-blue-500/10 p-4">
                  <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> Key Skills Found
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {((selectedResume.atsAnalysis as any).keywords as string[]).map((k, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="rounded-lg bg-zinc-800/40 p-4 max-h-96 overflow-y-auto">
            <pre className="text-xs text-zinc-400 whitespace-pre-wrap font-mono">{selectedResume.content}</pre>
          </div>
        </div>
      )}
    </div>
  )
}
