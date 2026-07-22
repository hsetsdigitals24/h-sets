import { BackLink } from "@/components/ui/back-link";
import { requireUser } from "@/lib/auth";
import { listNotifications } from "@/lib/notifications";
import { NotificationList } from "@/components/notifications/notification-list";
import type { NotificationItem } from "@/components/notifications/types";

export const metadata = { title: "Notifications" };
export const dynamic = "force-dynamic";

export default async function StudentNotificationsPage() {
  const user = await requireUser();
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
    <div className="mx-auto max-w-3xl">
      <BackLink href="/account" label="Back to dashboard" />
      <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">
        Updates about your applications, grades, certificates, and announcements.
      </p>
      <NotificationList initial={items} />
    </div>
  );
}
