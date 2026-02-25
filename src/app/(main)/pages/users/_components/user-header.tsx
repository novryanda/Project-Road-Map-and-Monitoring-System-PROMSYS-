"use client";

import { Users, UserCheck, ShieldAlert } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CreateUserDialog } from "./create-user-dialog";
import { useUsers } from "@/hooks/use-users";

export function UserHeader() {
    const { data: users = [] } = useUsers();

    const totalUsers = users.length;
    const activeUsers = users.filter((u) => !u.banned).length;
    const suspendedUsers = users.filter((u) => u.banned).length;

    const stats = [
        {
            label: "Total Users",
            value: totalUsers.toLocaleString(),
            icon: <Users className="h-4 w-4 text-blue-500" />,
            description: `${totalUsers} registered users`,
        },
        {
            label: "Active",
            value: activeUsers.toLocaleString(),
            icon: <UserCheck className="h-4 w-4 text-emerald-500" />,
            description: totalUsers > 0 ? `${Math.round((activeUsers / totalUsers) * 100)}% of total` : "0% of total",
        },
        {
            label: "Suspended",
            value: suspendedUsers.toLocaleString(),
            icon: <ShieldAlert className="h-4 w-4 text-rose-500" />,
            description: suspendedUsers > 0 ? "Requires review" : "No suspended users",
        },
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                    <p className="text-muted-foreground">
                        Manage your organization&apos;s members, roles, and permissions.
                    </p>
                </div>
                <CreateUserDialog />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
                {stats.map((stat, index) => (
                    <Card key={index} className="overflow-hidden border-none bg-white/50 backdrop-blur-md dark:bg-slate-900/50">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between space-x-4">
                                <div className="flex items-center space-x-4">
                                    <div className="rounded-full bg-slate-100 p-2 dark:bg-slate-800">
                                        {stat.icon}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            {stat.label}
                                        </p>
                                        <h2 className="text-2xl font-bold">{stat.value}</h2>
                                    </div>
                                </div>
                            </div>
                            <p className="mt-2 text-xs text-muted-foreground">
                                {stat.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}