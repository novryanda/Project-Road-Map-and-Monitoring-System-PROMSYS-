"use client";

import { Calendar, TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface MonthlyCashFlowProps {
  netCashFlow: number;
  totalIncome: number;
  totalExpense: number;
}

const formatIDR = (val: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val);

export function MonthlyCashFlow({ netCashFlow, totalIncome, totalExpense }: MonthlyCashFlowProps) {
  const margin = totalIncome > 0 ? Math.round((netCashFlow / totalIncome) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-content-center rounded-sm bg-muted">
              <Calendar className="size-5" />
            </span>
            Net Cash Flow
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-0.5">
          <p className={`font-medium text-xl tabular-nums ${netCashFlow >= 0 ? "text-green-600" : "text-red-600"}`}>
            {netCashFlow >= 0 ? "+" : ""}{formatIDR(netCashFlow)}
          </p>
          <p className="text-muted-foreground text-xs">Last 6 months · Net</p>
        </div>

        <Separator />
        <p className="flex items-center text-muted-foreground text-xs">
          <TrendingUp className="size-4" />
          &nbsp;Margin: {margin}%
        </p>
      </CardContent>
    </Card>
  );
}
