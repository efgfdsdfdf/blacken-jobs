import { Metadata } from "next"
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form"

export const metadata: Metadata = {
  title: "Forgot Password | BLACK AI",
  description: "Reset your BLACK AI password.",
}

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Reset password</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email address and we will send you a reset link
        </p>
      </div>
      <ForgotPasswordForm />
    </div>
  )
}
