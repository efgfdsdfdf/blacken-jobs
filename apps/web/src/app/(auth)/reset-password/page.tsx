import { Metadata } from "next"
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Set New Password | BLACK AI",
  description: "Set your new BLACK AI password.",
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const code = params.code

  if (!code || typeof code !== "string") {
    redirect("/login")
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Set new password</h1>
        <p className="text-sm text-muted-foreground">
          Enter your new password below
        </p>
      </div>
      <ResetPasswordForm code={code} />
    </div>
  )
}
