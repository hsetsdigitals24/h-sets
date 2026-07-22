import { Download, Award } from "lucide-react";
import { BackLink } from "@/components/ui/back-link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyUrl } from "@/lib/certificate";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Certificates" };
export const dynamic = "force-dynamic";

export default async function StudentCertificatesPage() {
  const session = await auth();
  const user = session!.user;

  const certificates = await prisma.certificate.findMany({
    where: { studentId: user.id },
    include: { cohort: { include: { programme: { select: { name: true } } } } },
    orderBy: { issuedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl">
      <BackLink href="/account" label="Back to dashboard" />
      <h1 className="text-2xl font-bold tracking-tight">Certificates</h1>
      <p className="mt-1 text-sm text-muted-foreground">Your earned H-SETS Academy certificates.</p>

      {certificates.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border p-8 text-center">
          <Award className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            You haven&apos;t earned a certificate yet. Complete your cohort to unlock one.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {certificates.map((c) => (
            <div key={c.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div>
                <h2 className="font-semibold">{c.cohort.programme.name}</h2>
                <p className="text-sm text-muted-foreground">
                  Issued {formatDate(c.issuedAt.toISOString())} · ID {c.certId}
                </p>
                <a href={verifyUrl(c.certId)} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                  Verify
                </a>
              </div>
              {c.revoked ? (
                <Badge variant="muted" className="text-destructive">Revoked</Badge>
              ) : (
                <Button asChild variant="gradient" size="sm">
                  <a href={`/api/certificates/${c.certId}`} target="_blank" rel="noopener noreferrer">
                    <Download className="size-4" /> Download PDF
                  </a>
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
