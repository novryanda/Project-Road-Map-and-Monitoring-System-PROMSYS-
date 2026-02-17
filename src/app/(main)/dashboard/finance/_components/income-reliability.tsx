"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface IncomeReliabilityProps {
  totalIncome: number;
  totalExpense: number;
  totalPaidInvoices: number;
  outstandingInvoices: number;
}

const formatIDR = (val: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val);

export function IncomeReliability({ totalIncome, totalExpense, totalPaidInvoices, outstandingInvoices }: IncomeReliabilityProps) {
  const netProfit = totalIncome - totalExpense;
  const profitMargin = totalIncome > 0 ? Math.round((netProfit / totalIncome) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Summary</CardTitle>
        <CardDescription>Income vs expense overview (last 6 months)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Separator />
        <div className="flex justify-between">
          <div className="space-y-0.5">
            <p className="font-medium text-lg">Total Income</p>
            <p className="text-muted-foreground text-xs">{totalPaidInvoices} paid invoices</p>
          </div>
          <p className="font-medium text-lg text-green-600">{formatIDR(totalIncome)}</p>
        </div>
        <Separator />
        <div className="flex justify-between">
          <div className="space-y-0.5">
            <p className="font-medium text-lg">Total Expense</p>
            <p className="text-muted-foreground text-xs">{outstandingInvoices} outstanding</p>
          </div>
          <p className="font-medium text-lg text-red-600">{formatIDR(totalExpense)}</p>
        </div>
        <Separator />
        <div className="flex justify-between">
          <div className="space-y-0.5">
            <p className="font-medium text-lg">Net Profit</p>
            <p className="text-muted-foreground text-xs">Profit margin: {profitMargin}%</p>
          </div>
          <p className={`font-medium text-lg ${netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
            {formatIDR(netProfit)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
