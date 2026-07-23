"use client"

import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Sidebar } from "@/components/common/sidebar"
import * as React from "react"
import { usePathname } from "next/navigation"

export function MobileSidebar({ user }: { user: any }) {
  const [open, setOpen] = React.useState(false)
  const pathname = usePathname()

  // Close sidebar on route change
  React.useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-64 border-r-0">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <Sidebar user={user} className="w-full" />
      </SheetContent>
    </Sheet>
  )
}
