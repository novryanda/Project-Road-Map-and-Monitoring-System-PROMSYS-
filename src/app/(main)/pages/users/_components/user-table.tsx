"use client";

import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoreHorizontal, Search, Mail, Shield, Loader2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUsers, useBanUser, useUnbanUser, useRemoveUser, type User } from "@/hooks/use-users";
import { EditRoleDialog } from "./edit-role-dialog";
import { getInitials } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

const ROLE_LABEL: Record<string, string> = {
    ADMIN: "Admin",
    PROJECTMANAGER: "Project Manager",
    FINANCE: "Finance",
    EMPLOYEES: "Employees",
};

export function UserTable() {
    const { data: users = [], isLoading, error } = useUsers();
    const banUser = useBanUser();
    const unbanUser = useUnbanUser();
    const removeUser = useRemoveUser();

    const [searchQuery, setSearchQuery] = useState("");
    const [editRoleUser, setEditRoleUser] = useState<User | null>(null);
    const [deleteUser, setDeleteUser] = useState<User | null>(null);

    const filteredUsers = users.filter(
        (user) =>
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (ROLE_LABEL[user.role] || user.role).toLowerCase().includes(searchQuery.toLowerCase()),
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading users...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center py-12">
                <p className="text-destructive">Failed to load users. Make sure you have admin privileges.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex flex-1 items-center space-x-2">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search users..."
                            className="pl-9 bg-white/50 backdrop-blur-md dark:bg-slate-900/50"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="rounded-md border bg-white/40 backdrop-blur-md dark:bg-slate-900/40">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-[300px]">User</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead className="w-[80px]" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    {searchQuery ? "No users match your search." : "No users found."}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers.map((user) => (
                                <TableRow key={user.id} className="group transition-colors hover:bg-slate-100/30 dark:hover:bg-slate-800/30">
                                    <TableCell>
                                        <div className="flex items-center space-x-3">
                                            <Avatar className="h-9 w-9 border">
                                                <AvatarImage src={user.image || undefined} />
                                                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{user.name}</span>
                                                <span className="text-xs text-muted-foreground flex items-center">
                                                    <Mail className="mr-1 h-3 w-3" />
                                                    {user.email}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center">
                                            <Shield className="mr-2 h-3 w-3 text-muted-foreground" />
                                            {ROLE_LABEL[user.role] || user.role}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={user.banned ? "destructive" : "default"}>
                                            {user.banned ? "Suspended" : "Active"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.email)}>
                                                    Copy email
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => setEditRoleUser(user)}>
                                                    Edit role
                                                </DropdownMenuItem>
                                                {user.banned ? (
                                                    <DropdownMenuItem
                                                        onClick={() => unbanUser.mutate({ userId: user.id })}
                                                    >
                                                        Unban user
                                                    </DropdownMenuItem>
                                                ) : (
                                                    <DropdownMenuItem
                                                        onClick={() => banUser.mutate({ userId: user.id, banReason: "Suspended by admin" })}
                                                    >
                                                        Suspend user
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem
                                                    className="text-destructive"
                                                    onClick={() => setDeleteUser(user)}
                                                >
                                                    Delete user
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Edit Role Dialog */}
            {editRoleUser && (
                <EditRoleDialog
                    user={editRoleUser}
                    open={!!editRoleUser}
                    onOpenChange={(open) => !open && setEditRoleUser(null)}
                />
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteUser} onOpenChange={(open) => !open && setDeleteUser(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete User</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <span className="font-medium">{deleteUser?.name}</span>?
                            This action cannot be undone and will permanently remove the user and all their data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => {
                                if (deleteUser) {
                                    removeUser.mutate({ userId: deleteUser.id });
                                    setDeleteUser(null);
                                }
                            }}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
