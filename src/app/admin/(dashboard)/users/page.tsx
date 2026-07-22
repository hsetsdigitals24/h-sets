import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSection } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/rbac";
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
import { updateUserRole, deleteUser } from "./actions";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const current = await requireSection("users");
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });

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
                  {u.id !== current.id && (
                    <DeleteButton id={u.id} action={deleteUser} confirmText={`Delete ${u.email}?`} />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
