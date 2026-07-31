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
import { fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "@/app/(dashboard)/automation/actions"
import Link from "next/link"

interface NotificationItem {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  link: string | null
  createdAt: Date
}

export function NotificationPopover({ userId }: { userId: string }) {
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([])

  const loadNotifications = React.useCallback(async () => {
    try {
      const data = await fetchNotifications()
      // Map Date string back to Date object if needed
      setNotifications(data.map(n => ({
        ...n,
        createdAt: new Date(n.createdAt)
      })))
    } catch (e) {
      console.error("Failed to load notifications:", e)
    }
  }, [])

  React.useEffect(() => {
    loadNotifications()
    
    // Poll for new notifications every 15 seconds (quasi push)
    const interval = setInterval(() => {
      loadNotifications()
    }, 15000)

    return () => clearInterval(interval)
  }, [loadNotifications])

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationAsRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
    } catch (e) {
      console.error(e)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    } catch (e) {
      console.error(e)
    }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative hover:bg-zinc-800/50">
          <Bell className="h-5 w-5 text-zinc-300" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          )}
          <span className="sr-only">Toggle notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 bg-zinc-950 border border-white/10 text-zinc-100 shadow-2xl" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h4 className="font-semibold text-sm">Notifications ({unreadCount} new)</h4>
          {unreadCount > 0 && (
            <Button 
              onClick={handleMarkAllRead}
              variant="ghost" 
              size="sm" 
              className="h-auto text-xs px-2 text-primary hover:text-primary/80 hover:bg-transparent"
            >
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-zinc-500">
              No new notifications
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notification, i) => {
                const content = (
                  <div 
                    onClick={() => !notification.isRead && handleMarkRead(notification.id)}
                    className={`p-4 flex gap-3 cursor-pointer hover:bg-white/5 transition-colors ${!notification.isRead ? 'bg-primary/5' : ''}`}
                  >
                    <div className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" style={{ opacity: !notification.isRead ? 1 : 0 }} />
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-tight">{notification.title}</p>
                      <p className="text-xs text-zinc-400 leading-snug">{notification.message}</p>
                      <p className="text-[10px] text-zinc-500">{notification.createdAt.toLocaleTimeString()}</p>
                    </div>
                  </div>
                )

                return (
                  <React.Fragment key={notification.id}>
                    {notification.link ? (
                      <Link href={notification.link} passHref legacyBehavior>
                        {content}
                      </Link>
                    ) : (
                      content
                    )}
                    {i < notifications.length - 1 && <Separator className="bg-white/5" />}
                  </React.Fragment>
                )
              })}
            </div>
          )}
        </ScrollArea>
        <div className="p-2 border-t border-white/10 text-center">
          <Link href="/jobs" passHref legacyBehavior>
            <Button variant="ghost" size="sm" className="w-full text-xs hover:bg-zinc-800/50">
              View all notifications
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  )
}
