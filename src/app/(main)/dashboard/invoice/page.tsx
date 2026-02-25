"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import {
  useFinanceSummary,
  useDeleteInvoice,
  useUpdateInvoiceStatus,
  type FinanceItem,
} from "@/hooks/use-invoices";
import { useMarkReimbursementPaid } from "@/hooks/use-reimbursements";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Plus, Search, FileText, ArrowUpRight, ArrowDownLeft, Receipt } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

const STATUS_COLORS: Record<string, string> = {
  // Invoice statuses
  DRAFT: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
  SENT: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  PAID: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  OVERDUE: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  CANCELLED: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  // Reimbursement statuses
  PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  APPROVED: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  REJECTED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export default function InvoicePage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);

  const { data: financeRes, isLoading } = useFinanceSummary({
    page,
    size,
    search
  });

  const items = financeRes?.data || [];
  const paging = financeRes?.paging;
  const summary = financeRes?.summary;

  const deleteInvoice = useDeleteInvoice();
  const updateInvoiceStatus = useUpdateInvoiceStatus();
  const markReimbursementPaid = useMarkReimbursementPaid();

  const handleInvoiceStatusChange = async (id: string, status: any) => {
    try {
      await updateInvoiceStatus.mutateAsync({ id, status });
      toast.success("Invoice status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return;
    try {
      await deleteInvoice.mutateAsync(id);
      toast.success("Invoice deleted");
    } catch {
      toast.error("Failed to delete invoice");
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);

  const columns: ColumnDef<FinanceItem>[] = [
    {
      accessorKey: "number",
      header: "Number",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.type === "INVOICE" ? (
            <FileText className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Receipt className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="font-mono text-xs font-medium">{row.original.number}</span>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant="outline" className="gap-1 text-xs">
          {row.original.type === "INVOICE" ? (
            row.original.title.includes("Vendor") ? "Expense" : "Invoice" // Simplistic check
          ) : "Reimburse"}
        </Badge>
      ),
    },
    {
      accessorKey: "title",
      header: "Name / Title",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium text-sm truncate max-w-[200px]">{row.original.title}</span>
          {row.original.type === "REIMBURSEMENT" && row.original.submitter && (
            <span className="text-xs text-muted-foreground">by {row.original.submitter.name}</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge className={STATUS_COLORS[row.original.status] || ""} variant="secondary">
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{new Date(row.original.date).toLocaleDateString()}</span>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <span className="tabular-nums font-medium">{formatCurrency(row.original.amount)}</span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/dashboard/invoice/${item.id}?type=${item.type}`)}>
                View / Process
              </DropdownMenuItem>
              <DropdownMenuSeparator />

              {item.type === "INVOICE" && (
                <>
                  {item.status === "DRAFT" && (
                    <DropdownMenuItem onClick={() => handleInvoiceStatusChange(item.id, "SENT")}>Mark as Sent</DropdownMenuItem>
                  )}
                  {["SENT", "OVERDUE"].includes(item.status) && (
                    <DropdownMenuItem onClick={() => handleInvoiceStatusChange(item.id, "PAID")}>Mark as Paid</DropdownMenuItem>
                  )}
                  {item.status !== "CANCELLED" && item.status !== "PAID" && (
                    <DropdownMenuItem onClick={() => handleInvoiceStatusChange(item.id, "CANCELLED")}>Cancel</DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteInvoice(item.id)}>
                    Delete
                  </DropdownMenuItem>
                </>
              )}

              {item.type === "REIMBURSEMENT" && item.status === "APPROVED" && (
                <DropdownMenuItem onClick={() => router.push(`/dashboard/invoice/${item.id}?type=REIMBURSEMENT`)}>
                  Process Payment
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useDataTableInstance({
    data: items,
    columns,
    getRowId: (r) => r.id,
    manualPagination: true,
    pageCount: paging?.total_page ?? 1,
  });

  // Sync table pagination state with our React Query state
  const tableState = table.getState().pagination;
  React.useEffect(() => {
    setPage(tableState.pageIndex + 1);
    setSize(tableState.pageSize);
  }, [tableState.pageIndex, tableState.pageSize]);

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Finance Management</h1>
          <p className="text-muted-foreground">Manage invoices and reimbursements</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/reimbursement/create">
            <Button variant="outline">
              <Receipt className="mr-2 h-4 w-4" /> Request Reimbursement
            </Button>
          </Link>
          <Link href="/dashboard/invoice/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> New Invoice
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Total Transactions", value: summary?.totalInvoices + summary?.totalReimbursements || 0 },
          { label: "Total Invoices", value: summary?.totalInvoices || 0 },
          { label: "Total Reimbursements", value: summary?.totalReimbursements || 0 },
        ].map((stat, i) => (
          <Card key={i} className="border-none bg-white/50 backdrop-blur-md dark:bg-slate-900/50">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white/50 backdrop-blur-md dark:bg-slate-900/50"
            />
          </div>
        </div>
        <div className="rounded-md border bg-white/40 backdrop-blur-md dark:bg-slate-900/40">
          <DataTable table={table} columns={columns} />
        </div>
        <DataTablePagination table={table} />
      </div>
    </div>
  );
}
