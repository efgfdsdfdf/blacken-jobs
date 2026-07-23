"use client"

import * as React from "react"
import { Send, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { createClient } from "@/lib/supabase/client"
import { MessageBubble, type MessageProps } from "./message-bubble"

export function ChatInterface({ 
  chatId, 
  initialMessages = [] 
}: { 
  chatId: string
  initialMessages?: MessageProps[] 
}) {
  const [messages, setMessages] = React.useState<MessageProps[]>(initialMessages)
  const [input, setInput] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

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

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    
    if (!input.trim() || isLoading) return
    
    const userMsg = input.trim()
    setInput("")
    setError(null)
    
    // Optimistic UI update
    setMessages(prev => [...prev, { role: "USER", content: userMsg }])
    setIsLoading(true)

    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      let activeChatId = chatId
      if (activeChatId === "new") {
        const createRes = await fetch("http://localhost:4000/api/v1/chats", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${session?.access_token}`
          },
          credentials: "include"
        })
        if (!createRes.ok) throw new Error("Failed to create chat")
        const createJson = await createRes.json()
        activeChatId = createJson.data.id
        // We could router.push here, but it might interrupt the stream. We'll update the URL silently
        window.history.replaceState(null, "", `/chat/${activeChatId}`)
      }

      const response = await fetch(`http://localhost:4000/api/v1/chats/${activeChatId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`
        },
        credentials: "include",
        body: JSON.stringify({ content: userMsg })
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      // Read SSE stream
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantMsg = ""

      // Add empty assistant message that we will append to
      setMessages(prev => [...prev, { role: "ASSISTANT", content: "" }])

      if (reader) {
        let done = false
        while (!done) {
          const { value, done: readerDone } = await reader.read()
          done = readerDone
          if (value) {
            const chunk = decoder.decode(value, { stream: true })
            const lines = chunk.split("\n\n")
            
            for (const line of lines) {
              if (line.startsWith("data: ")) {
                try {
                  const data = JSON.parse(line.slice(6))
                  if (data.text) {
                    assistantMsg += data.text
                    setMessages(prev => {
                      const newMsgs = [...prev]
                      newMsgs[newMsgs.length - 1].content = assistantMsg
                      return newMsgs
                    })
                  } else if (data.error) {
                    setError(data.error)
                  }
                } catch (err) {
                  // Ignore parse errors from incomplete chunks
                }
              }
            }
          }
        }
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto"
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
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
              <MessageBubble key={i} message={msg} />
            ))}
          </div>
        )}
      </div>

      <div className="p-4 bg-background border-t">
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            <p>{error}</p>
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
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
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
