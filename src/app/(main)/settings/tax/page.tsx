"use client";

import { useState } from "react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { useTaxes, useCreateTax, useUpdateTax, useDeleteTax } from "@/hooks/use-taxes";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Percent, Plus, Search } from "lucide-react";
import { toast } from "sonner";

interface Tax {
  id: string;
  name: string;
  percentage: number;
  isActive: boolean;
  createdAt: string;
}

export default function TaxPage() {
  const { data: taxes = [], isLoading } = useTaxes();
  const createTax = useCreateTax();
  const updateTax = useUpdateTax();
  const deleteTax = useDeleteTax();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Tax | null>(null);
  const [name, setName] = useState("");
  const [rate, setRate] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Tax | null>(null);

  const openCreate = () => {
    setEditItem(null);
    setName("");
    setRate("");
    setIsActive(true);
    setDialogOpen(true);
  };

  const openEdit = (tax: Tax) => {
    setEditItem(tax);
    setName(tax.name);
    setRate(String(tax.percentage));
    setIsActive(tax.isActive);
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const payload = { name, percentage: parseFloat(rate), isActive };
      if (editItem) {
        await updateTax.mutateAsync({ id: editItem.id, ...payload });
        toast.success("Tax updated");
      } else {
        await createTax.mutateAsync(payload);
        toast.success("Tax created");
      }
      setDialogOpen(false);
    } catch {
      toast.error("Failed to save tax");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteTax.mutateAsync(deleteTarget.id);
      toast.success("Tax deleted");
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete tax");
    }
  };

  const columns: ColumnDef<Tax>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Percent className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "percentage",
      header: "Rate (%)",
      cell: ({ row }) => (
        <span className="tabular-nums">{row.original.percentage}%</span>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? "default" : "secondary"}>
          {row.original.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openEdit(row.original)}>Edit</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => { setDeleteTarget(row.original); setDeleteDialogOpen(true); }}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const table = useDataTableInstance({
    data: taxes,
    columns,
    getRowId: (row) => row.id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading taxes...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Taxes</h1>
          <p className="text-muted-foreground">Manage tax rates for invoices</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> Add Tax
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search taxes..."
              value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
              onChange={(e) => table.getColumn("name")?.setFilterValue(e.target.value)}
              className="pl-9 bg-white/50 backdrop-blur-md dark:bg-slate-900/50"
            />
          </div>
        </div>
        <div className="rounded-md border bg-white/40 backdrop-blur-md dark:bg-slate-900/40">
          <DataTable table={table} columns={columns} />
        </div>
        <DataTablePagination table={table} />
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editItem ? "Edit Tax" : "New Tax"}</DialogTitle>
            <DialogDescription>
              {editItem ? "Update tax rate details." : "Create a new tax rate."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="taxName">Name</Label>
              <Input id="taxName" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. PPN 11%" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxRate">Rate (%)</Label>
              <Input id="taxRate" type="number" step="0.01" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="11" />
            </div>
            <div className="flex items-center gap-2">
              <Switch id="taxActive" checked={isActive} onCheckedChange={setIsActive} />
              <Label htmlFor="taxActive">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!name.trim() || !rate || createTax.isPending || updateTax.isPending}>
              {editItem ? "Save Changes" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Tax</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteTax.isPending}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
