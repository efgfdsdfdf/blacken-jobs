"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function deleteAccount() {
  const supabase = await createClient()
  
  // Actually delete the user via supabase admin or soft delete in DB
  // This is a complex operation usually involving a webhook or edge function
  
  await supabase.auth.signOut()
  redirect("/")
}
