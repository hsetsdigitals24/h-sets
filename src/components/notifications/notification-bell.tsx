"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { markAllNotificationsRead } from "@/lib/notification-actions";
import { NotificationRow } from "./notification-row";
import type { NotificationItem } from "./types";

const POLL_MS = 45_000;

export function NotificationBell({ viewAllHref }: { viewAllHref: string }) {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { unread: number; items: NotificationItem[] };
      setUnread(data.unread);
      setItems(data.items);
    } catch {
      // Network hiccup — keep the last known state, try again next tick.
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, POLL_MS);
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, [refresh]);

  // Refetch whenever the dropdown is opened.
  useEffect(() => {
    if (open) refresh();
  }, [open, refresh]);

  function markLocalRead(id: string) {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnread((u) => Math.max(0, u - 1));
  }

  async function handleMarkAll() {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
    await markAllNotificationsRead();
    refresh();
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ""}`}
          className="relative inline-flex size-9 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Bell className="size-4" />
          {unread > 0 && (
            <Badge
              variant="default"
              className="absolute -right-1 -top-1 min-w-4 justify-center bg-destructive px-1 py-0 text-[10px] leading-4 text-white"
            >
              {unread > 99 ? "99+" : unread}
            </Badge>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <span className="text-sm font-semibold">Notifications</span>
          {unread > 0 && (
            <button
              type="button"
              onClick={handleMarkAll}
              className="text-xs font-medium text-primary hover:underline"
            >
              Mark all read
            </button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto p-1">
          {items.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              You&apos;re all caught up.
            </p>
          ) : (
            items.map((item) => (
              <NotificationRow key={item.id} item={item} onHandled={markLocalRead} />
            ))
          )}
        </div>
        <div className="border-t border-border px-3 py-2 text-center">
          <Link
            href={viewAllHref}
            onClick={() => setOpen(false)}
            className="text-xs font-medium text-primary hover:underline"
          >
            View all notifications
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
