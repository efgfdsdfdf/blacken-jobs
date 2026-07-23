"use client"

import * as React from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight"
import { User, Bot, Eye, Code2, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export interface MessageProps {
  role: "USER" | "ASSISTANT" | "SYSTEM"
  content: string
}

import { ProjectDownloadCard } from "./project-download-card"

function extractText(node: any): string {
  if (!node) return ''
  if (node.type === 'text') return node.value || ''
  if (node.children) return node.children.map(extractText).join('')
  return ''
}

function CodeBlock({ node, inline, className, children, ...props }: any) {
  const match = /language-([a-zA-Z0-9_]+)/.exec(className || '')
  const language = match?.[1] || 'code'
  
  if (inline) {
    return (
      <code className="rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm" {...props}>
        {children}
      </code>
    )
  }

  const codeString = extractText(node).replace(/\n$/, '')
  
  if (language === 'project_files') {
    try {
      // It might be streaming in, so JSON.parse can fail until it's fully streamed
      const files = JSON.parse(codeString)
      if (Array.isArray(files)) {
        return <ProjectDownloadCard files={files} />
      }
    } catch (e) {
      return (
        <div className="my-4 p-4 border border-primary/20 bg-primary/5 rounded-xl flex items-center gap-3 text-sm text-zinc-300">
          <Loader2 className="animate-spin h-5 w-5 text-primary" /> 
          <span>Assembling project files...</span>
        </div>
      )
    }
  }

  const isHtml = language.toLowerCase() === 'html'

  if (isHtml) {
    return (
      <div className="relative rounded-md my-4 border border-zinc-800 overflow-hidden bg-zinc-950 font-sans">
        <Tabs defaultValue="preview" className="w-full">
          <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800">
            <div className="text-zinc-400 text-xs font-mono">{language}</div>
            <TabsList className="h-7 bg-zinc-950/50">
              <TabsTrigger value="preview" className="text-xs h-6 px-2 data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 text-zinc-400">
                <Eye className="w-3 h-3 mr-1.5" /> Preview
              </TabsTrigger>
              <TabsTrigger value="code" className="text-xs h-6 px-2 data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 text-zinc-400">
                <Code2 className="w-3 h-3 mr-1.5" /> Code
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="preview" className="p-0 m-0 border-none outline-none">
            <div className="w-full h-[500px] bg-white rounded-b-md overflow-hidden relative">
              <iframe
                srcDoc={codeString}
                sandbox="allow-scripts"
                className="w-full h-full border-0 absolute inset-0"
                title="HTML Preview"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="code" className="p-4 m-0 overflow-x-auto font-mono text-sm outline-none">
            <code className={className} {...props}>
              {children}
            </code>
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  return (
    <div className="relative rounded-2xl my-4 border border-white/10 bg-zinc-950 font-mono text-sm overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/50 border-b border-white/10 text-zinc-400 text-xs">
        <span>{language}</span>
      </div>
      <div className="p-4 overflow-x-auto">
        <code className={className} {...props}>
          {children}
        </code>
      </div>
    </div>
  )
}

export function MessageBubble({ message }: { message: MessageProps }) {
  const isUser = message.role === "USER"
  
  if (message.role === "SYSTEM") return null

  return (
    <div className={`flex w-full gap-4 ${isUser ? "flex-row-reverse" : "flex-row"} animate-slide-in-up`}>
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-lg
        ${isUser 
          ? "bg-gradient-to-br from-zinc-700 to-zinc-900 border border-white/10" 
          : "bg-primary/20 border border-primary/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
        }`}
      >
        {isUser ? <User className="h-5 w-5 text-zinc-300" /> : <Bot className="h-5 w-5 text-primary" />}
      </div>
      
      <div className={`flex flex-col max-w-[85%] ${isUser ? "items-end" : "items-start"}`}>
        <div className="flex items-center gap-2 mb-1.5 px-1">
          <span className="text-sm font-semibold tracking-tight text-zinc-300">
            {isUser ? "You" : "BLACK AI"}
          </span>
        </div>
        
        <div 
          className={`relative rounded-2xl px-5 py-4 text-[15px] leading-relaxed shadow-xl break-words w-full
            ${isUser 
              ? "bg-gradient-to-b from-zinc-800 to-zinc-900 text-zinc-100 border border-white/10" 
              : "glass-card text-zinc-200 border border-white/5"
            }`}
        >
          <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:p-0 prose-pre:bg-transparent prose-code:text-primary-foreground prose-a:text-primary hover:prose-a:text-primary/80 prose-strong:text-zinc-100">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[[rehypeHighlight, { detect: true }]]}
              components={{ 
                code: CodeBlock,
                p: ({ children }) => <div className="mb-4 last:mb-0">{children}</div>,
                pre: ({ children }) => <>{children}</>
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  )
}
