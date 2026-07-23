"use client"

import * as React from "react"
import { History, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { ChatSidebar } from "./chat-sidebar"

export function MobileChatSidebar() {
  const [open, setOpen] = React.useState(false)

  return (
    <div className="md:hidden absolute top-4 left-4 z-50">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-md border-white/10 shadow-lg">
            <History className="h-5 w-5 text-zinc-400" />
            <span className="sr-only">Chat History</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-72 border-r-0 bg-zinc-950">
          <SheetTitle className="sr-only">Chat History</SheetTitle>
          <div onClick={() => setOpen(false)} className="h-full">
            <ChatSidebar className="w-full h-full flex border-0 bg-transparent" />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
