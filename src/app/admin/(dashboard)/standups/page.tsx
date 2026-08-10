import Link from "next/link";
import { Video, Users } from "lucide-react";
import { requireSection } from "@/lib/auth";
import { PageHeading } from "@/components/admin/page-heading";
import { Button } from "@/components/ui/button";
import { COMPANY_ROOMS, companyLivePresence } from "@/lib/livekit";
import { InviteGuestButton } from "@/components/meet/invite-guest-button";

export const dynamic = "force-dynamic";

/**
 * Company-wide standup rooms — always-on internal video calls that live outside
 * projects and cohorts. Every staff member can open any room; the live count is
 * read straight from LiveKit so you can see who's already in a call.
 */
export default async function StandupsPage() {
  await requireSection("standups");

  const rooms = await Promise.all(
    COMPANY_ROOMS.map(async (room) => ({
      ...room,
      presence: await companyLivePresence(room.slug),
    }))
  );

  return (
    <div>
      <PageHeading
        back={{ href: "/admin", label: "Back to dashboard" }}
        title="Company Standups"
        description="Internal video rooms for company-wide and team standups."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => {
          const live = room.presence.count > 0;
          return (
            <div
              key={room.slug}
              className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-soft"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
                  <Video className="size-5 text-muted-foreground" />
                </div>
                {live && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    Live
                  </span>
                )}
              </div>

              <h2 className="mt-4 text-base font-semibold tracking-tight">
                {room.name}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {room.description}
              </p>

              <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="size-3.5" />
                {room.presence.count === 0
                  ? "No one in the call"
                  : `${room.presence.count} in the call${
                      room.presence.names.length
                        ? ` — ${room.presence.names.slice(0, 3).join(", ")}${
                            room.presence.count > 3 ? "…" : ""
                          }`
                        : ""
                    }`}
              </div>

              <div className="mt-4 flex items-center gap-2">
                <Button asChild className="flex-1">
                  <Link href={`/meet/company/${room.slug}`}>
                    {live ? "Join call" : "Start call"}
                  </Link>
                </Button>
                <InviteGuestButton company={room.slug} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
