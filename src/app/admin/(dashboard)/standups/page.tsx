import Link from "next/link";
import { Video, Users } from "lucide-react";
import { requireSection } from "@/lib/auth";
import { PageHeading } from "@/components/admin/page-heading";
import { Button } from "@/components/ui/button";
import { listCompanyRooms, companyLivePresence } from "@/lib/livekit";
import { InviteGuestButton } from "@/components/meet/invite-guest-button";
import { CreateRoomForm } from "./create-room-form";
import { DeleteRoomButton } from "./delete-room-button";

export const dynamic = "force-dynamic";

/**
 * Company-wide standup rooms — always-on internal video calls that live outside
 * projects and cohorts. Every staff member can open any room and record it; the
 * live count is read straight from LiveKit so you can see who's already in a
 * call. Rooms are created here on demand (persisted as CompanyRoom records).
 */
export default async function StandupsPage() {
  const user = await requireSection("standups");
  const isSuperAdmin = user.role === "SUPER_ADMIN";

  const base = await listCompanyRooms();
  const rooms = await Promise.all(
    base.map(async (room) => ({
      ...room,
      presence: await companyLivePresence(room.slug),
    }))
  );

  return (
    <div>
      <PageHeading
        back={{ href: "/admin", label: "Back to dashboard" }}
        title="Company Standups"
        description="Internal video rooms for company-wide and team standups. Create rooms and record calls."
      />

      <div className="mb-6">
        <CreateRoomForm />
      </div>

      {rooms.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center text-sm text-muted-foreground">
          No standup rooms yet — create one above to get started.
        </div>
      ) : (
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
                  <div className="flex items-center gap-2">
                    {live && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600">
                        <span className="size-1.5 rounded-full bg-emerald-500" />
                        Live
                      </span>
                    )}
                    {isSuperAdmin && (
                      <DeleteRoomButton id={room.id} name={room.name} />
                    )}
                  </div>
                </div>

                <h2 className="mt-4 text-base font-semibold tracking-tight">
                  {room.name}
                </h2>
                {room.description && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {room.description}
                  </p>
                )}

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
                  <Button asChild variant="outline">
                    <Link href={`/admin/standups/${room.slug}`}>Recordings</Link>
                  </Button>
                  <InviteGuestButton company={room.slug} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
