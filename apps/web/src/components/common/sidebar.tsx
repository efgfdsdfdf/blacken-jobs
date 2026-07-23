"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  MessageSquare,
  Code2,
  Briefcase,
  Bot,
  Settings,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Chat", href: "/chat", icon: MessageSquare },
  { name: "Projects", href: "/projects", icon: Code2 },
  { name: "Jobs", href: "/jobs", icon: Briefcase },
  { name: "Automation", href: "/automation", icon: Bot },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar({ user, className }: { user: any; className?: string }) {
  const pathname = usePathname()

  return (
    <div className={cn("flex h-full w-64 flex-col bg-sidebar text-sidebar-foreground", className)}>
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-sidebar-border/50">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-shadow group-hover:shadow-[0_0_25px_rgba(59,130,246,0.6)]">
            B
          </div>
          <span className="text-xl tracking-tight">BLACK AI</span>
        </Link>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto pt-4 pb-4">
        <nav className="flex-1 space-y-1 px-4">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 shrink-0",
                    isActive ? "text-primary" : "text-sidebar-foreground/70 group-hover:text-sidebar-accent-foreground"
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="shrink-0 border-t border-sidebar-border/50 p-4">
        <div className="flex items-center gap-3 rounded-md p-2 hover:bg-sidebar-accent transition-colors">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-semibold">
            {user.firstName?.charAt(0) || "U"}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="truncate text-sm font-medium">
              {user.displayName || `${user.firstName} ${user.lastName}`}
            </span>
            <span className="truncate text-xs text-sidebar-foreground/70">
              {user.jobTitle || "Member"}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
