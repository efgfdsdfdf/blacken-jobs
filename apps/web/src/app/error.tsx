"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
      <div className="text-center space-y-5">
        <h2 className="text-3xl font-semibold tracking-tight text-destructive">Something went wrong!</h2>
        <p className="text-muted-foreground max-w-[500px] mx-auto">
          An unexpected error occurred. Our team has been notified.
        </p>
        <div className="pt-4">
          <Button onClick={() => reset()}>Try again</Button>
        </div>
      </div>
    </div>
  )
}
