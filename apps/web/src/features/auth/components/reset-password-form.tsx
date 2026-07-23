"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Label } from "@/components/ui/label"
import { updatePassword } from "@/features/auth/actions/reset-password"
import { ResetPasswordSchema, type ResetPasswordInput } from "@/features/auth/schemas"

export function ResetPasswordForm({ code }: { code: string }) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  function onSubmit(data: ResetPasswordInput) {
    startTransition(async () => {
      const result = await updatePassword(data, code)
      
      if (result.error) {
        toast.error(result.error)
        return
      }
      
      toast.success("Password updated successfully")
      router.push(result.redirect!)
    })
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="password">New Password</Label>
            <PasswordInput
              id="password"
              disabled={isPending}
              {...form.register("password")}
            />
            {form.formState.errors.password && (
              <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <PasswordInput
              id="confirmPassword"
              disabled={isPending}
              {...form.register("confirmPassword")}
            />
            {form.formState.errors.confirmPassword && (
              <p className="text-sm text-destructive">{form.formState.errors.confirmPassword.message}</p>
            )}
          </div>
          <Button disabled={isPending} className="w-full">
            {isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Update password
          </Button>
        </div>
      </form>
    </div>
  )
}
