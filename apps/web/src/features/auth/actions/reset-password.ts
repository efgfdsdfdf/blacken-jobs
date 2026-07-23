"use server"

import { createClient } from "@/lib/supabase/server"
import { ForgotPasswordSchema, ResetPasswordSchema, type ResetPasswordInput } from "../schemas"

export async function requestPasswordReset(email: string) {
  const supabase = await createClient()
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/reset-password`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}



export async function updatePassword(input: ResetPasswordInput, code: string) {
  const result = ResetPasswordSchema.safeParse(input)
  
  if (!result.success) {
    return { error: "Invalid input" }
  }

  const supabase = await createClient()
  
  // Exchange code for session first
  const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code)
  if (sessionError) {
    return { error: "Invalid or expired reset link" }
  }

  const { error } = await supabase.auth.updateUser({
    password: result.data.password
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true, redirect: "/login?message=Password updated successfully" }
}
