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
  UserCircle,
  FileText,
  BarChart3,
  Kanban,
  Search,
  Mail,
  GraduationCap,
} from "lucide-react"

const mainNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Job Search", href: "/jobs", icon: Search },
  { name: "Applications", href: "/applications", icon: Kanban },
  { name: "Interviews", href: "/interviews", icon: GraduationCap },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
]

const toolsNavigation = [
  { name: "Career Profile", href: "/career-profile", icon: UserCircle },
  { name: "Resumes", href: "/resumes", icon: FileText },
  { name: "Automation", href: "/automation", icon: Bot },
  { name: "Email Monitor", href: "/email-monitor", icon: Mail },
]

const builderNavigation = [
  { name: "AI Chat", href: "/chat", icon: MessageSquare },
  { name: "Projects", href: "/projects", icon: Code2 },
]

const bottomNavigation = [
  { name: "Settings", href: "/settings", icon: Settings },
]

function NavSection({ label, items, pathname }: { label: string; items: typeof mainNavigation; pathname: string }) {
  return (
    <div className="space-y-1">
      <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-2">
        {label}
      </p>
      {items.map((item) => {
        const isActive = pathname.startsWith(item.href)
        return (
          <Link
            key={item.name}
            href={item.href}
            prefetch={false}
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-primary/10 text-primary shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]"
                : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
            )}
          >
            <item.icon
              className={cn(
                "h-4 w-4 shrink-0 transition-colors",
                isActive ? "text-primary" : "text-zinc-500 group-hover:text-zinc-300"
              )}
              aria-hidden="true"
            />
            {item.name}
            {isActive && (
              <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
            )}
          </Link>
        )
      })}
    </div>
  )
}

export function Sidebar({ user, className }: { user: any; className?: string }) {
  const pathname = usePathname()

  return (
    <div className={cn("flex h-full w-64 flex-col bg-sidebar text-sidebar-foreground", className)}>
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-white/5">
        <Link href="/dashboard" className="flex items-center gap-2.5 font-bold group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-blue-600 text-white text-sm font-black shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-shadow group-hover:shadow-[0_0_30px_rgba(59,130,246,0.6)]">
            B
          </div>
          <div className="flex flex-col">
            <span className="text-base tracking-tight leading-none">BLACK AI</span>
            <span className="text-[9px] tracking-[0.2em] text-zinc-500 font-normal uppercase">Job Hunter</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4 px-3 space-y-6">
        <NavSection label="Hunt" items={mainNavigation} pathname={pathname} />
        <NavSection label="Tools" items={toolsNavigation} pathname={pathname} />
        <NavSection label="Builder" items={builderNavigation} pathname={pathname} />
        
        <div className="flex-1" />
        
        <NavSection label="" items={bottomNavigation} pathname={pathname} />
      </div>

      {/* User footer */}
      <div className="shrink-0 border-t border-white/5 p-3">
        <Link 
          href="/career-profile"
          className="flex items-center gap-3 rounded-lg p-2.5 hover:bg-white/5 transition-all duration-200 group"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-blue-600/20 text-primary font-semibold text-sm border border-primary/20">
            {user?.firstName?.charAt(0) || "U"}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="truncate text-sm font-medium text-zinc-200">
              {user?.displayName || `${user?.firstName || ''} ${user?.lastName || ''}`}
            </span>
            <span className="truncate text-xs text-zinc-500">
              {user?.jobTitle || "Job Seeker"}
            </span>
          </div>
        </Link>
      </div>
    </div>
  )
}
