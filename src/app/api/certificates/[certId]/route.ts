import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { renderCertificatePdf } from "@/lib/certificate";

/**
 * Generates and streams the certificate PDF on demand. Accessible to the
 * certificate holder and to staff. Revoked certificates are not downloadable.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ certId: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { certId } = await params;

  const cert = await prisma.certificate.findUnique({
    where: { certId },
    include: {
      student: { select: { id: true, name: true } },
      cohort: { include: { programme: { select: { name: true } } } },
    },
  });
  if (!cert) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (cert.revoked) return NextResponse.json({ error: "Certificate revoked" }, { status: 410 });

  const isStaff = session.user.role !== "STUDENT";
  if (!isStaff && cert.studentId !== session.user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const pdf = await renderCertificatePdf({
    certId: cert.certId,
    studentName: cert.student.name,
    programmeName: cert.cohort.programme.name,
    cohortDates: `${cert.cohort.startDate} – ${cert.cohort.endDate}`,
    issuedAt: cert.issuedAt,
  });

  return new NextResponse(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="H-SETS-Certificate-${cert.certId}.pdf"`,
    },
  });
}
