// In-app notification service. Server-only.
//
// All writes are best-effort: a failure here must never break the primary
// action that triggered the notification (mirrors the email fallback in
// src/lib/email.ts). Reads and mutations are always scoped by userId so one
// user can never touch another's notifications.

import "server-only";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type NotificationPayload = {
  type: string;
  title: string;
  body?: string | null;
  link?: string | null;
};

/** Create a single notification for one user. Best-effort. */
export async function createNotification(
  userId: string,
  payload: NotificationPayload
): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        userId,
        type: payload.type,
        title: payload.title,
        body: payload.body ?? null,
        link: payload.link ?? null,
      },
    });
  } catch (err) {
    console.error("[notifications] createNotification failed:", err);
  }
}

/** Fan a payload out to many users in one write. Best-effort. */
export async function notifyUsers(
  userIds: string[],
  payload: NotificationPayload
): Promise<void> {
  const ids = [...new Set(userIds)].filter(Boolean);
  if (ids.length === 0) return;
  try {
    await prisma.notification.createMany({
      data: ids.map((userId) => ({
        userId,
        type: payload.type,
        title: payload.title,
        body: payload.body ?? null,
        link: payload.link ?? null,
      })),
    });
  } catch (err) {
    console.error("[notifications] notifyUsers failed:", err);
  }
}

/** Notify every user holding one of the given roles. Best-effort. */
export async function notifyRole(
  roles: Role | Role[],
  payload: NotificationPayload
): Promise<void> {
  const roleList = Array.isArray(roles) ? roles : [roles];
  try {
    const users = await prisma.user.findMany({
      where: { role: { in: roleList } },
      select: { id: true },
    });
    await notifyUsers(
      users.map((u) => u.id),
      payload
    );
  } catch (err) {
    console.error("[notifications] notifyRole failed:", err);
  }
}

export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({ where: { userId, read: false } });
}

export async function listNotifications(
  userId: string,
  { take = 30, skip = 0 }: { take?: number; skip?: number } = {}
) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take,
    skip,
  });
}

/** Mark one notification read — scoped to the owner. */
export async function markRead(userId: string, id: string): Promise<void> {
  await prisma.notification.updateMany({
    where: { id, userId },
    data: { read: true },
  });
}

/** Mark all of a user's notifications read. */
export async function markAllRead(userId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
}
