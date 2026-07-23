import { Metadata } from "next"
import { RegisterForm } from "@/features/auth/components/register-form"

export const metadata: Metadata = {
  title: "Create an Account | BLACK AI",
  description: "Sign up for BLACK AI.",
}

export default function RegisterPage() {
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
        <p className="text-sm text-muted-foreground">
          Enter your details below to create your account
        </p>
      </div>
      <RegisterForm />
    </div>
  )
}
