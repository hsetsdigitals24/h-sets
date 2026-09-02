"use client";

import Link from "next/link";
import { Video, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { InviteGuestButton } from "@/components/meet/invite-guest-button";
import { CopyMeetingLinkButton } from "@/components/meet/copy-meeting-link-button";

/**
 * Meeting menu for a project. Groups the three call actions — open the room,
 * copy the shareable link, and invite a guest — behind a single dropdown so the
 * page header stays uncluttered. Live presence ("who's in the call") lives with
 * the members list on the board instead, keeping people-info in one place.
 */
export function MeetingButton({ projectId }: { projectId: string }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="gradient" size="sm">
          <Video className="size-4" /> Meeting
          <ChevronDown className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56">
        <Button asChild variant="ghost" size="sm" className="w-full justify-start rounded-lg">
          <Link href={`/meet/project/${projectId}`}>
            <Video className="size-4" /> Join meeting
          </Link>
        </Button>
        <CopyMeetingLinkButton
          projectId={projectId}
          variant="ghost"
          className="w-full justify-start rounded-lg"
        />
        <InviteGuestButton
          projectId={projectId}
          variant="ghost"
          className="w-full justify-start rounded-lg"
        />
      </PopoverContent>
    </Popover>
  );
}
