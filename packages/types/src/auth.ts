/**
 * @module @repo/types/auth
 * @description Authentication-related Zod schemas and TypeScript types.
 * Used by both frontend (form validation) and backend (request validation).
 */

import { z } from "zod";

// -----------------------------------------------------------------------------
// Validation Schemas
// -----------------------------------------------------------------------------

/** Schema for user login requests. */
export const LoginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

/** Schema for user registration requests. */
export const RegisterSchema = z
  .object({
    firstName: z
      .string()
      .min(1, "First name is required")
      .max(50, "First name must be under 50 characters"),
    lastName: z
      .string()
      .min(1, "Last name is required")
      .max(50, "Last name must be under 50 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/** Schema for forgot password requests. */
export const ForgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

/** Schema for password reset requests. */
export const ResetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

/** Authenticated session user returned from auth checks. */
export interface SessionUser {
  id: string;
  email: string;
  role: string;
  supabaseId: string;
}

/** Standard auth response from the API. */
export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: SessionUser;
  redirectTo?: string;
}
