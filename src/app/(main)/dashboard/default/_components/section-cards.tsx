"use client";

import { TrendingDown, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DashboardSummary } from "@/hooks/use-dashboard";

export function SectionCards({ summary }: { summary: DashboardSummary | undefined }) {
  const activeRate =
    summary && summary.totalProjects > 0
      ? Math.round((summary.activeProjects / summary.totalProjects) * 100)
      : 0;
  const taskRate = summary?.taskCompletionRate ?? 0;
  const unpaidRate =
    summary && summary.totalInvoices > 0
      ? Math.round((summary.unpaidInvoices / summary.totalInvoices) * 100)
      : 0;

  return (
    <div className="grid @5xl/main:grid-cols-4 @xl/main:grid-cols-2 grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Projects</CardDescription>
          <CardTitle className="font-semibold @[250px]/card:text-3xl text-2xl tabular-nums">
            {summary?.totalProjects ?? 0}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {activeRate >= 50 ? <TrendingUp /> : <TrendingDown />}
              {activeRate}% active
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {summary?.activeProjects ?? 0} projects active{" "}
            <TrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Across all project statuses
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Task Completion</CardDescription>
          <CardTitle className="font-semibold @[250px]/card:text-3xl text-2xl tabular-nums">
            {summary?.completedTasks ?? 0}
            <span className="text-base font-normal text-muted-foreground">
              /{summary?.totalTasks ?? 0}
            </span>
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {taskRate >= 50 ? <TrendingUp /> : <TrendingDown />}
              {taskRate}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {taskRate >= 50 ? "Good completion rate" : "Needs attention"}{" "}
            {taskRate >= 50 ? (
              <TrendingUp className="size-4" />
            ) : (
              <TrendingDown className="size-4" />
            )}
          </div>
          <div className="text-muted-foreground">
            {summary?.completedTasks ?? 0} of {summary?.totalTasks ?? 0} tasks done
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Invoices</CardDescription>
          <CardTitle className="font-semibold @[250px]/card:text-3xl text-2xl tabular-nums">
            {summary?.totalInvoices ?? 0}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {unpaidRate <= 30 ? <TrendingUp /> : <TrendingDown />}
              {summary?.unpaidInvoices ?? 0} unpaid
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {unpaidRate === 0 ? (
              <>All invoices paid <TrendingUp className="size-4" /></>
            ) : (
              <>{unpaidRate}% unpaid <TrendingDown className="size-4" /></>
            )}
          </div>
          <div className="text-muted-foreground">
            {summary?.pendingReimbursements ?? 0} pending reimbursements
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Users</CardDescription>
          <CardTitle className="font-semibold @[250px]/card:text-3xl text-2xl tabular-nums">
            {summary?.totalUsers ?? 0}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUp />
              Active
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Registered users <TrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {summary?.totalReimbursements ?? 0} total reimbursements
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
