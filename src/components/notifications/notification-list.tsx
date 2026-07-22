"use client";

import { useState } from "react";
import { markAllNotificationsRead } from "@/lib/notification-actions";
import { NotificationRow } from "./notification-row";
import type { NotificationItem } from "./types";

// Full-page notification list with a mark-all-read control. Rendered inside the
// student and admin notification pages with a server-fetched initial set.
export function NotificationList({ initial }: { initial: NotificationItem[] }) {
  const [items, setItems] = useState<NotificationItem[]>(initial);
  const hasUnread = items.some((n) => !n.read);

  function markLocalRead(id: string) {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  async function handleMarkAll() {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    await markAllNotificationsRead();
  }

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="text-sm font-semibold">All notifications</span>
        {hasUnread && (
          <button
            type="button"
            onClick={handleMarkAll}
            className="text-xs font-medium text-primary hover:underline"
          >
            Mark all read
          </button>
        )}
      </div>
      <div className="p-1">
        {items.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-muted-foreground">
            You have no notifications yet.
          </p>
        ) : (
          items.map((item) => (
            <NotificationRow key={item.id} item={item} onHandled={markLocalRead} />
          ))
        )}
      </div>
    </div>
  );
}
