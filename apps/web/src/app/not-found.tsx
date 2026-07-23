import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
      <div className="text-center space-y-5">
        <h1 className="text-8xl font-bold tracking-tighter text-primary">404</h1>
        <h2 className="text-3xl font-semibold tracking-tight">Page Not Found</h2>
        <p className="text-muted-foreground max-w-[500px] mx-auto">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="pt-4">
          <Button asChild>
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
