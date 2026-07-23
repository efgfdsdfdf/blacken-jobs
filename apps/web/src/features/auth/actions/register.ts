"use server"

import { createClient } from "@/lib/supabase/server"
import { RegisterSchema, type RegisterInput } from "../schemas"

export async function register(input: RegisterInput) {
  const result = RegisterSchema.safeParse(input)
  
  if (!result.success) {
    return { error: "Invalid input" }
  }

  const supabase = await createClient()
  
  const { error } = await supabase.auth.signUp({
    email: result.data.email,
    password: result.data.password,
    options: {
      data: {
        first_name: result.data.firstName,
        last_name: result.data.lastName,
      }
    }
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true, redirect: "/dashboard" }
}
