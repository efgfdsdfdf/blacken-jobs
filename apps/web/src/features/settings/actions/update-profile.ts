"use server"

import { revalidatePath } from "next/cache"

export async function updateProfile(formData: FormData) {
  // Mock function
  // In reality: validate with zod, update DB
  console.log("Updating profile", Object.fromEntries(formData))
  
  revalidatePath("/profile")
  revalidatePath("/settings")
  
  return { success: true }
}
