/**
 * @module dal/user
 * @description Server-only Data Access Layer for user data.
 * Provides functions for fetching user profiles, settings, and notifications
 * from the database via Prisma.
 */

import "server-only";

import { prisma } from "@repo/db";
import type { UserProfile, NotificationItem } from "@repo/types";

/**
 * Fetch a user's complete profile including profile details and settings.
 *
 * @param userId - The internal database user ID.
 * @returns The full user profile or null if not found.
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId, deletedAt: null },
    include: { profile: true, settings: true },
  });

  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    role: user.role as UserProfile["role"],
    isEmailVerified: user.isEmailVerified,
    createdAt: user.createdAt.toISOString(),
    profile: user.profile
      ? {
          firstName: user.profile.firstName,
          lastName: user.profile.lastName,
          displayName: user.profile.displayName,
          avatarUrl: user.profile.avatarUrl,
          bio: user.profile.bio,
          phoneNumber: user.profile.phoneNumber,
          location: user.profile.location,
          website: user.profile.website,
          company: user.profile.company,
          jobTitle: user.profile.jobTitle,
          githubUrl: user.profile.githubUrl,
          linkedinUrl: user.profile.linkedinUrl,
          twitterUrl: user.profile.twitterUrl,
        }
      : null,
    settings: user.settings
      ? {
          theme: user.settings.theme,
          emailNotifications: user.settings.emailNotifications,
          pushNotifications: user.settings.pushNotifications,
          twoFactorEnabled: user.settings.twoFactorEnabled,
          timezone: user.settings.timezone,
          language: user.settings.language,
          dateFormat: user.settings.dateFormat,
        }
      : null,
  };
}

/**
 * Fetch notifications for a user, ordered by creation date descending.
 *
 * @param userId - The internal database user ID.
 * @param limit - Maximum number of notifications to return (default: 10).
 * @returns Array of notification items.
 */
export async function getUserNotifications(
  userId: string,
  limit: number = 10
): Promise<NotificationItem[]> {
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return notifications.map((n) => ({
    id: n.id,
    title: n.title,
    message: n.message,
    type: n.type as NotificationItem["type"],
    isRead: n.isRead,
    readAt: n.readAt?.toISOString() ?? null,
    link: n.link,
    createdAt: n.createdAt.toISOString(),
  }));
}

/**
 * Get the count of unread notifications for a user.
 *
 * @param userId - The internal database user ID.
 * @returns The number of unread notifications.
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: { userId, isRead: false },
  });
}
