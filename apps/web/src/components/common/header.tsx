"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ModeToggle } from "@/components/mode-toggle"
import { UserMenu } from "@/components/common/user-menu"
import { MobileSidebar } from "@/components/common/mobile-sidebar"
import { NotificationPopover } from "@/components/common/notification-popover"
import { usePathname } from "next/navigation"

export function Header({ user }: { user: any }) {
  const pathname = usePathname()
  
  // Create a simple breadcrumb from pathname
  const pathSegments = pathname.split('/').filter(Boolean)
  const title = pathSegments.length > 0 
    ? pathSegments[0].charAt(0).toUpperCase() + pathSegments[0].slice(1) 
    : 'Dashboard'

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-md md:px-6">
      <MobileSidebar user={user} />
      
      <div className="flex flex-1 items-center gap-4 md:gap-6">
        <h1 className="text-lg font-semibold md:text-xl">{title}</h1>
        
        <div className="ml-auto flex items-center gap-2 md:gap-4">
          <div className="relative hidden sm:block w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full bg-background pl-8 shadow-none md:w-[200px] lg:w-[300px]"
            />
          </div>
          
          <NotificationPopover userId={user.id} />
          <ModeToggle />
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  )
}
