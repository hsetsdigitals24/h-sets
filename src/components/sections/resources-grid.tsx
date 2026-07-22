"use client";

import * as React from "react";
import { ArrowRight } from "lucide-react";
import type { ResourceView } from "@/data/resources";
import { RevealGroup, RevealItem } from "@/components/common/reveal";
import { Badge } from "@/components/ui/badge";
import { ResourceGateModal } from "@/components/forms/resource-gate-modal";
import { getIcon } from "@/lib/icon-map";
import { cn } from "@/lib/utils";

export function ResourcesGrid({ resources }: { resources: ResourceView[] }) {
  const [active, setActive] = React.useState<ResourceView | null>(null);
  const [open, setOpen] = React.useState(false);

  function openGate(resource: ResourceView) {
    setActive(resource);
    setOpen(true);
  }

  return (
    <>
      <RevealGroup stagger={0.06} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {resources.map((r) => {
          const Icon = getIcon(r.icon);
          return (
            <RevealItem key={r.id} className="h-full">
              <button
                onClick={() => openGate(r)}
                className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-border bg-card text-left shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-primary/40"
              >
                <div className={cn("relative h-28", r.accent)}>
                  <Icon className="absolute bottom-4 left-5 size-9 text-white" />
                  <span className="absolute right-4 top-4">
                    <Badge variant="glass">{r.type}</Badge>
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <span className="text-xs font-medium uppercase tracking-wide text-primary">
                    {r.tag}
                  </span>
                  <h3 className="mt-2 text-lg font-semibold leading-snug transition-colors group-hover:text-primary">
                    {r.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm text-muted-foreground">{r.description}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                    Get free access
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </button>
            </RevealItem>
          );
        })}
      </RevealGroup>

      <ResourceGateModal resource={active} open={open} onOpenChange={setOpen} />
    </>
  );
}
