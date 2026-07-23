"use client"

import * as React from "react"
import { Send, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useChat } from "@ai-sdk/react"
import { MessageBubble, type MessageProps } from "./message-bubble"

export function ChatInterface({ 
  chatId, 
  initialMessages = [] 
}: { 
  chatId: string
  initialMessages?: MessageProps[] 
}) {
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: "/api/chat",
    id: chatId === "new" ? undefined : chatId,
    // @ts-ignore
    initialMessages,
    body: {
      chatId
    },
    onError: (err) => {
      toast.error("Failed to send message: " + err.message)
    }
  })

  // Auto-scroll to bottom
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Custom submit handler to prevent empty submissions
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim()) return
    handleSubmit(e)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (input.trim()) {
        const form = e.currentTarget.form
        if (form) form.requestSubmit()
      }
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] relative">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-32 pt-8">
        <div className="mx-auto max-w-3xl">
          {messages.length === 0 ? (
            <div className="flex h-[50vh] flex-col items-center justify-center text-center space-y-6 animate-fade-in">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-primary/20 to-primary/5 flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.15)] border border-primary/20">
                <Bot className="h-10 w-10 text-primary" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">How can I help you build today?</h2>
                <p className="text-zinc-400 max-w-md mx-auto text-lg">
                  I am BLACK AI, your expert engineering and design partner. Let's create something spectacular.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col space-y-8 pb-6">
              {messages.map((msg, i) => (
                <MessageBubble 
                  key={msg.id || i} 
                  message={{
                    role: msg.role === "user" ? "USER" : "ASSISTANT",
                    content: msg.content
                  }} 
                />
              ))}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex gap-4 p-6 rounded-2xl bg-zinc-900/40 border border-white/5 w-[85%] mr-auto animate-pulse">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/20 border border-primary/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex items-center gap-1.5 h-10">
                    <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input Area - Floating Glass Pill */}
      <div className="absolute bottom-6 left-0 right-0 px-4 md:px-8">
        <div className="mx-auto max-w-3xl">
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive shadow-lg backdrop-blur-md animate-slide-in-up">
              <AlertCircle className="h-5 w-5" />
              <p>{error.message || "An error occurred during chat."}</p>
            </div>
          )}

          <form 
            onSubmit={onSubmit}
            className="relative flex items-end gap-2 rounded-[2rem] glass-card bg-zinc-900/60 p-2 shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent pointer-events-none" />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="mb-1 ml-1 h-10 w-10 rounded-full text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition-colors"
            >
              <Paperclip className="h-5 w-5" />
              <span className="sr-only">Attach file</span>
            </Button>
            
            <Textarea
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Message BLACK AI..."
              className="min-h-[52px] w-full resize-none border-0 bg-transparent px-2 py-4 focus-visible:ring-0 text-base shadow-none placeholder:text-zinc-500"
              rows={1}
            />
            
            <Button 
              type="submit" 
              size="icon"
              disabled={isLoading || !input.trim()}
              className="mb-1 mr-1 h-12 w-12 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all duration-300 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]"
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Send className="h-5 w-5" />
              )}
              <span className="sr-only">Send message</span>
            </Button>
          </form>
          <div className="text-center mt-3">
             <p className="text-[11px] text-zinc-500 font-medium">BLACK AI can make mistakes. Consider verifying important information.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
