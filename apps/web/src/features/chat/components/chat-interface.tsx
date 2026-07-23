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
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: "/api/chat",
    id: chatId === "new" ? undefined : chatId,
    // @ts-ignore
    initialMessages,
    body: {
      chatId
    },
    onResponse: (response) => {
      const newChatId = response.headers.get("x-chat-id")
      if (newChatId && chatId === "new") {
        window.history.replaceState(null, "", `/dashboard/chat/${newChatId}`)
      }
    }
  })

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }

  React.useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Auto-resize textarea
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [input])

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      // Submit the form
      const form = e.currentTarget.form
      if (form) form.requestSubmit()
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto scroll-smooth"
      >
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center p-8 text-center text-muted-foreground animate-fade-in">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-lg shadow-primary/20">
              <Send className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Send a message to start</h2>
            <p className="mt-2 max-w-sm text-sm">
              I can help you write code, debug issues, or plan out your next big architecture.
            </p>
          </div>
        ) : (
          <div className="flex flex-col pb-6">
            {messages.map((msg, i) => (
              <MessageBubble 
                key={msg.id || i} 
                message={{
                  role: msg.role === "user" ? "USER" : "ASSISTANT",
                  content: msg.content
                }} 
              />
            ))}
          </div>
        )}
      </div>

      <div className="p-4 bg-background border-t">
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            <p>{error.message || "An error occurred during chat."}</p>
          </div>
        )}
        <form 
          onSubmit={handleSubmit}
          className="relative flex items-end gap-2 rounded-xl border bg-muted/50 p-2 focus-within:ring-1 focus-within:ring-ring focus-within:border-primary transition-all shadow-sm max-w-4xl mx-auto"
        >
          <Textarea
            ref={textareaRef}
            tabIndex={0}
            rows={1}
            value={input}
            onChange={handleInputChange}
            onKeyDown={onKeyDown}
            placeholder="Ask BLACK AI anything..."
            spellCheck={false}
            className="min-h-[2.5rem] max-h-[200px] w-full resize-none border-0 bg-transparent px-3 py-2 text-sm shadow-none focus-visible:ring-0 overflow-y-auto"
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={!input.trim() || isLoading}
            className="mb-0.5 mr-0.5 shrink-0 rounded-lg shadow-md shadow-primary/20"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="sr-only">Send message</span>
          </Button>
        </form>
        <div className="mt-2 text-center text-xs text-muted-foreground">
          BLACK AI can make mistakes. Consider verifying critical code.
        </div>
      </div>
    </div>
  )
}

