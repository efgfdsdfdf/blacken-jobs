"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { requestPasswordReset } from "@/features/auth/actions/reset-password"
import { ForgotPasswordSchema } from "@/features/auth/schemas"
import { z } from "zod"

type InputData = z.infer<typeof ForgotPasswordSchema>

export function ForgotPasswordForm() {
  const [isPending, startTransition] = React.useTransition()
  const [isSubmitted, setIsSubmitted] = React.useState(false)

  const form = useForm<InputData>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  function onSubmit(data: InputData) {
    startTransition(async () => {
      const result = await requestPasswordReset(data.email)
      
      if (result.error) {
        toast.error(result.error)
        return
      }
      
      setIsSubmitted(true)
      toast.success("Reset link sent")
    })
  }

  if (isSubmitted) {
    return (
      <div className="text-center space-y-4">
        <p className="text-sm text-muted-foreground">
          If an account exists with that email, we sent a password reset link.
        </p>
        <Button asChild variant="outline" className="w-full">
          <Link href="/login">Return to login</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              disabled={isPending}
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
            )}
          </div>
          <Button disabled={isPending} className="w-full">
            {isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Send reset link
          </Button>
        </div>
      </form>
      <div className="text-center text-sm">
        Remember your password?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  )
}
