import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Verify Certificate · H-SETS Academy",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ certId: string }>;
}) {
  const { certId } = await params;

  const cert = await prisma.certificate.findUnique({
    where: { certId },
    include: {
      student: { select: { name: true } },
      cohort: { include: { programme: { select: { name: true } } } },
    },
  });

  const valid = cert && !cert.revoked;

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-5 py-16">
      <Link href="/" className="mb-8 text-lg font-bold tracking-tight">
        H-SETS <span className="text-primary">Academy</span>
      </Link>

      <div className="w-full rounded-2xl border border-border bg-card p-8 text-center shadow-soft">
        {valid ? (
          <>
            <CheckCircle2 className="mx-auto size-12 text-emerald-600" />
            <h1 className="mt-4 text-xl font-bold">Valid certificate</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              This certificate was issued by H-SETS Academy.
            </p>
            <dl className="mt-6 divide-y divide-border rounded-xl border border-border text-left">
              <Row label="Holder" value={cert!.student.name} />
              <Row label="Programme" value={cert!.cohort.programme.name} />
              <Row label="Cohort" value={`${cert!.cohort.startDate} – ${cert!.cohort.endDate}`} />
              <Row label="Issued" value={formatDate(cert!.issuedAt.toISOString())} />
              <Row label="Certificate ID" value={cert!.certId} />
            </dl>
          </>
        ) : (
          <>
            <XCircle className="mx-auto size-12 text-destructive" />
            <h1 className="mt-4 text-xl font-bold">Not valid</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              This certificate ID is not valid or has been revoked. Contact H-SETS for queries.
            </p>
          </>
        )}
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  );
}
