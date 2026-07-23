"use client"

import * as React from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight"
import { User, Bot, Eye, Code2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export interface MessageProps {
  role: "USER" | "ASSISTANT" | "SYSTEM"
  content: string
}

function extractText(node: any): string {
  if (!node) return ''
  if (node.type === 'text') return node.value || ''
  if (node.children) return node.children.map(extractText).join('')
  return ''
}

function CodeBlock({ node, inline, className, children, ...props }: any) {
  const match = /language-(\w+)/.exec(className || '')
  const language = match?.[1] || 'code'
  
  if (inline) {
    return (
      <code className="rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm" {...props}>
        {children}
      </code>
    )
  }

  const codeString = extractText(node).replace(/\n$/, '')
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
    <div className="relative rounded-md my-4 border border-zinc-800 bg-zinc-950 font-mono text-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-1.5 bg-zinc-900 border-b border-zinc-800 text-zinc-400 text-xs">
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
    <div className={cn(
      "flex w-full gap-4 px-4 py-6 md:px-6 lg:px-8",
      isUser ? "bg-background" : "bg-muted/30 border-y"
    )}>
      <div className={cn(
        "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow-sm",
        isUser 
          ? "bg-primary text-primary-foreground border-primary" 
          : "bg-card text-foreground border-border"
      )}>
        {isUser ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
      </div>
      
      <div className="flex-1 space-y-2 overflow-hidden px-1">
        <div className="prose prose-sm md:prose-base prose-neutral dark:prose-invert max-w-none break-words">
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
  )
}
