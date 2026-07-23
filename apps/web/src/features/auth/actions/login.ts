"use server"

import { createClient } from "@/lib/supabase/server"
import { LoginSchema, type LoginInput } from "../schemas"

export async function login(input: LoginInput, redirectTo: string = "/dashboard") {
  const result = LoginSchema.safeParse(input)
  
  if (!result.success) {
    return { error: "Invalid input" }
  }

  const supabase = await createClient()
  
  const { error } = await supabase.auth.signInWithPassword({
    email: result.data.email,
    password: result.data.password,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true, redirect: redirectTo }
}
