"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ReimbursementStatus {
  status: string;
  count: number;
  total: number;
}

interface SpendingBreakdownProps {
  reimbursementsByStatus: ReimbursementStatus[];
}

const STATUS_COLORS: Record<string, string> = {
  SUBMITTED: "#f59e0b",
  PENDING: "#f59e0b",
  APPROVED: "#3b82f6",
  REJECTED: "#ef4444",
  PAID: "#10b981",
};

const formatIDR = (val: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val);

export function SpendingBreakdown({ reimbursementsByStatus }: SpendingBreakdownProps) {
  const totalAmount = reimbursementsByStatus.reduce((sum, item) => sum + item.total, 0);
  const totalCount = reimbursementsByStatus.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reimbursement Overview</CardTitle>
        <CardDescription>Distribution by status</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {reimbursementsByStatus.length > 0 ? (
          <>
            <div className="space-y-1">
              <div className="font-medium text-2xl">{formatIDR(totalAmount)}</div>
              <p className="text-muted-foreground text-xs">{totalCount} total requests</p>
              <div className="flex h-6 w-full overflow-hidden rounded-md">
                {reimbursementsByStatus.map((item) => {
                  const width = totalCount > 0 ? (item.count / totalCount) * 100 : 0;
                  return (
                    <div
                      key={item.status}
                      className="h-full shrink-0 border-background border-l first:border-l-0"
                      style={{
                        width: `${width}%`,
                        backgroundColor: STATUS_COLORS[item.status] || "#94a3b8",
                      }}
                      title={`${item.status}: ${item.count}`}
                    />
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              {reimbursementsByStatus.map((item) => {
                const pct = totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0;
                return (
                  <div key={item.status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="size-3 rounded-sm"
                        style={{ backgroundColor: STATUS_COLORS[item.status] || "#94a3b8" }}
                      />
                      <span className="text-muted-foreground text-sm">{item.status}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm tabular-nums">{formatIDR(item.total)}</span>
                      <span className="font-medium text-sm tabular-nums w-10 text-right">{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-[150px] text-muted-foreground text-sm">
            No reimbursement data
          </div>
        )}
      </CardContent>
    </Card>
  );
}
