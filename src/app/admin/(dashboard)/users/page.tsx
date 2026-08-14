import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSection } from "@/lib/auth";
import { ROLE_LABELS, effectiveSections, type AdminSection } from "@/lib/rbac";
import { PageHeading } from "@/components/admin/page-heading";
import { DeleteButton } from "@/components/admin/delete-button";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { UserCreateForm } from "./user-create-form";
import { PermissionsEditor } from "./permissions-editor";
import { updateUserRole, deleteUser } from "./actions";

export const dynamic = "force-dynamic";

// Roles whose page access can be tuned per member. Super admins already see
// everything; students are academy users with no admin sections.
const MANAGEABLE = (r: Role) => r !== Role.SUPER_ADMIN && r !== Role.STUDENT;

export default async function UsersPage() {
  const current = await requireSection("users");
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });

  // Batch-load per-user overrides so each row can prefill the access editor with
  // the member's current effective sections (role defaults when no overrides).
  const permRows = await prisma.userSectionPermission.findMany({
    where: { userId: { in: users.map((u) => u.id) } },
    select: { userId: true, section: true },
  });
  const overridesByUser = new Map<string, AdminSection[]>();
  for (const row of permRows) {
    const list = overridesByUser.get(row.userId) ?? [];
    list.push(row.section as AdminSection);
    overridesByUser.set(row.userId, list);
  }
  const canManage = current.role === Role.SUPER_ADMIN;

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeading
        back={{ href: "/admin", label: "Back to dashboard" }} title="Team & Roles" description="Manage admin accounts and their access." />

      <div className="mb-8 rounded-2xl border border-border bg-card p-5 shadow-soft">
        <h2 className="mb-4 text-sm font-semibold">Add a team member</h2>
        <UserCreateForm />
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-soft">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">
                  {u.name}
                  {u.id === current.id && (
                    <span className="ml-2 text-xs text-muted-foreground">(you)</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">{u.email}</TableCell>
                <TableCell>
                  <form action={updateUserRole} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={u.id} />
                    <Select name="role" defaultValue={u.role} className="min-w-[170px]">
                      {Object.values(Role).map((r) => (
                        <option key={r} value={r}>
                          {ROLE_LABELS[r]}
                        </option>
                      ))}
                    </Select>
                    <Button type="submit" variant="outline" size="sm">
                      Update
                    </Button>
                  </form>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {canManage && MANAGEABLE(u.role) && (
                      <PermissionsEditor
                        userId={u.id}
                        userName={u.name}
                        current={effectiveSections(
                          u.role,
                          overridesByUser.get(u.id) ?? null
                        )}
                      />
                    )}
                    {u.id !== current.id && (
                      <DeleteButton id={u.id} action={deleteUser} confirmText={`Delete ${u.email}?`} />
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
