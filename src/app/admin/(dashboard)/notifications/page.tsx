import { requireSection } from "@/lib/auth";
import { canBroadcast } from "@/lib/rbac";
import { listNotifications } from "@/lib/notifications";
import { PageHeading } from "@/components/admin/page-heading";
import { NotificationList } from "@/components/notifications/notification-list";
import type { NotificationItem } from "@/components/notifications/types";
import { BroadcastForm } from "./broadcast-form";

export const dynamic = "force-dynamic";

export default async function AdminNotificationsPage() {
  const user = await requireSection("notifications");
  const rows = await listNotifications(user.id, { take: 50 });
  const items: NotificationItem[] = rows.map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    body: n.body,
    link: n.link,
    read: n.read,
    createdAt: n.createdAt.toISOString(),
  }));

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeading
        back={{ href: "/admin", label: "Back to dashboard" }}
        title="Notifications"
        description="Your notifications and platform announcements."
      />

      {canBroadcast(user.role) && (
        <div className="mb-8 rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h2 className="mb-4 text-sm font-semibold">Broadcast an announcement</h2>
          <BroadcastForm />
        </div>
      )}

      <NotificationList initial={items} />
    </div>
  );
}
