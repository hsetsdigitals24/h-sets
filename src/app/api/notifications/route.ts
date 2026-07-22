import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUnreadCount, listNotifications } from "@/lib/notifications";

// Poll target for the notification bell. Returns the current user's unread
// count and most recent items. Never errors for signed-out visitors — the bell
// simply renders empty.
export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ unread: 0, items: [] });
  }

  const [unread, items] = await Promise.all([
    getUnreadCount(userId),
    listNotifications(userId, { take: 10 }),
  ]);

  return NextResponse.json({ unread, items });
}
