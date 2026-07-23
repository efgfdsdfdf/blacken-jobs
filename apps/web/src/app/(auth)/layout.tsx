import Link from "next/link"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute -bottom-[40%] -right-[20%] w-[70%] h-[70%] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-md px-4 sm:px-0">
        <Link href="/" className="mb-8 flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold shadow-[0_0_15px_rgba(59,130,246,0.5)] group-hover:shadow-[0_0_25px_rgba(59,130,246,0.6)] transition-shadow">
            B
          </div>
          <span className="text-xl font-bold tracking-tight">BLACK AI</span>
        </Link>
        <div className="w-full bg-card border border-border/50 rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-sm">
          {children}
        </div>
      </div>
    </div>
  )
}
