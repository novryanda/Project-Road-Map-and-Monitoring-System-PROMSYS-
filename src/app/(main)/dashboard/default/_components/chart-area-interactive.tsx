"use client";

import * as React from "react";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { FinanceDashboard } from "@/hooks/use-dashboard";

const chartConfig = {
  finance: {
    label: "Finance",
  },
  income: {
    label: "Income",
    color: "var(--chart-1)",
  },
  expense: {
    label: "Expense",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val);

export function ChartAreaInteractive({
  financeData,
}: {
  financeData: FinanceDashboard | undefined;
}) {
  const chartData = React.useMemo(() => {
    if (!financeData) return [];
    const monthMap = new Map<string, { month: string; income: number; expense: number }>();

    for (const item of financeData.monthlyIncome) {
      const existing = monthMap.get(item.month) ?? { month: item.month, income: 0, expense: 0 };
      existing.income = item.amount;
      monthMap.set(item.month, existing);
    }
    for (const item of financeData.monthlyExpense) {
      const existing = monthMap.get(item.month) ?? { month: item.month, income: 0, expense: 0 };
      existing.expense = item.amount;
      monthMap.set(item.month, existing);
    }

    return Array.from(monthMap.values()).sort((a, b) => a.month.localeCompare(b.month));
  }, [financeData]);

  const hasData = chartData.length > 0;

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Income vs Expense</CardTitle>
        <CardDescription>
          <span className="@[540px]/card:block hidden">Monthly income and expense for the last 6 months</span>
          <span className="@[540px]/card:hidden">Last 6 months</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {hasData ? (
          <ChartContainer config={chartConfig} className="aspect-auto h-62 w-full">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="fillIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-income)" stopOpacity={1.0} />
                  <stop offset="95%" stopColor="var(--color-income)" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="fillExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-expense)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-expense)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const [y, m] = value.split("-");
                  const date = new Date(Number(y), Number(m) - 1);
                  return date.toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      const [y, m] = value.split("-");
                      const date = new Date(Number(y), Number(m) - 1);
                      return date.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
                    }}
                    formatter={(value, name) => (
                      <div className="flex items-center gap-2">
                        <span className="capitalize">{String(name)}</span>
                        <span className="font-medium">{formatCurrency(Number(value))}</span>
                      </div>
                    )}
                    indicator="dot"
                  />
                }
              />
              <Area dataKey="expense" type="natural" fill="url(#fillExpense)" stroke="var(--color-expense)" stackId="a" />
              <Area dataKey="income" type="natural" fill="url(#fillIncome)" stroke="var(--color-income)" stackId="a" />
            </AreaChart>
          </ChartContainer>
        ) : (
          <div className="flex items-center justify-center h-62 text-muted-foreground">
            No financial data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
