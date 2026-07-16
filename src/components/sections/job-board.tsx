"use client";

import * as React from "react";
import { MapPin, Briefcase, Clock, ArrowUpRight } from "lucide-react";
import { jobs, type Job } from "@/data/jobs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, cn } from "@/lib/utils";
import { toast } from "sonner";

const types: (Job["type"] | "All")[] = ["All", "Internship", "Graduate", "Full-time"];

export function JobBoard() {
  const [filter, setFilter] = React.useState<(typeof types)[number]>("All");
  const filtered = filter === "All" ? jobs : jobs.filter((j) => j.type === filter);

  return (
    <div>
      {/* Filters */}
      <div className="mb-8 flex flex-wrap gap-2">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition-all",
              filter === t
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card hover:border-primary/50"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Listings */}
      <div className="space-y-4">
        {filtered.map((job) => (
          <div
            key={job.id}
            className="group flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-soft transition-all hover:border-primary/40 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold">{job.title}</h3>
                <Badge variant="muted">{job.type}</Badge>
              </div>
              <p className="mt-1 text-sm font-medium text-primary">{job.company}</p>
              <p className="mt-2 text-sm text-muted-foreground">{job.summary}</p>
              <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3.5" /> {job.location} · {job.mode}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Briefcase className="size-3.5" /> {job.salary}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="size-3.5" /> Apply by {formatDate(job.deadline)}
                </span>
              </div>
            </div>
            <Button
              variant="gradient"
              className="shrink-0"
              onClick={() =>
                toast.info("Sign in to apply", {
                  description: "Applying requires a free student or alumni account.",
                })
              }
            >
              Apply
              <ArrowUpRight className="size-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
