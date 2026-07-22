"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { cn, timeAgo } from "@/lib/utils";
import { markNotificationRead } from "@/lib/notification-actions";
import type { NotificationItem } from "./types";

// A single notification row. Clicking marks it read and, if it carries a link,
// navigates there. `onHandled` lets the parent (bell/list) optimistically
// refresh its local state.
export function NotificationRow({
  item,
  onHandled,
}: {
  item: NotificationItem;
  onHandled?: (id: string) => void;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  function handleClick() {
    if (!item.read) {
      onHandled?.(item.id);
      startTransition(async () => {
        await markNotificationRead(item.id);
      });
    }
    if (item.link) router.push(item.link);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted",
        !item.read && "bg-primary/5"
      )}
    >
      <span
        className={cn(
          "mt-1.5 size-2 shrink-0 rounded-full",
          item.read ? "bg-transparent" : "bg-primary"
        )}
        aria-hidden
      />
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-2">
          <span className="truncate text-sm font-medium text-foreground">
            {item.title}
          </span>
          <span className="shrink-0 text-xs text-muted-foreground">
            {timeAgo(item.createdAt)}
          </span>
        </span>
        {item.body && (
          <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">
            {item.body}
          </span>
        )}
      </span>
    </button>
  );
}
