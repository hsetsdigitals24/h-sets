import Image from "next/image";
import { BadgeCheck } from "lucide-react";
import { LinkedInIcon } from "@/components/layout/social-icons";
import type { TeamMember } from "@/data/company";

/**
 * Team card. Renders a real headshot when `photo` is set and falls back to the
 * initials avatar otherwise, so photos can land one at a time without breaking
 * the grid. The LinkedIn link and credentials list are the verifiable part —
 * they turn a name on a page into a person an evaluator can check.
 */
export function TeamMemberCard({ member }: { member: TeamMember }) {
  return (
    <div
      id={member.slug}
      className="group h-full scroll-mt-28 rounded-2xl border border-border bg-card p-6 text-center shadow-soft transition-all hover:-translate-y-1"
    >
      {member.photo ? (
        <Image
          src={member.photo}
          alt={`${member.name}, ${member.role} at H-SETS`}
          width={96}
          height={96}
          className="mx-auto size-16 rounded-full object-cover"
        />
      ) : (
        <span
          aria-hidden="true"
          className="mx-auto grid size-16 place-items-center rounded-full bg-brand-gradient text-xl font-bold text-white"
        >
          {member.initials}
        </span>
      )}

      <h3 className="mt-4 font-semibold">{member.name}</h3>
      <p className="text-sm text-primary">{member.role}</p>
      <p className="mt-2 text-sm text-muted-foreground">{member.bio}</p>

      {member.credentials && member.credentials.length > 0 && (
        <ul className="mt-3 flex flex-wrap justify-center gap-1.5">
          {member.credentials.map((c) => (
            <li
              key={c}
              className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs text-muted-foreground"
            >
              <BadgeCheck className="size-3 text-primary" />
              {c}
            </li>
          ))}
        </ul>
      )}

      {member.linkedin && (
        <a
          href={member.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          <LinkedInIcon className="size-4" />
          <span>
            LinkedIn<span className="sr-only"> profile for {member.name}</span>
          </span>
        </a>
      )}
    </div>
  );
}
