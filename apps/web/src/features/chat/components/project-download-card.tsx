"use client"

import * as React from "react"
import { Download, FileCode2, Loader2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import JSZip from "jszip"
import { saveAs } from "file-saver"

export interface ProjectFile {
  path: string
  content: string
}

export function ProjectDownloadCard({ files }: { files: ProjectFile[] }) {
  const [isZipping, setIsZipping] = React.useState(false)
  const [downloaded, setDownloaded] = React.useState(false)

  const handleDownload = async () => {
    try {
      setIsZipping(true)
      const zip = new JSZip()
      
      // Add all files to the ZIP
      files.forEach((file) => {
        zip.file(file.path, file.content)
      })

      // Generate the ZIP file
      const content = await zip.generateAsync({ type: "blob" })
      
      // Trigger download
      saveAs(content, "black-ai-project.zip")
      
      setDownloaded(true)
      setTimeout(() => setDownloaded(false), 3000)
    } catch (error) {
      console.error("Failed to generate zip", error)
    } finally {
      setIsZipping(false)
    }
  }

  return (
    <div className="my-4 overflow-hidden rounded-xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm">
      <div className="border-b border-white/5 bg-zinc-800/50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-200">
          <FileCode2 className="h-5 w-5 text-primary" />
          <span>Project Files Generated</span>
        </div>
        <div className="text-xs text-zinc-500 font-mono">
          {files.length} file{files.length === 1 ? "" : "s"}
        </div>
      </div>
      
      <div className="p-4 space-y-4">
        <div className="max-h-[200px] overflow-y-auto space-y-1 pr-2 rounded bg-black/20 p-2">
          {files.map((file, i) => (
            <div key={i} className="text-xs font-mono text-zinc-400 flex items-center gap-2 py-1 px-2 hover:bg-white/5 rounded">
              <span className="text-primary/60">→</span> {file.path}
            </div>
          ))}
        </div>

        <Button 
          onClick={handleDownload} 
          disabled={isZipping || downloaded || files.length === 0}
          className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 h-12 rounded-lg font-medium transition-all"
        >
          {isZipping ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Compressing...
            </>
          ) : downloaded ? (
            <>
              <CheckCircle2 className="mr-2 h-5 w-5 text-green-400" />
              <span className="text-green-400">Downloaded Successfully</span>
            </>
          ) : (
            <>
              <Download className="mr-2 h-5 w-5" />
              Download Project (.zip)
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
