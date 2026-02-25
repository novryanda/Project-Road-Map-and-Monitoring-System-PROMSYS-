"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { sidebarItems } from "@/navigation/sidebar/sidebar-items";
import type { NavGroup, NavMainItem, NavSubItem, UserRole } from "@/navigation/sidebar/sidebar-items";
import UnauthorizedPage from "@/app/(main)/unauthorized/page";

interface RoleGuardProps {
    children: React.ReactNode;
}

export function RoleGuard({ children }: RoleGuardProps) {
    const pathname = usePathname();
    const { user, isPending } = useAuth();

    if (isPending) return null;

    // Admin has access to everything
    if (user?.role === "ADMIN") {
        return <>{children}</>;
    }

    // Check if current path requires specific roles
    const currentRole = user?.role as UserRole;

    // Find matching menu item for current path
    let isAllowed = true;
    let isPathMatched = false;

    for (const group of sidebarItems) {
        for (const item of group.items) {
            // Direct match or parent of subItems
            if (pathname === item.url || pathname.startsWith(`${item.url}/`)) {
                isPathMatched = true;
                if (item.allowedRoles && !item.allowedRoles.includes(currentRole)) {
                    isAllowed = false;
                }
            }

            // Check sub items
            if (item.subItems) {
                for (const sub of item.subItems) {
                    if (pathname === sub.url || pathname.startsWith(`${sub.url}/`)) {
                        isPathMatched = true;
                        if (sub.allowedRoles && !sub.allowedRoles.includes(currentRole)) {
                            isAllowed = false;
                        }
                    }
                }
            }

            if (isPathMatched && !isAllowed) break;
        }
        if (isPathMatched && !isAllowed) break;
    }

    // If path is protected and user doesn't have role, show unauthorized
    if (isPathMatched && !isAllowed) {
        return <UnauthorizedPage />;
    }

    return <>{children}</>;
}
