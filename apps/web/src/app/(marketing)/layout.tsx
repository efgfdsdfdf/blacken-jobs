import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold shadow-[0_0_15px_rgba(59,130,246,0.5)] group-hover:shadow-[0_0_25px_rgba(59,130,246,0.6)] transition-shadow">
              B
            </div>
            <span className="text-xl font-bold tracking-tight">BLACK AI</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">
              Sign In
            </Link>
            <Button asChild>
              <Link href="/register">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-8 flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
              B
            </div>
            <span className="font-semibold text-sm">BLACK AI © {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-foreground">Terms</Link>
            <Link href="#" className="hover:text-foreground">Privacy</Link>
            <Link href="#" className="hover:text-foreground">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
