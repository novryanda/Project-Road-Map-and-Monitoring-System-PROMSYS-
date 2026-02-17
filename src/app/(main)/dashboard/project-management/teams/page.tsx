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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import {
  useTeams,
  useTeam,
  useCreateTeam,
  useUpdateTeam,
  useDeleteTeam,
  useAddTeamMember,
  useRemoveTeamMember,
} from "@/hooks/use-teams";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Plus, Search, Users, UserPlus, X } from "lucide-react";
import { toast } from "sonner";

interface Team {
  id: string;
  name: string;
  description: string | null;
  members: { id: string; userId: string; user: { id: string; name: string; email: string } }[];
  createdAt: string;
}

export default function TeamsPage() {
  const { data: teams = [], isLoading } = useTeams();
  const createTeam = useCreateTeam();
  const updateTeam = useUpdateTeam();
  const deleteTeam = useDeleteTeam();
  const addMember = useAddTeamMember();
  const removeMember = useRemoveTeamMember();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Team | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Team | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [memberEmail, setMemberEmail] = useState("");

  const { data: selectedTeam } = useTeam(selectedTeamId);

  const openCreate = () => {
    setEditItem(null);
    setName("");
    setDescription("");
    setDialogOpen(true);
  };

  const openEdit = (team: Team) => {
    setEditItem(team);
    setName(team.name);
    setDescription(team.description || "");
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editItem) {
        await updateTeam.mutateAsync({ id: editItem.id, name, description: description || undefined });
        toast.success("Team updated");
      } else {
        await createTeam.mutateAsync({ name, description: description || undefined });
        toast.success("Team created");
      }
      setDialogOpen(false);
    } catch {
      toast.error("Failed to save team");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteTeam.mutateAsync(deleteTarget.id);
      toast.success("Team deleted");
      setDeleteDialogOpen(false);
    } catch {
      toast.error("Failed to delete team");
    }
  };

  const handleAddMember = async () => {
    if (!selectedTeamId || !memberEmail.trim()) return;
    try {
      await addMember.mutateAsync({ teamId: selectedTeamId, userId: memberEmail });
      toast.success("Member added");
      setMemberEmail("");
    } catch {
      toast.error("Failed to add member");
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!selectedTeamId) return;
    try {
      await removeMember.mutateAsync({ teamId: selectedTeamId, userId });
      toast.success("Member removed");
    } catch {
      toast.error("Failed to remove member");
    }
  };

  const columns: ColumnDef<Team>[] = [
    {
      accessorKey: "name",
      header: "Team Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <span className="text-muted-foreground line-clamp-1">
          {row.original.description || "-"}
        </span>
      ),
    },
    {
      accessorKey: "members",
      header: "Members",
      cell: ({ row }) => (
        <Badge variant="secondary">{row.original.members?.length || 0} members</Badge>
      ),
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
            <DropdownMenuItem onClick={() => { setSelectedTeamId(row.original.id); setDetailOpen(true); }}>
              View Members
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openEdit(row.original)}>Edit</DropdownMenuItem>
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
    data: teams,
    columns,
    getRowId: (row) => row.id,
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><div className="text-muted-foreground">Loading teams...</div></div>;
  }

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Teams</h1>
          <p className="text-muted-foreground">Manage your project teams and members</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> Create Team
        </Button>
      </div>

      <div className="space-y-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search teams..."
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editItem ? "Edit Team" : "New Team"}</DialogTitle>
            <DialogDescription>{editItem ? "Update team details." : "Create a new team."}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Team name" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!name.trim() || createTeam.isPending || updateTeam.isPending}>
              {editItem ? "Save Changes" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Team</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteTeam.isPending}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Team Members Sheet */}
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{selectedTeam?.name || "Team"} Members</SheetTitle>
            <SheetDescription>Manage team membership</SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div className="flex gap-2">
              <Input
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                placeholder="User ID"
                className="flex-1"
              />
              <Button size="sm" onClick={handleAddMember} disabled={addMember.isPending}>
                <UserPlus className="mr-2 h-4 w-4" /> Add
              </Button>
            </div>
            <div className="space-y-2">
              {selectedTeam?.members?.map((m: { id: string; userId: string; user: { id: string; name: string; email: string } }) => (
                <Card key={m.id} className="border-none bg-white/50 backdrop-blur-md dark:bg-slate-900/50">
                  <CardContent className="flex items-center justify-between p-3">
                    <div>
                      <p className="text-sm font-medium">{m.user.name}</p>
                      <p className="text-xs text-muted-foreground">{m.user.email}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleRemoveMember(m.userId)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
              {(!selectedTeam?.members || selectedTeam.members.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">No members yet</p>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
