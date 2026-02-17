"use client";

import { HandCoins } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface InvoiceSummaryProps {
  totalPaidInvoices: number;
  outstandingInvoices: number;
  overdueInvoices: number;
}

export function SavingsRate({ totalPaidInvoices, outstandingInvoices, overdueInvoices }: InvoiceSummaryProps) {
  const totalInvoices = totalPaidInvoices + outstandingInvoices;
  const paidRate = totalInvoices > 0 ? Math.round((totalPaidInvoices / totalInvoices) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-content-center rounded-sm bg-muted">
              <HandCoins className="size-5" />
            </span>
            Invoice Summary
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-0.5">
          <div className="flex items-center justify-between">
            <p className="font-medium text-xl tabular-nums">{paidRate}%</p>
            <span className="text-xs">{totalPaidInvoices} paid</span>
          </div>
          <p className="text-muted-foreground text-xs">Payment completion rate</p>
        </div>

        <Separator />

        <p className="text-muted-foreground text-xs">
          {outstandingInvoices} outstanding · {overdueInvoices} overdue
        </p>
      </CardContent>
    </Card>
  );
}
