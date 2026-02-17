"use client";

import React, { useState } from "react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import {
  useProjects,
  useProject,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
  useAddProjectMember,
  useRemoveProjectMember,
} from "@/hooks/use-projects";
import type { Project } from "@/hooks/use-projects";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Plus, Search, FolderOpen, UserPlus, X, Calendar, Eye } from "lucide-react";
import { toast } from "sonner";

const STATUS_COLORS: Record<string, string> = {
  PLANNING: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  ACTIVE: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  ON_HOLD: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const defaultForm = {
  name: "",
  clientName: "",
  ptName: "",
  description: "",
  startDate: "",
  endDate: "",
  contractValue: "",
  status: "PLANNING" as Project["status"],
};

export default function ProjectPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const { data: projectsRes, isLoading } = useProjects(page, size);
  const projects = projectsRes?.data || [];
  const paging = projectsRes?.paging;
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const addMember = useAddProjectMember();
  const removeMember = useRemoveProjectMember();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Project | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [memberSheetOpen, setMemberSheetOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [memberId, setMemberId] = useState("");
  const [memberRole, setMemberRole] = useState("MEMBER");

  const { data: selectedProject } = useProject(selectedProjectId);

  const openCreate = () => {
    setEditItem(null);
    setForm(defaultForm);
    setDialogOpen(true);
  };

  const openEdit = (p: Project) => {
    setEditItem(p);
    setForm({
      name: p.name,
      clientName: p.clientName || "",
      ptName: p.ptName || "",
      description: p.description || "",
      startDate: p.startDate ? p.startDate.split("T")[0] : "",
      endDate: p.endDate ? p.endDate.split("T")[0] : "",
      contractValue: p.contractValue ? String(p.contractValue) : "",
      status: p.status,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        name: form.name,
        clientName: form.clientName || undefined,
        ptName: form.ptName || undefined,
        description: form.description || undefined,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        contractValue: form.contractValue ? parseFloat(form.contractValue) : undefined,
        status: form.status,
      };
      if (editItem) {
        await updateProject.mutateAsync({ id: editItem.id, ...payload });
        toast.success("Project updated");
      } else {
        await createProject.mutateAsync(payload as Parameters<typeof createProject.mutateAsync>[0]);
        toast.success("Project created");
      }
      setDialogOpen(false);
    } catch (err: any) {
      console.error("Project save error:", err?.response?.data || err);
      const data = err?.response?.data;
      if (data?.errors?.length) {
        const details = data.errors.map((e: { field: string; message: string }) => `${e.field}: ${e.message}`).join(", ");
        toast.error(`Validation failed: ${details}`);
      } else {
        const msg = data?.message || err?.message || "Failed to save project";
        toast.error(Array.isArray(msg) ? msg[0] : msg);
      }
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProject.mutateAsync(deleteTarget.id);
      toast.success("Project deleted");
      setDeleteDialogOpen(false);
    } catch {
      toast.error("Failed to delete project");
    }
  };

  const handleAddMember = async () => {
    if (!selectedProjectId || !memberId.trim()) return;
    try {
      await addMember.mutateAsync({ projectId: selectedProjectId, userId: memberId, role: memberRole });
      toast.success("Member added");
      setMemberId("");
    } catch {
      toast.error("Failed to add member");
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await removeMember.mutateAsync({ projectId: selectedProjectId, userId });
      toast.success("Member removed");
    } catch {
      toast.error("Failed to remove member");
    }
  };

  const formatCurrency = (val: number | null) => {
    if (!val) return "-";
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);
  };

  const columns: ColumnDef<Project>[] = [
    {
      accessorKey: "name",
      header: "Project",
      cell: ({ row }) => (
        <div className="cursor-pointer" onClick={() => router.push(`/dashboard/project-management/project/${row.original.id}`)}>
          <div className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium hover:underline">{row.original.name}</span>
          </div>
          {row.original.clientName && (
            <p className="text-xs text-muted-foreground ml-6">{row.original.clientName}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge className={STATUS_COLORS[row.original.status] || ""} variant="secondary">
          {row.original.status.replace("_", " ")}
        </Badge>
      ),
    },
    {
      accessorKey: "contractValue",
      header: "Contract Value",
      cell: ({ row }) => (
        <span className="tabular-nums">{formatCurrency(row.original.contractValue)}</span>
      ),
    },
    {
      accessorKey: "startDate",
      header: "Timeline",
      cell: ({ row }) => {
        const s = row.original.startDate ? new Date(row.original.startDate).toLocaleDateString() : "-";
        const e = row.original.endDate ? new Date(row.original.endDate).toLocaleDateString() : "-";
        return <span className="text-sm">{s} — {e}</span>;
      },
    },
    {
      accessorKey: "members",
      header: "Members",
      cell: ({ row }) => (
        <Badge variant="secondary">{row.original.members?.length || 0}</Badge>
      ),
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
            <DropdownMenuItem onClick={() => router.push(`/dashboard/project-management/project/${row.original.id}`)}>
              <Eye className="mr-2 h-4 w-4" /> View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setSelectedProjectId(row.original.id); setMemberSheetOpen(true); }}>
              Members
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openEdit(row.original)}>Edit</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => { setDeleteTarget(row.original); setDeleteDialogOpen(true); }}>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const table = useDataTableInstance({
    data: projects,
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
    return <div className="flex items-center justify-center h-64"><div className="text-muted-foreground">Loading projects...</div></div>;
  }

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">Manage and track your projects</p>
        </div>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> New Project</Button>
      </div>

      <div className="space-y-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(e) => table.getColumn("name")?.setFilterValue(e.target.value)}
            className="pl-9 bg-white/50 backdrop-blur-md dark:bg-slate-900/50"
          />
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
            <DialogTitle>{editItem ? "Edit Project" : "New Project"}</DialogTitle>
            <DialogDescription>{editItem ? "Update project details." : "Create a new project."}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label>Project Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Project name" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Client Name</Label>
                <Input value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>PT Name</Label>
                <Input value={form.ptName} onChange={(e) => setForm({ ...form, ptName: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Contract Value</Label>
                <Input type="number" value={form.contractValue} onChange={(e) => setForm({ ...form, contractValue: e.target.value })} placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Project["status"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PLANNING">Planning</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="ON_HOLD">On Hold</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!form.name.trim() || createProject.isPending || updateProject.isPending}>
              {editItem ? "Save Changes" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.name}&quot;? This will remove all associated tasks and data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteProject.isPending}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Members Sheet */}
      <Sheet open={memberSheetOpen} onOpenChange={setMemberSheetOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Project Members</SheetTitle>
            <SheetDescription>{selectedProject?.name}</SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div className="flex gap-2">
              <Input value={memberId} onChange={(e) => setMemberId(e.target.value)} placeholder="User ID" className="flex-1" />
              <Button size="sm" onClick={handleAddMember} disabled={addMember.isPending}>
                <UserPlus className="mr-2 h-4 w-4" /> Add
              </Button>
            </div>
            <div className="space-y-2">
              {selectedProject?.members?.map((m: { id: string; userId: string; role: string; user: { id: string; name: string; email: string } }) => (
                <Card key={m.id} className="border-none bg-white/50 backdrop-blur-md dark:bg-slate-900/50">
                  <CardContent className="flex items-center justify-between p-3">
                    <div>
                      <p className="text-sm font-medium">{m.user.name}</p>
                      <p className="text-xs text-muted-foreground">{m.user.email} · {m.role}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleRemoveMember(m.userId)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
              {(!selectedProject?.members || selectedProject.members.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">No members assigned</p>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
