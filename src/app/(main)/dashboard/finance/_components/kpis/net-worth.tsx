"use client";

import { Banknote } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface OutstandingOverviewProps {
  outstandingInvoices: number;
  outstandingAmount: number;
  overdueInvoices: number;
}

const formatIDR = (val: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val);

export function NetWorth({ outstandingInvoices, outstandingAmount, overdueInvoices }: OutstandingOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-content-center rounded-sm bg-muted">
              <Banknote className="size-5" />
            </span>
            Outstanding
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-0.5">
          <div className="flex items-center justify-between">
            <p className="font-medium text-xl tabular-nums">{formatIDR(outstandingAmount)}</p>
          </div>
          <p className="text-muted-foreground text-xs">{outstandingInvoices} unpaid invoices</p>
        </div>

        <Separator />

        <p className="text-muted-foreground text-xs">
          Overdue: <span className="font-medium text-red-600">{overdueInvoices}</span> invoices
        </p>
      </CardContent>
    </Card>
  );
}
