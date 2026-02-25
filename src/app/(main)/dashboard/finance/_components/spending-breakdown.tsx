"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SpendingCategory {
  name: string;
  amount: number;
}

interface SpendingBreakdownProps {
  expensesByCategory: SpendingCategory[];
}

const CATEGORY_COLORS = [
  "#ef4444", // Red (Housing)
  "#f87171", // Lighter Red
  "#fb7185", // Rose
  "#fecaca", // Very Light Red/Pink
  "#ffedd5", // Orange/Amber tint
  "#fee2e2", // Pale Red
  "#fca5a5", // Medium Red
];

const formatIDR = (val: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val);

export function SpendingBreakdown({ expensesByCategory }: SpendingBreakdownProps) {
  const totalAmount = expensesByCategory.reduce((sum, item) => sum + item.amount, 0);

  return (
    <Card className="border-none shadow-md bg-white dark:bg-slate-900 overflow-hidden">
      <CardHeader>
        <CardTitle className="text-xl font-bold tracking-tight">Spending Breakdown</CardTitle>
        <CardDescription className="text-muted-foreground font-medium">Expense distribution by category.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8 pt-2">
        {expensesByCategory.length > 0 ? (
          <>
            <div className="space-y-4">
              <div className="font-black text-4xl tracking-tighter">{formatIDR(totalAmount)}</div>

              {/* Segmented Progress Bar */}
              <div className="flex h-10 w-full gap-0.5 overflow-hidden rounded-md group">
                {expensesByCategory.map((item, i) => {
                  const width = totalAmount > 0 ? (item.amount / totalAmount) * 100 : 0;
                  if (width < 1) return null; // Hide very small segments
                  return (
                    <div
                      key={item.name}
                      className="h-full first:rounded-l-sm last:rounded-r-sm transition-all duration-300 hover:opacity-80"
                      style={{
                        width: `${width}%`,
                        backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
                      }}
                      title={`${item.name}: ${formatIDR(item.amount)}`}
                    />
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              {expensesByCategory.map((item, i) => {
                const pct = totalAmount > 0 ? Math.round((item.amount / totalAmount) * 100) : 0;
                return (
                  <div key={item.name} className="flex items-center justify-between group cursor-default">
                    <div className="flex items-center gap-3">
                      <div
                        className="size-4 rounded-sm"
                        style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}
                      />
                      <span className="text-sm font-bold text-muted-foreground group-hover:text-foreground transition-colors">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="text-sm tabular-nums text-muted-foreground font-medium">
                        {formatIDR(item.amount)}
                      </span>
                      <span className="font-black text-sm tabular-nums w-12 text-right">
                        {pct}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
            <p className="text-sm font-bold opacity-40 uppercase tracking-widest">No spending data</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
