import { Metadata } from "next"
import { LoginForm } from "@/features/auth/components/login-form"

export const metadata: Metadata = {
  title: "Login | BLACK AI",
  description: "Login to your BLACK AI account.",
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams
  const redirectTo = typeof resolvedParams.redirectTo === "string" ? resolvedParams.redirectTo : "/dashboard"

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and password to access your account
        </p>
      </div>
      <LoginForm redirectTo={redirectTo} />
    </div>
  )
}
