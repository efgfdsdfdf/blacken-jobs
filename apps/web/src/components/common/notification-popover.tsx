"use client"

import * as React from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

export function NotificationPopover({ userId }: { userId: string }) {
  // In a real app, you would fetch notifications here
  const notifications = [
    { id: 1, title: "Welcome to BLACK AI", time: "2 hours ago", unread: true },
    { id: 2, title: "Your project build succeeded", time: "1 day ago", unread: false },
  ]
  const unreadCount = notifications.filter(n => n.unread).length

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive" />
          )}
          <span className="sr-only">Toggle notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h4 className="font-semibold text-sm">Notifications</h4>
          <Button variant="ghost" size="sm" className="h-auto text-xs px-2">
            Mark all read
          </Button>
        </div>
        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No new notifications
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notification, i) => (
                <React.Fragment key={notification.id}>
                  <div className={`p-4 flex gap-3 ${notification.unread ? 'bg-primary/5' : ''}`}>
                    <div className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0" style={{ opacity: notification.unread ? 1 : 0 }} />
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{notification.title}</p>
                      <p className="text-xs text-muted-foreground">{notification.time}</p>
                    </div>
                  </div>
                  {i < notifications.length - 1 && <Separator />}
                </React.Fragment>
              ))}
            </div>
          )}
        </ScrollArea>
        <div className="p-2 border-t text-center">
          <Button variant="ghost" size="sm" className="w-full text-xs">
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
