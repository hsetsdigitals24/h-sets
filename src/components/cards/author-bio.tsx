import Image from "next/image";
import Link from "next/link";
import { getTeamMemberByName } from "@/data/company";
import { LinkedInIcon } from "@/components/layout/social-icons";

/**
 * Author bio box, rendered at the foot of every article.
 *
 * A byline on its own is just a string. Connecting it to a team member with a
 * photo, a role, a bio and a LinkedIn link is what makes the author a person a
 * reader — or a Google quality evaluator — can independently verify.
 */
export function AuthorBio({
  name,
  role,
}: {
  name: string;
  /** Role as stored on the article; the team record wins when one matches. */
  role?: string;
}) {
  const member = getTeamMemberByName(name);
  const jobTitle = member?.role ?? role;
  const initials = member
    ? member.initials
    : name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2);

  return (
    <aside className="mt-12 rounded-2xl border border-border bg-secondary/40 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        {member?.photo ? (
          <Image
            src={member.photo}
            alt={`${name}, ${jobTitle ?? "author"} at H-SETS`}
            width={96}
            height={96}
            className="size-16 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="grid size-16 shrink-0 place-items-center rounded-full bg-brand-gradient text-xl font-bold text-white"
          >
            {initials}
          </span>
        )}

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Written by
          </p>
          <p className="mt-1 font-semibold">{name}</p>
          {jobTitle && <p className="text-sm text-primary">{jobTitle}</p>}
          {member?.bio && (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {member.bio}
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
            {member && (
              <Link
                href={`/about#${member.slug}`}
                className="font-medium text-primary hover:underline"
              >
                More about {name.split(" ")[0]}
              </Link>
            )}
            {member?.linkedin && (
              <a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
              >
                <LinkedInIcon className="size-4" />
                <span>
                  LinkedIn<span className="sr-only"> profile for {name}</span>
                </span>
              </a>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
