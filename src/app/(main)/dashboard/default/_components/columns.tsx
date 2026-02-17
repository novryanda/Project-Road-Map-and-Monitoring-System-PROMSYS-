import type { ColumnDef } from "@tanstack/react-table";
import { CircleCheck, EllipsisVertical, Loader, Users, ListTodo } from "lucide-react";
import type { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { DataTableColumnHeader } from "../../../../../components/data-table/data-table-column-header";
import type { recentProjectSchema } from "./schema";
import { TableCellViewer } from "./table-cell-viewer";

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  PLANNING: { label: "Planning", variant: "outline" },
  ACTIVE: { label: "Active", variant: "default" },
  ON_HOLD: { label: "On Hold", variant: "secondary" },
  COMPLETED: { label: "Completed", variant: "default" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
};

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);

export const dashboardColumns: ColumnDef<z.infer<typeof recentProjectSchema>>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Project Name" />,
    cell: ({ row }) => {
      return <TableCellViewer item={row.original} />;
    },
    enableSorting: false,
  },
  {
    accessorKey: "clientName",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Client" />,
    cell: ({ row }) => (
      <div className="max-w-[150px] truncate text-muted-foreground">
        {row.original.clientName || "-"}
      </div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const cfg = statusMap[row.original.status] ?? { label: row.original.status, variant: "outline" as const };
      return (
        <Badge variant={cfg.variant} className="px-1.5">
          {row.original.status === "COMPLETED" ? (
            <CircleCheck className="fill-green-500 stroke-border dark:fill-green-400" />
          ) : (
            <Loader />
          )}
          {cfg.label}
        </Badge>
      );
    },
    enableSorting: false,
  },
  {
    id: "tasks",
    header: ({ column }) => <DataTableColumnHeader className="w-full text-center" column={column} title="Tasks" />,
    cell: ({ row }) => (
      <div className="flex items-center justify-center gap-1 text-muted-foreground">
        <ListTodo className="size-4" />
        <span className="tabular-nums">{row.original._count.tasks}</span>
      </div>
    ),
    enableSorting: false,
  },
  {
    id: "members",
    header: ({ column }) => <DataTableColumnHeader className="w-full text-center" column={column} title="Members" />,
    cell: ({ row }) => (
      <div className="flex items-center justify-center gap-1 text-muted-foreground">
        <Users className="size-4" />
        <span className="tabular-nums">{row.original._count.members}</span>
      </div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "contractValue",
    header: ({ column }) => <DataTableColumnHeader className="w-full text-right" column={column} title="Contract Value" />,
    cell: ({ row }) => (
      <div className="text-right tabular-nums font-medium">
        {row.original.contractValue != null ? formatCurrency(row.original.contractValue) : "-"}
      </div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "createdBy",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created By" />,
    cell: ({ row }) => (
      <div className="max-w-[120px] truncate text-muted-foreground">
        {row.original.createdBy.name}
      </div>
    ),
    enableSorting: false,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex size-8 text-muted-foreground data-[state=open]:bg-muted" size="icon">
            <EllipsisVertical />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem
            onClick={() => {
              window.location.href = `/dashboard/project-management/project/${row.original.id}`;
            }}
          >
            View Details
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    enableSorting: false,
  },
];
