/**
 * @module @repo/types/user
 * @description User-related Zod schemas and TypeScript types.
 */

import { z } from "zod";

// -----------------------------------------------------------------------------
// Enums
// -----------------------------------------------------------------------------

export const UserRole = {
  USER: "USER",
  ADMIN: "ADMIN",
  OWNER: "OWNER",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const ThemeOption = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system",
} as const;

export type ThemeOption = (typeof ThemeOption)[keyof typeof ThemeOption];

// -----------------------------------------------------------------------------
// Validation Schemas
// -----------------------------------------------------------------------------

/** Schema for updating user profile information. */
export const UpdateProfileSchema = z.object({
  firstName: z.string().max(50).optional(),
  lastName: z.string().max(50).optional(),
  displayName: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  phoneNumber: z.string().max(20).optional(),
  location: z.string().max(100).optional(),
  website: z.string().url().or(z.literal("")).optional(),
  company: z.string().max(100).optional(),
  jobTitle: z.string().max(100).optional(),
  githubUrl: z.string().url().or(z.literal("")).optional(),
  linkedinUrl: z.string().url().or(z.literal("")).optional(),
  twitterUrl: z.string().url().or(z.literal("")).optional(),
});

/** Schema for updating user settings/preferences. */
export const UpdateSettingsSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).optional(),
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  twoFactorEnabled: z.boolean().optional(),
  timezone: z.string().max(50).optional(),
  language: z.string().max(10).optional(),
  dateFormat: z.string().max(20).optional(),
});

/** Schema for changing password. */
export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  });

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
export type UpdateSettingsInput = z.infer<typeof UpdateSettingsSchema>;
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;

/** Full user profile as returned from API. */
export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  isEmailVerified: boolean;
  createdAt: string;
  profile: {
    firstName: string | null;
    lastName: string | null;
    displayName: string | null;
    avatarUrl: string | null;
    bio: string | null;
    phoneNumber: string | null;
    location: string | null;
    website: string | null;
    company: string | null;
    jobTitle: string | null;
    githubUrl: string | null;
    linkedinUrl: string | null;
    twitterUrl: string | null;
  } | null;
  settings: {
    theme: string;
    emailNotifications: boolean;
    pushNotifications: boolean;
    twoFactorEnabled: boolean;
    timezone: string;
    language: string;
    dateFormat: string;
  } | null;
}
