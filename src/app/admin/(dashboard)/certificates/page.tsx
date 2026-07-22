import { prisma } from "@/lib/prisma";
import { requireSection } from "@/lib/auth";
import { cohortLabel, certificateEligibility } from "@/lib/lms";
import { activeCohortWhere } from "@/lib/cohort-access";
import { PageHeading } from "@/components/admin/page-heading";
import { CohortPicker } from "@/components/lms/cohort-picker";
import { ActionButton } from "@/components/lms/action-button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { issueCertificate, setCertificateRevoked } from "./actions";

export const dynamic = "force-dynamic";

export default async function CertificatesPage({
  searchParams,
}: {
  searchParams: Promise<{ cohort?: string }>;
}) {
  await requireSection("certificates");
  const { cohort: cohortId } = await searchParams;

  const cohorts = await prisma.cohort.findMany({
    where: activeCohortWhere(),
    include: { programme: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  const options = cohorts.map((c) => ({ id: c.id, label: cohortLabel(c) }));

  const enrollments = cohortId
    ? await prisma.enrollment.findMany({
        where: { cohortId, status: { not: "withdrawn" } },
        include: { student: { select: { id: true, name: true, email: true } } },
        orderBy: { enrolledAt: "asc" },
      })
    : [];

  const certs = cohortId
    ? await prisma.certificate.findMany({ where: { cohortId } })
    : [];
  const certByStudent = new Map(certs.map((c) => [c.studentId, c]));

  const rows = await Promise.all(
    enrollments.map(async (e) => ({
      enrollment: e,
      eligibility: await certificateEligibility(e.student.id, cohortId!),
      certificate: certByStudent.get(e.student.id) ?? null,
    }))
  );

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeading
        back={{ href: "/admin", label: "Back to dashboard" }}
        title="Certificates"
        description="Issue and revoke certificates. Eligibility follows attendance ≥70%, all assignments submitted, pass scores, and passing every scheduled exam."
        action={<CohortPicker cohorts={options} selected={cohortId} />}
      />

      {!cohortId ? (
        <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Select a cohort above.
        </p>
      ) : (
        <div className="rounded-2xl border border-border bg-card shadow-soft">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Eligibility</TableHead>
                <TableHead>Certificate</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No students enrolled.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map(({ enrollment: e, eligibility, certificate }) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">
                      {e.student.name}
                      <div className="text-xs text-muted-foreground">{e.student.email}</div>
                    </TableCell>
                    <TableCell>
                      {eligibility.eligible ? (
                        <Badge variant="success">Eligible</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {eligibility.attendanceOk ? "" : "Attendance <70% · "}
                          {eligibility.allSubmitted ? "" : `${eligibility.submittedCount}/${eligibility.totalAssignments} submitted · `}
                          {eligibility.passedAll ? "" : "Failing assignment · "}
                          {eligibility.examsPassed ? "" : `Exams ${eligibility.passedExams}/${eligibility.totalExams} passed`}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {certificate ? (
                        certificate.revoked ? (
                          <Badge variant="muted" className="text-destructive">Revoked · {certificate.certId}</Badge>
                        ) : (
                          <Badge variant="success">{certificate.certId}</Badge>
                        )
                      ) : (
                        <span className="text-xs text-muted-foreground">Not issued</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {!certificate ? (
                        eligibility.eligible ? (
                          <ActionButton
                            action={issueCertificate}
                            fields={{ cohortId: cohortId!, studentId: e.student.id, override: "false" }}
                            variant="gradient"
                            successMessage="Certificate issued"
                          >
                            Issue
                          </ActionButton>
                        ) : (
                          <ActionButton
                            action={issueCertificate}
                            fields={{ cohortId: cohortId!, studentId: e.student.id, override: "true" }}
                            variant="outline"
                            successMessage="Certificate issued"
                            confirm={`Issue a certificate to ${e.student.name} despite unmet requirements?`}
                          >
                            Issue (override)
                          </ActionButton>
                        )
                      ) : certificate.revoked ? (
                        <ActionButton
                          action={setCertificateRevoked}
                          fields={{ id: certificate.id, revoked: "false" }}
                          variant="outline"
                          successMessage="Certificate reinstated"
                        >
                          Reinstate
                        </ActionButton>
                      ) : (
                        <ActionButton
                          action={setCertificateRevoked}
                          fields={{ id: certificate.id, revoked: "true" }}
                          variant="ghost"
                          className="text-destructive"
                          successMessage="Certificate revoked"
                          confirm={`Revoke ${e.student.name}'s certificate?`}
                        >
                          Revoke
                        </ActionButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
