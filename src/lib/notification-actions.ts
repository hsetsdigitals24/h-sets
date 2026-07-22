"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { markAllRead, markRead } from "@/lib/notifications";

/** Mark a single notification read for the current user. */
export async function markNotificationRead(id: string): Promise<void> {
  const user = await requireUser();
  await markRead(user.id, id);
  revalidatePath("/account/notifications");
  revalidatePath("/admin/notifications");
}

/** Mark all of the current user's notifications read. */
export async function markAllNotificationsRead(): Promise<void> {
  const user = await requireUser();
  await markAllRead(user.id);
  revalidatePath("/account/notifications");
  revalidatePath("/admin/notifications");
}
