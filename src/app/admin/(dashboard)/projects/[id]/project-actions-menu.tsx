"use client";

import { MoreVertical } from "lucide-react";
import type { ProjectStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { DeleteButton } from "@/components/admin/delete-button";
import { EditProjectDialog } from "./edit-project-dialog";

/**
 * "More" menu for the project header — groups the destructive/edit controls
 * (Edit, Delete) behind a single overflow dropdown so they don't crowd the
 * primary Meeting action. Super-admin only (rendered conditionally by the page).
 */
export function ProjectActionsMenu({
  project,
  deleteAction,
}: {
  project: {
    id: string;
    name: string;
    description: string | null;
    status: ProjectStatus;
  };
  deleteAction: (formData: FormData) => Promise<{ error?: string } | void>;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" aria-label="More actions">
          <MoreVertical className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-48">
        <EditProjectDialog
          project={project}
          variant="ghost"
          className="w-full justify-start rounded-lg"
        />
        <DeleteButton
          id={project.id}
          action={deleteAction}
          label="Delete project"
          confirmText="Delete this project and all its tasks? This cannot be undone."
          showLabel
          className="w-full justify-start rounded-lg"
        />
      </PopoverContent>
    </Popover>
  );
}
