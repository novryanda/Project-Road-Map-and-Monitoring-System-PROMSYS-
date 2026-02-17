"use client";

import React, { useState } from "react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import {
  useReimbursements,
  useReimbursement,
  useCreateReimbursement,
  useApproveReimbursement,
  useRejectReimbursement,
  useMarkReimbursementPaid,
} from "@/hooks/use-reimbursements";
import { useProjects } from "@/hooks/use-projects";
import { useCategories } from "@/hooks/use-categories";
import type { Reimbursement } from "@/hooks/use-reimbursements";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Plus, Search, Receipt, CheckCircle, XCircle, Banknote } from "lucide-react";
import { toast } from "sonner";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  APPROVED: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  REJECTED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  PAID: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
};

export default function ReimbursementPage() {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const { data: reimbursementsRes, isLoading } = useReimbursements({ page, size });
  const reimbursements = reimbursementsRes?.data || [];
  const paging = reimbursementsRes?.paging;
  const { data: projectsRes } = useProjects(1, 100);
  const projects = projectsRes?.data || [];
  const { data: categories = [] } = useCategories("EXPENSE");
  const createReimbursement = useCreateReimbursement();
  const approveReimbursement = useApproveReimbursement();
  const rejectReimbursement = useRejectReimbursement();
  const markPaid = useMarkReimbursementPaid();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", amount: "", projectId: "", categoryId: "" });
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<Reimbursement | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedId, setSelectedId] = useState("");

  const { data: selectedReimbursement } = useReimbursement(selectedId);

  const openCreate = () => {
    setForm({ title: "", description: "", amount: "", projectId: "", categoryId: "" });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      await createReimbursement.mutateAsync({
        title: form.title,
        description: form.description || undefined,
        amount: parseFloat(form.amount),
        projectId: form.projectId || undefined,
        categoryId: form.categoryId,
      });
      toast.success("Reimbursement submitted");
      setDialogOpen(false);
    } catch {
      toast.error("Failed to submit reimbursement");
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveReimbursement.mutateAsync(id);
      toast.success("Reimbursement approved");
    } catch {
      toast.error("Failed to approve");
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    try {
      await rejectReimbursement.mutateAsync({ id: rejectTarget.id, reason: rejectReason });
      toast.success("Reimbursement rejected");
      setRejectDialogOpen(false);
      setRejectReason("");
    } catch {
      toast.error("Failed to reject");
    }
  };

  const handleMarkPaid = async (id: string) => {
    try {
      await markPaid.mutateAsync(id);
      toast.success("Marked as paid");
    } catch {
      toast.error("Failed to mark as paid");
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);

  const columns: ColumnDef<Reimbursement>[] = [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Receipt className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.original.title}</span>
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
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <span className="tabular-nums font-medium">{formatCurrency(row.original.amount)}</span>
      ),
    },
    {
      accessorKey: "project",
      header: "Project",
      cell: ({ row }) => row.original.project?.name || "-",
    },
    {
      accessorKey: "submittedBy",
      header: "Submitted By",
      cell: ({ row }) => row.original.submittedBy?.name || "-",
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
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
            <DropdownMenuItem onClick={() => { setSelectedId(row.original.id); setDetailOpen(true); }}>
              View Details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {row.original.status === "PENDING" && (
              <>
                <DropdownMenuItem onClick={() => handleApprove(row.original.id)}>
                  <CheckCircle className="mr-2 h-4 w-4 text-green-600" /> Approve
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setRejectTarget(row.original); setRejectDialogOpen(true); }}>
                  <XCircle className="mr-2 h-4 w-4 text-red-600" /> Reject
                </DropdownMenuItem>
              </>
            )}
            {row.original.status === "APPROVED" && (
              <DropdownMenuItem onClick={() => handleMarkPaid(row.original.id)}>
                <Banknote className="mr-2 h-4 w-4 text-green-600" /> Mark as Paid
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const table = useDataTableInstance({
    data: reimbursements,
    columns,
    getRowId: (r) => r.id,
    manualPagination: true,
    pageCount: paging?.total_page ?? 1,
  });

  const tableState = table.getState().pagination;
  React.useEffect(() => {
    setPage(tableState.pageIndex + 1);
    setSize(tableState.pageSize);
  }, [tableState.pageIndex, tableState.pageSize]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><div className="text-muted-foreground">Loading reimbursements...</div></div>;
  }

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reimbursements</h1>
          <p className="text-muted-foreground">Submit and manage expense reimbursements</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> Submit Reimbursement
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Total", value: reimbursements.length },
          { label: "Pending", value: reimbursements.filter((r) => r.status === "PENDING").length },
          { label: "Approved", value: reimbursements.filter((r) => r.status === "APPROVED").length },
          { label: "Total Amount", value: formatCurrency(reimbursements.reduce((s, r) => s + r.amount, 0)) },
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
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reimbursements..."
            value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
            onChange={(e) => table.getColumn("title")?.setFilterValue(e.target.value)}
            className="pl-9 bg-white/50 backdrop-blur-md dark:bg-slate-900/50"
          />
        </div>
        <div className="rounded-md border bg-white/40 backdrop-blur-md dark:bg-slate-900/40">
          <DataTable table={table} columns={columns} />
        </div>
        <DataTablePagination table={table} />
      </div>

      {/* Submit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Submit Reimbursement</DialogTitle>
            <DialogDescription>Submit an expense for reimbursement.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Expense title" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount (IDR) *</Label>
                <Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label>Project</Label>
                <Select value={form.projectId} onValueChange={(v) => setForm({ ...form, projectId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select (optional)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Project</SelectItem>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!form.title.trim() || !form.amount || !form.categoryId || createReimbursement.isPending}>
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Reimbursement</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting &quot;{rejectTarget?.title}&quot;.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Reason for rejection..." />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={!rejectReason.trim() || rejectReimbursement.isPending}>
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Sheet */}
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{selectedReimbursement?.title}</SheetTitle>
            <SheetDescription>{selectedReimbursement?.project?.name}</SheetDescription>
          </SheetHeader>
          {selectedReimbursement && (
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge className={STATUS_COLORS[selectedReimbursement.status] || ""} variant="secondary">
                    {selectedReimbursement.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Amount</p>
                  <p className="text-lg font-bold tabular-nums">{formatCurrency(selectedReimbursement.amount)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Category</p>
                  <p className="text-sm">{selectedReimbursement.category?.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Submitted By</p>
                  <p className="text-sm">{selectedReimbursement.submittedBy?.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="text-sm">{new Date(selectedReimbursement.createdAt).toLocaleDateString()}</p>
                </div>
                {selectedReimbursement.approvedBy && (
                  <div>
                    <p className="text-xs text-muted-foreground">Approved By</p>
                    <p className="text-sm">{selectedReimbursement.approvedBy.name}</p>
                  </div>
                )}
              </div>
              {selectedReimbursement.description && (
                <div>
                  <p className="text-xs text-muted-foreground">Description</p>
                  <p className="text-sm">{selectedReimbursement.description}</p>
                </div>
              )}
              {selectedReimbursement.rejectionReason && (
                <div className="rounded-md bg-red-50 p-3 dark:bg-red-900/20">
                  <p className="text-xs text-red-600 dark:text-red-400 font-medium">Rejection Reason</p>
                  <p className="text-sm text-red-800 dark:text-red-300">{selectedReimbursement.rejectionReason}</p>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
