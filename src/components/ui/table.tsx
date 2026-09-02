import * as React from "react";
import { cn } from "@/lib/utils";

// Extract the plain-text content of an arbitrary React node so column headers
// can be reused as per-cell labels in the mobile card layout.
function getNodeText(node: React.ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(getNodeText).join("");
  if (React.isValidElement(node)) {
    return getNodeText((node.props as { children?: React.ReactNode }).children);
  }
  return "";
}

// Pull the column labels from the <TableHeader> so each body cell can announce
// which column it belongs to once the table collapses into stacked cards.
function extractLabels(children: React.ReactNode): string[] {
  let labels: string[] = [];
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child) || child.type !== TableHeader) return;
    React.Children.forEach(
      (child.props as { children?: React.ReactNode }).children,
      (row) => {
        if (!React.isValidElement(row)) return;
        labels = React.Children.toArray(
          (row.props as { children?: React.ReactNode }).children
        )
          .filter(React.isValidElement)
          .map((head) =>
            getNodeText(
              (head.props as { children?: React.ReactNode }).children
            ).trim()
          );
      }
    );
  });
  return labels;
}

function Table({ className, children, ...props }: React.HTMLAttributes<HTMLTableElement>) {
  const labels = extractLabels(children);
  // Thread the derived labels down to <TableBody> so its rows can tag each cell.
  const enhanced = React.Children.map(children, (child) =>
    React.isValidElement(child) && child.type === TableBody
      ? React.cloneElement(child as React.ReactElement<TableBodyProps>, { _labels: labels })
      : child
  );
  return (
    <div className="relative w-full overflow-x-auto max-md:overflow-visible">
      <table
        className={cn("w-full caption-bottom text-sm max-md:block", className)}
        {...props}
      >
        {enhanced}
      </table>
    </div>
  );
}

function TableHeader({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  // Column headers are redundant in the mobile card layout — hide them there.
  return <thead className={cn("max-md:hidden [&_tr]:border-b", className)} {...props} />;
}

type TableBodyProps = React.HTMLAttributes<HTMLTableSectionElement> & {
  _labels?: string[];
};

function TableBody({ className, children, _labels, ...props }: TableBodyProps) {
  const rows = _labels
    ? React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<TableRowProps>, { _labels })
          : child
      )
    : children;
  return (
    <tbody
      className={cn(
        "[&_tr:last-child]:border-0 max-md:block max-md:space-y-3",
        className
      )}
      {...props}
    >
      {rows}
    </tbody>
  );
}

type TableRowProps = React.HTMLAttributes<HTMLTableRowElement> & {
  _labels?: string[];
};

function TableRow({ className, children, _labels, ...props }: TableRowProps) {
  // Inject the column label onto each cell (unless one was set explicitly) so
  // the mobile pseudo-element label knows what to display.
  const cells = _labels
    ? React.Children.map(children, (child, i) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<{ "data-label"?: string }>, {
              "data-label":
                (child.props as { "data-label"?: string })["data-label"] ??
                _labels[i] ??
                "",
            })
          : child
      )
    : children;
  return (
    <tr
      className={cn(
        "border-b border-border transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
        "max-md:block max-md:rounded-xl max-md:border max-md:border-border max-md:bg-card max-md:p-4 max-md:shadow-soft",
        className
      )}
      {...props}
    >
      {cells}
    </tr>
  );
}

function TableHead({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "h-11 px-4 text-left align-middle text-xs font-semibold uppercase tracking-wide text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  // Cells that span the whole row (e.g. empty-state messages) stay as a single
  // block on mobile rather than becoming a label/value pair.
  const isSpanning = props.colSpan != null && props.colSpan > 1;
  return (
    <td
      className={cn(
        "px-4 py-3 align-middle",
        isSpanning
          ? "max-md:block max-md:px-0"
          : cn(
              // Mobile card layout: each cell becomes a label/value row.
              "max-md:flex max-md:items-center max-md:justify-between max-md:gap-4 max-md:px-0 max-md:py-1.5 max-md:text-right",
              "max-md:before:content-[attr(data-label)] max-md:before:shrink-0 max-md:before:text-left max-md:before:text-[0.68rem] max-md:before:font-semibold max-md:before:uppercase max-md:before:tracking-wide max-md:before:text-muted-foreground max-md:before:empty:hidden",
              "max-md:[&:not(:last-child)]:mb-1 max-md:[&:not(:last-child)]:border-b max-md:[&:not(:last-child)]:border-border/60 max-md:[&:not(:last-child)]:pb-2.5"
            ),
        className
      )}
      {...props}
    />
  );
}

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
