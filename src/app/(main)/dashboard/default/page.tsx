"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import {
  useDashboardSummary,
  useFinanceDashboard,
  useProjectDashboard,
} from "@/hooks/use-dashboard";

import { ChartAreaInteractive } from "./_components/chart-area-interactive";
import { DataTable } from "./_components/data-table";
import { SectionCards } from "./_components/section-cards";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isPending } = useAuth();
  const { data: summary, isLoading: summaryLoading } = useDashboardSummary();
  const { data: financeData } = useFinanceDashboard();
  const { data: projectData } = useProjectDashboard();

  // Redirect non-ADMIN users to their appropriate page
  useEffect(() => {
    if (isPending) return;
    if (!user || user.role !== "ADMIN") {
      const route =
        user?.role === "FINANCE"
          ? "/dashboard/finance"
          : user?.role === "PROJECTMANAGER"
            ? "/dashboard/project-management/project"
            : "/dashboard/project-management/tasks";
      router.replace(route);
    }
  }, [user, isPending, router]);

  if (isPending || summaryLoading || (user && user.role !== "ADMIN")) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 md:gap-6">
      <SectionCards summary={summary} />
      <ChartAreaInteractive financeData={financeData} />
      <DataTable data={projectData?.recentProjects ?? []} />
    </div>
  );
}
