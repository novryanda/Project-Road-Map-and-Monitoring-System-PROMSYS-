"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import {
  useInvoices,
  useInvoice,
  useDeleteInvoice,
  useUpdateInvoiceStatus,
} from "@/hooks/use-invoices";
import type { Invoice } from "@/hooks/use-invoices";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Plus, Search, FileText, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { toast } from "sonner";

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
  SENT: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  PAID: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  OVERDUE: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  CANCELLED: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
};

export default function InvoicePage() {
  const router = useRouter();
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const { data: invoices = [], isLoading } = useInvoices({
    type: typeFilter || undefined,
    status: statusFilter || undefined,
  });
  const deleteInvoice = useDeleteInvoice();
  const updateStatus = useUpdateInvoiceStatus();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Invoice | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState("");

  const { data: selectedInvoice } = useInvoice(selectedInvoiceId);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteInvoice.mutateAsync(deleteTarget.id);
      toast.success("Invoice deleted");
      setDeleteDialogOpen(false);
    } catch {
      toast.error("Failed to delete invoice");
    }
  };

  const handleStatusChange = async (id: string, status: Invoice["status"]) => {
    try {
      await updateStatus.mutateAsync({ id, status });
      toast.success("Invoice status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);

  const columns: ColumnDef<Invoice>[] = [
    {
      accessorKey: "invoiceNumber",
      header: "Invoice #",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="font-mono text-sm font-medium">{row.original.invoiceNumber}</span>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant={row.original.type === "INCOME" ? "default" : "secondary"} className="gap-1">
          {row.original.type === "INCOME" ? <ArrowDownLeft className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
          {row.original.type}
        </Badge>
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
      accessorKey: "project",
      header: "Project",
      cell: ({ row }) => row.original.project?.name || "-",
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }) => (
        <span className="tabular-nums font-medium">{formatCurrency(row.original.total)}</span>
      ),
    },
    {
      accessorKey: "dueDate",
      header: "Due Date",
      cell: ({ row }) => {
        const d = new Date(row.original.dueDate);
        const overdue = d < new Date() && !["PAID", "CANCELLED"].includes(row.original.status);
        return (
          <span className={overdue ? "text-destructive font-medium" : ""}>
            {d.toLocaleDateString()}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => { setSelectedInvoiceId(row.original.id); setDetailOpen(true); }}>
              View Details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {row.original.status === "DRAFT" && (
              <DropdownMenuItem onClick={() => handleStatusChange(row.original.id, "SENT")}>Mark as Sent</DropdownMenuItem>
            )}
            {["SENT", "OVERDUE"].includes(row.original.status) && (
              <DropdownMenuItem onClick={() => handleStatusChange(row.original.id, "PAID")}>Mark as Paid</DropdownMenuItem>
            )}
            {row.original.status !== "CANCELLED" && row.original.status !== "PAID" && (
              <DropdownMenuItem onClick={() => handleStatusChange(row.original.id, "CANCELLED")}>Cancel</DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => { setDeleteTarget(row.original); setDeleteDialogOpen(true); }}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const table = useDataTableInstance({ data: invoices, columns, getRowId: (r) => r.id });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><div className="text-muted-foreground">Loading invoices...</div></div>;
  }

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">Manage income and expense invoices</p>
        </div>
        <Button onClick={() => router.push("/dashboard/invoice/create")}>
          <Plus className="mr-2 h-4 w-4" /> New Invoice
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Total Invoices", value: invoices.length },
          { label: "Total Income", value: formatCurrency(invoices.filter((i) => i.type === "INCOME").reduce((s, i) => s + i.total, 0)) },
          { label: "Total Expense", value: formatCurrency(invoices.filter((i) => i.type === "EXPENSE").reduce((s, i) => s + i.total, 0)) },
          { label: "Overdue", value: invoices.filter((i) => i.status === "OVERDUE").length },
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
              placeholder="Search invoices..."
              value={(table.getColumn("invoiceNumber")?.getFilterValue() as string) ?? ""}
              onChange={(e) => table.getColumn("invoiceNumber")?.setFilterValue(e.target.value)}
              className="pl-9 bg-white/50 backdrop-blur-md dark:bg-slate-900/50"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="All Types" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="INCOME">Income</SelectItem>
              <SelectItem value="EXPENSE">Expense</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="All Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="SENT">Sent</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
              <SelectItem value="OVERDUE">Overdue</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="rounded-md border bg-white/40 backdrop-blur-md dark:bg-slate-900/40">
          <DataTable table={table} columns={columns} />
        </div>
        <DataTablePagination table={table} />
      </div>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Invoice</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete invoice {deleteTarget?.invoiceNumber}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteInvoice.isPending}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invoice Detail Sheet */}
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Invoice {selectedInvoice?.invoiceNumber}</SheetTitle>
            <SheetDescription>{selectedInvoice?.project?.name}</SheetDescription>
          </SheetHeader>
          {selectedInvoice && (
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Type</p>
                  <Badge variant={selectedInvoice.type === "INCOME" ? "default" : "secondary"}>{selectedInvoice.type}</Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge className={STATUS_COLORS[selectedInvoice.status] || ""} variant="secondary">{selectedInvoice.status}</Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Due Date</p>
                  <p className="text-sm font-medium">{new Date(selectedInvoice.dueDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Category</p>
                  <p className="text-sm font-medium">{selectedInvoice.category?.name || "-"}</p>
                </div>
              </div>
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="tabular-nums">{formatCurrency(selectedInvoice.subtotal)}</span>
                </div>
                {selectedInvoice.tax && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax ({selectedInvoice.tax.name})</span>
                    <span className="tabular-nums">{formatCurrency(selectedInvoice.taxAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold border-t pt-2">
                  <span>Total</span>
                  <span className="tabular-nums">{formatCurrency(selectedInvoice.total)}</span>
                </div>
              </div>
              {selectedInvoice.vendor && (
                <div>
                  <p className="text-xs text-muted-foreground">Vendor</p>
                  <p className="text-sm font-medium">{selectedInvoice.vendor.name}</p>
                </div>
              )}
              {selectedInvoice.notes && (
                <div>
                  <p className="text-xs text-muted-foreground">Notes</p>
                  <p className="text-sm">{selectedInvoice.notes}</p>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
