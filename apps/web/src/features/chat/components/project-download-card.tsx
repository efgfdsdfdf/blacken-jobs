"use client"

import * as React from "react"
import { Download, FileCode2, Loader2, CheckCircle2, FolderDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import JSZip from "jszip"
import { saveAs } from "file-saver"

export interface ProjectFile {
  path: string
  content: string
}

export function ProjectDownloadCard({ files }: { files: ProjectFile[] }) {
  const [isExporting, setIsExporting] = React.useState(false)
  const [downloaded, setDownloaded] = React.useState(false)
  const [hasFileSystemAPI, setHasFileSystemAPI] = React.useState(false)

  React.useEffect(() => {
    // Check if the browser supports the File System Access API
    if (typeof window !== "undefined" && "showDirectoryPicker" in window) {
      setHasFileSystemAPI(true)
    }
  }, [])

  const handleExport = async () => {
    if (hasFileSystemAPI) {
      await exportToFolder()
    } else {
      await exportToZip()
    }
  }

  const exportToFolder = async () => {
    try {
      setIsExporting(true)
      // @ts-ignore - TS doesn't know about File System Access API by default
      const dirHandle = await window.showDirectoryPicker({
        mode: "readwrite"
      })

      for (const file of files) {
        // Split path by / to handle subdirectories
        const pathParts = file.path.split("/").filter(Boolean)
        const fileName = pathParts.pop()
        
        if (!fileName) continue

        let currentDirHandle = dirHandle
        // Create necessary subdirectories
        for (const part of pathParts) {
          currentDirHandle = await currentDirHandle.getDirectoryHandle(part, { create: true })
        }

        // Create and write to the file
        const fileHandle = await currentDirHandle.getFileHandle(fileName, { create: true })
        const writable = await fileHandle.createWritable()
        await writable.write(file.content)
        await writable.close()
      }

      setDownloaded(true)
      setTimeout(() => setDownloaded(false), 3000)
    } catch (error: any) {
      // If user aborts, don't show error
      if (error.name !== "AbortError") {
        console.error("Failed to export to folder", error)
        // Fallback to ZIP on unexpected failure
        await exportToZip()
      }
    } finally {
      setIsExporting(false)
    }
  }

  const exportToZip = async () => {
    try {
      setIsExporting(true)
      const zip = new JSZip()
      
      files.forEach((file) => {
        zip.file(file.path, file.content)
      })

      const content = await zip.generateAsync({ type: "blob" })
      saveAs(content, "black-ai-project.zip")
      
      setDownloaded(true)
      setTimeout(() => setDownloaded(false), 3000)
    } catch (error) {
      console.error("Failed to generate zip", error)
    } finally {
      setIsExporting(false)
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
          onClick={handleExport} 
          disabled={isExporting || downloaded || files.length === 0}
          className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 h-12 rounded-lg font-medium transition-all"
        >
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Saving files...
            </>
          ) : downloaded ? (
            <>
              <CheckCircle2 className="mr-2 h-5 w-5 text-green-400" />
              <span className="text-green-400">Exported Successfully</span>
            </>
          ) : hasFileSystemAPI ? (
            <>
              <FolderDown className="mr-2 h-5 w-5" />
              Save to Local Folder
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
