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
import { Label } from "@/components/ui/label";
import { MoreHorizontal, Search, Plus, Building2, MapPin } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import {
  useVendors,
  useCreateVendor,
  useUpdateVendor,
  useDeleteVendor,
  type Vendor,
} from "@/hooks/use-vendors";
import { useCategories } from "@/hooks/use-categories";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

interface VendorTableProps {
  onVendorSelect?: (lat: number, lng: number) => void;
}

export function VendorTable({ onVendorSelect }: VendorTableProps) {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const { data: vendorsRes, isLoading } = useVendors(page, size);
  const vendors = vendorsRes?.data || [];
  const paging = vendorsRes?.paging;
  const { data: categories = [] } = useCategories("EXPENSE");
  const createVendor = useCreateVendor();
  const updateVendor = useUpdateVendor();
  const deleteVendor = useDeleteVendor();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Vendor | null>(null);
  const [form, setForm] = useState({ name: "", location: "", contactPerson: "", phone: "", email: "", categoryId: "", latitude: "", longitude: "" });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Vendor | null>(null);

  const openCreate = () => {
    setEditItem(null);
    setForm({ name: "", location: "", contactPerson: "", phone: "", email: "", categoryId: "", latitude: "", longitude: "" });
    setDialogOpen(true);
  };

  const openEdit = (v: Vendor) => {
    setEditItem(v);
    setForm({
      name: v.name,
      location: v.location || "",
      contactPerson: v.contactPerson || "",
      phone: v.phone || "",
      email: v.email || "",
      categoryId: v.categoryId || "",
      latitude: v.latitude ? String(v.latitude) : "",
      longitude: v.longitude ? String(v.longitude) : "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        name: form.name,
        location: form.location || undefined,
        contactPerson: form.contactPerson || undefined,
        phone: form.phone || undefined,
        email: form.email || undefined,
        categoryId: form.categoryId || undefined,
        latitude: form.latitude ? parseFloat(form.latitude) : undefined,
        longitude: form.longitude ? parseFloat(form.longitude) : undefined,
      };
      if (editItem) {
        await updateVendor.mutateAsync({ id: editItem.id, ...payload });
        toast.success("Vendor updated");
      } else {
        await createVendor.mutateAsync(payload as Omit<Vendor, "id" | "createdAt" | "updatedAt" | "category">);
        toast.success("Vendor created");
      }
      setDialogOpen(false);
    } catch {
      toast.error("Failed to save vendor");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteVendor.mutateAsync(deleteTarget.id);
      toast.success("Vendor deleted");
      setDeleteDialogOpen(false);
    } catch {
      toast.error("Failed to delete vendor");
    }
  };

  const columns: ColumnDef<Vendor>[] = [
    {
      accessorKey: "name",
      header: "Vendor Name",
      cell: ({ row }) => (
        <div
          className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors"
          onClick={() => {
            if (row.original.latitude && row.original.longitude && onVendorSelect) {
              onVendorSelect(row.original.latitude, row.original.longitude);
            }
          }}
        >
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }) =>
        row.original.location ? (
          <div className="flex items-center">
            <MapPin className="mr-2 h-3 w-3 text-muted-foreground" />
            {row.original.location}
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) =>
        row.original.category ? (
          <Badge variant="secondary">{row.original.category.name}</Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      accessorKey: "contactPerson",
      header: "Contact",
      cell: ({ row }) => row.original.contactPerson || "-",
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => row.original.email || "-",
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
            <DropdownMenuItem disabled>
              Detail (Soon)
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => { setDeleteTarget(row.original); setDeleteDialogOpen(true); }}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const table = useDataTableInstance({
    data: vendors,
    columns,
    getRowId: (row) => row.id,
    manualPagination: true,
    pageCount: paging?.total_page ?? 1,
  });

  const tableState = table.getState().pagination;
  React.useEffect(() => {
    setPage(tableState.pageIndex + 1);
    setSize(tableState.pageSize);
  }, [tableState.pageIndex, tableState.pageSize]);

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search vendors..."
              value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
              onChange={(e) => table.getColumn("name")?.setFilterValue(e.target.value)}
              className="pl-9 bg-white/50 backdrop-blur-md dark:bg-slate-900/50"
            />
          </div>
          <Button onClick={openCreate} className="ml-auto">
            <Plus className="mr-2 h-4 w-4" /> Add Vendor
          </Button>
        </div>
        <div className="rounded-md border bg-white/40 backdrop-blur-md dark:bg-slate-900/40">
          <DataTable table={table} columns={columns} />
        </div>
        <DataTablePagination table={table} />
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editItem ? "Edit Vendor" : "New Vendor"}</DialogTitle>
            <DialogDescription>{editItem ? "Update vendor details." : "Add a new vendor."}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Vendor name" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Location</Label>
                <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="City" />
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
            <div className="space-y-2">
              <Label>Contact Person</Label>
              <Input value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} placeholder="Contact name" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+62..." />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="vendor@email.com" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Latitude</Label>
                <Input
                  type="number"
                  step="any"
                  value={form.latitude}
                  onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                  placeholder="-6.2088"
                />
              </div>
              <div className="space-y-2">
                <Label>Longitude</Label>
                <Input
                  type="number"
                  step="any"
                  value={form.longitude}
                  onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                  placeholder="106.8456"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!form.name.trim() || !form.categoryId || createVendor.isPending || updateVendor.isPending}>
              {editItem ? "Save Changes" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Vendor</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteVendor.isPending}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
