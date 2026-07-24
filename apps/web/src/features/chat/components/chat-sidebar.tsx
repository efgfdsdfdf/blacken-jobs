"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Plus, MessageSquare, MoreHorizontal, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { toast } from "sonner"

// Mock fetch for now, will connect to API shortly
type ChatPreview = {
  id: string
  title: string
  updatedAt: string
}

export function ChatSidebar({ className, onChatSelect }: { className?: string; onChatSelect?: () => void }) {
  const params = useParams()
  const router = useRouter()
  const [chats, setChats] = React.useState<ChatPreview[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  const fetchChats = React.useCallback(async () => {
    try {
      const res = await fetch("/api/chats")
      if (res.ok) {
        const json = await res.json()
        setChats(json.data)
      }
    } catch (error) {
      console.error("Failed to fetch chats:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchChats()
    
    // Poll every 5 seconds to catch smart title updates
    const interval = setInterval(() => {
      fetchChats()
    }, 5000)
    
    return () => clearInterval(interval)
  }, [fetchChats])

  const handleNewChat = () => {
    router.push('/chat')
  }

  const handleDeleteChat = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const res = await fetch(`/api/chats/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Chat deleted")
        setChats((prev) => prev.filter((c) => c.id !== id))
        if (params.id === id) {
          router.push("/chat")
        }
      }
    } catch (err) {
      toast.error("Failed to delete chat")
    }
  }

  return (
    <div className={cn("flex w-64 flex-col bg-muted/30", className)}>
      <div className="p-4 border-b">
        <Button 
          onClick={() => {
            handleNewChat()
            onChatSelect?.()
          }} 
          className="w-full justify-start gap-2 bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary transition-colors border border-primary/20"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground animate-pulse">
              Loading history...
            </div>
          ) : chats.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No previous chats
            </div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                className={cn(
                  "group flex items-center gap-2 rounded-lg pl-3 pr-1 py-1 text-sm transition-colors hover:bg-accent w-full overflow-hidden",
                  params.id === chat.id ? "bg-accent font-medium text-accent-foreground" : "text-muted-foreground"
                )}
              >
                <MessageSquare className="h-4 w-4 shrink-0" />
                <Link onClick={() => onChatSelect?.()} href={`/chat/${chat.id}`} className="flex-1 min-w-0 truncate outline-none py-1">
                  {chat.title}
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => handleDeleteChat(chat.id, e as any)}
                  className="h-7 w-7 shrink-0 opacity-100 bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-400 z-50 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete Chat</span>
                </Button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
