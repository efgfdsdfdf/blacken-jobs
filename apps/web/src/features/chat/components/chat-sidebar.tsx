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

export function ChatSidebar({ className }: { className?: string }) {
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
  }, [fetchChats])

  const handleNewChat = () => {
    router.push('/chat')
  }

  return (
    <div className={cn("flex w-64 flex-col bg-muted/30", className)}>
      <div className="p-4 border-b">
        <Button onClick={handleNewChat} className="w-full justify-start shadow-md shadow-primary/20">
          <Plus className="mr-2 h-4 w-4" />
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
                  "group relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent",
                  params.id === chat.id ? "bg-accent font-medium text-accent-foreground" : "text-muted-foreground"
                )}
              >
                <MessageSquare className="h-4 w-4 shrink-0" />
                <Link href={`/chat/${chat.id}`} className="flex-1 truncate outline-none">
                  {chat.title}
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1 h-6 w-6 opacity-0 group-hover:opacity-100"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">More options</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="text-destructive focus:text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
