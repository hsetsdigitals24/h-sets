"use server";

import { revalidatePath } from "next/cache";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { canBroadcast } from "@/lib/rbac";
import { notifyUsers } from "@/lib/notifications";
import { broadcastSchema } from "@/lib/schemas";
import type { ContentActionState } from "@/lib/content-forms";

/** Broadcast an announcement to a chosen audience. */
export async function broadcastNotification(
  _prev: ContentActionState,
  formData: FormData
): Promise<ContentActionState> {
  const user = await requireUser();
  if (!canBroadcast(user.role)) return { error: "You don't have permission to broadcast." };

  const parsed = broadcastSchema.safeParse({
    audience: formData.get("audience"),
    title: formData.get("title"),
    body: formData.get("body"),
    link: formData.get("link"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const { audience, title, body, link } = parsed.data;
  const where =
    audience === "all"
      ? {}
      : audience === "students"
        ? { role: "STUDENT" as Role }
        : { role: audience as Role };

  const recipients = await prisma.user.findMany({ where, select: { id: true } });
  if (recipients.length === 0) return { error: "No users match that audience." };

  await notifyUsers(
    recipients.map((r) => r.id),
    {
      type: "announcement",
      title,
      body: body?.trim() || null,
      link: link?.trim() || null,
    }
  );

  revalidatePath("/admin/notifications");
  return { ok: true };
}
