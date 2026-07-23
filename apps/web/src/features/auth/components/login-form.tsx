"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Label } from "@/components/ui/label"
import { login } from "@/features/auth/actions/login"
import { LoginSchema, type LoginInput } from "@/features/auth/schemas"

export function LoginForm({ redirectTo = "/dashboard" }: { redirectTo?: string }) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()

  const form = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  function onSubmit(data: LoginInput) {
    startTransition(async () => {
      const result = await login(data, redirectTo)
      
      if (result.error) {
        toast.error(result.error)
        return
      }
      
      toast.success("Successfully logged in")
      router.push(result.redirect!)
    })
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
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isPending}
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link 
                href="/forgot-password" 
                className="text-sm font-medium text-primary hover:underline"
                tabIndex={-1}
              >
                Forgot password?
              </Link>
            </div>
            <PasswordInput
              id="password"
              disabled={isPending}
              {...form.register("password")}
            />
            {form.formState.errors.password && (
              <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
            )}
          </div>
          <Button disabled={isPending} className="w-full">
            {isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Sign In
          </Button>
        </div>
      </form>
      <div className="text-center text-sm">
        Don't have an account?{" "}
        <Link href="/register" className="font-semibold text-primary hover:underline">
          Sign up
        </Link>
      </div>
    </div>
  )
}
