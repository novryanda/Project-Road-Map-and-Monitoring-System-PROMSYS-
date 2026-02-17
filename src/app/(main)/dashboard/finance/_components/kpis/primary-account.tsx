"use client";

import { WalletMinimal } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PrimaryAccountProps {
  totalIncome: number;
  totalExpense: number;
}

const formatIDR = (val: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val);

export function PrimaryAccount({ totalIncome, totalExpense }: PrimaryAccountProps) {
  const netBalance = totalIncome - totalExpense;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-content-center rounded-sm bg-muted">
              <WalletMinimal className="size-5" />
            </span>
            Total Income
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-0.5">
          <p className="font-medium text-xl tabular-nums text-green-600">{formatIDR(totalIncome)}</p>
          <p className="text-muted-foreground text-xs">Total paid invoices (income)</p>
        </div>

        <div className="space-y-0.5">
          <p className="text-sm tabular-nums">
            Net: <span className={netBalance >= 0 ? "text-green-600" : "text-red-600"}>{formatIDR(netBalance)}</span>
          </p>
          <p className="text-muted-foreground text-xs">Income - Expense</p>
        </div>
      </CardContent>
    </Card>
  );
}
