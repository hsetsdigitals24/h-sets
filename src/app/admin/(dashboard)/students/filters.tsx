import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export type StudentFilters = {
  q?: string;
  programme?: string;
  status?: string;
};

/**
 * Plain GET form so the roster stays filterable without client JS — the page
 * re-renders from the resulting search params.
 */
export function StudentsFilters({
  programmes,
  current,
  active,
}: {
  programmes: { id: string; name: string }[];
  current: StudentFilters;
  active: boolean;
}) {
  return (
    <form
      method="get"
      className="mb-8 flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-card p-5 shadow-soft"
    >
      <div className="min-w-[220px] flex-1">
        <label htmlFor="q" className="mb-1.5 block text-xs font-medium text-muted-foreground">
          Search
        </label>
        <Input id="q" name="q" defaultValue={current.q ?? ""} placeholder="Name or email…" />
      </div>

      <div className="min-w-[200px]">
        <label htmlFor="programme" className="mb-1.5 block text-xs font-medium text-muted-foreground">
          Programme
        </label>
        <Select id="programme" name="programme" defaultValue={current.programme ?? ""}>
          <option value="">All programmes</option>
          {programmes.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="min-w-[160px]">
        <label htmlFor="status" className="mb-1.5 block text-xs font-medium text-muted-foreground">
          Status
        </label>
        <Select id="status" name="status" defaultValue={current.status ?? ""}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="withdrawn">Withdrawn</option>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Button type="submit">Filter</Button>
        {active && (
          <Button asChild variant="ghost">
            <Link href="/admin/students">Clear</Link>
          </Button>
        )}
      </div>
    </form>
  );
}
