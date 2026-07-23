/**
 * @module dal/auth
 * @description Server-only Data Access Layer for authentication.
 * Verifies the current user's session via Supabase Auth and
 * looks up the corresponding user in our database.
 */

import "server-only";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@repo/db";
import type { SessionUser } from "@repo/types";

/**
 * Get the currently authenticated user.
 * Validates the session via Supabase Auth (using getUser() for server-side
 * security), then looks up the user in our database.
 *
 * @returns The authenticated user or null if not authenticated.
 */
export async function getAuthenticatedUser(): Promise<SessionUser | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  // Look up user in our database by Supabase ID
  let dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    include: { profile: true, settings: true },
  });

  // Lazy-sync the user into our DB if they just registered via Supabase
  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        supabaseId: user.id,
        email: user.email!,
        profile: {
          create: {
            firstName: user.user_metadata?.first_name || "New",
            lastName: user.user_metadata?.last_name || "User",
          }
        },
        settings: {
          create: {}
        }
      },
      include: { profile: true, settings: true },
    });
  }

  if (dbUser.deletedAt) {
    return null;
  }

  return {
    id: dbUser.id,
    email: dbUser.email,
    role: dbUser.role,
    supabaseId: dbUser.supabaseId,
  };
}

/**
 * Require authentication. Redirects to /login if no valid session exists.
 * Use this in Server Components and Server Actions that require a logged-in user.
 *
 * @returns The authenticated session user (never null — redirects instead).
 */
export async function requireAuth(): Promise<SessionUser> {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
