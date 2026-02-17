"use client";

import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Separator } from "@/components/ui/separator";

interface CashFlowOverviewProps {
  monthlyIncome: { month: string; amount: number }[];
  monthlyExpense: { month: string; amount: number }[];
}

const chartConfig = {
  income: {
    label: "Income",
    color: "var(--chart-1)",
  },
  expenses: {
    label: "Expenses",
    color: "var(--chart-2)",
  },
} as ChartConfig;

const formatIDR = (val: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val);

export function CashFlowOverview({ monthlyIncome, monthlyExpense }: CashFlowOverviewProps) {
  // Merge monthly data
  const monthlyMap = new Map<string, { month: string; income: number; expenses: number }>();
  for (const m of monthlyIncome) {
    monthlyMap.set(m.month, { month: m.month, income: m.amount, expenses: 0 });
  }
  for (const m of monthlyExpense) {
    const existing = monthlyMap.get(m.month);
    if (existing) {
      existing.expenses = -m.amount;
    } else {
      monthlyMap.set(m.month, { month: m.month, income: 0, expenses: -m.amount });
    }
  }
  const chartData = Array.from(monthlyMap.values()).sort((a, b) => a.month.localeCompare(b.month));

  const totalIncome = monthlyIncome.reduce((acc, item) => acc + item.amount, 0);
  const totalExpenses = monthlyExpense.reduce((acc, item) => acc + item.amount, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cash Flow Overview</CardTitle>
        <CardDescription>Monthly income and expenses (last 6 months)</CardDescription>
      </CardHeader>
      <CardContent>
        <Separator />
        <div className="flex items-start justify-between gap-2 py-5 md:items-stretch md:gap-0">
          <div className="flex flex-1 items-center justify-center gap-2">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-chart-1">
              <ArrowDownLeft className="size-6 stroke-background" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase">Income</p>
              <p className="font-medium tabular-nums">{formatIDR(totalIncome)}</p>
            </div>
          </div>
          <Separator orientation="vertical" className="h-auto! self-stretch" />
          <div className="flex flex-1 items-center justify-center gap-2">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-chart-2">
              <ArrowUpRight className="size-6 stroke-background" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase">Expenses</p>
              <p className="font-medium tabular-nums">{formatIDR(totalExpenses)}</p>
            </div>
          </div>
        </div>
        <Separator />
        {chartData.length > 0 ? (
          <ChartContainer className="max-h-72 w-full" config={chartConfig}>
            <BarChart
              stackOffset="sign"
              margin={{ left: -25, right: 0, top: 25, bottom: 0 }}
              accessibilityLayer
              data={chartData}
            >
              <CartesianGrid vertical={false} />
              <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickMargin={8}
                tickFormatter={(value) => {
                  const abs = Math.abs(value);
                  const formatted = abs >= 1_000_000 ? `${(abs / 1_000_000).toFixed(0)}M` : abs >= 1000 ? `${(abs / 1000).toFixed(0)}k` : `${abs}`;
                  return value < 0 ? `-${formatted}` : formatted;
                }}
              />
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <ReferenceLine y={0} stroke="var(--border)" />
              <Bar dataKey="income" stackId="a" fill={chartConfig.income.color} radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" stackId="a" fill={chartConfig.expenses.color} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            No monthly data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
