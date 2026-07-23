/**
 * @module @repo/types/notification
 * @description Notification-related Zod schemas and TypeScript types.
 */

import { z } from "zod";

// -----------------------------------------------------------------------------
// Enums
// -----------------------------------------------------------------------------

export const NotificationTypeEnum = {
  INFO: "INFO",
  SUCCESS: "SUCCESS",
  WARNING: "WARNING",
  ERROR: "ERROR",
  SYSTEM: "SYSTEM",
} as const;

export type NotificationTypeValue =
  (typeof NotificationTypeEnum)[keyof typeof NotificationTypeEnum];

// -----------------------------------------------------------------------------
// Validation Schemas
// -----------------------------------------------------------------------------

/** Schema for creating a notification. */
export const CreateNotificationSchema = z.object({
  userId: z.string().uuid(),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
  type: z
    .enum(["INFO", "SUCCESS", "WARNING", "ERROR", "SYSTEM"])
    .default("INFO"),
  link: z.string().url().optional(),
});

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type CreateNotificationInput = z.infer<typeof CreateNotificationSchema>;

/** Notification as returned from API. */
export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: NotificationTypeValue;
  isRead: boolean;
  readAt: string | null;
  link: string | null;
  createdAt: string;
}
