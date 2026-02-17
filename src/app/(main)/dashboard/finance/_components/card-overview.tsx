"use client";

import { ArrowDownLeft, ArrowUpRight, FileText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface RecentInvoice {
  id: string;
  invoiceNumber: string;
  type: string;
  status: string;
  total: number;
}

interface CardOverviewProps {
  recentInvoices: RecentInvoice[];
}

const formatIDR = (val: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val);

const STATUS_COLOR: Record<string, string> = {
  PAID: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  UNPAID: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  DEBT: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export function CardOverview({ recentInvoices }: CardOverviewProps) {
  return (
    <Card className="shadow-xs">
      <CardHeader>
        <CardTitle>Recent Invoices</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Separator />

          {recentInvoices.length > 0 ? (
            <div className="space-y-3">
              {recentInvoices.slice(0, 5).map((inv) => (
                <div key={inv.id} className="flex items-center gap-2">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
                    {inv.type === "INCOME" ? (
                      <ArrowDownLeft className="size-5 text-green-600" />
                    ) : (
                      <ArrowUpRight className="size-5 text-red-600" />
                    )}
                  </div>
                  <div className="flex w-full items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{inv.invoiceNumber}</p>
                      <Badge className={STATUS_COLOR[inv.status] || ""} variant="secondary">
                        {inv.status}
                      </Badge>
                    </div>
                    <div>
                      <span className={`font-medium text-sm tabular-nums leading-none ${inv.type === "INCOME" ? "text-green-600" : "text-red-600"}`}>
                        {formatIDR(inv.total)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[100px] text-muted-foreground text-sm">
              <FileText className="size-4 mr-2" />
              No invoices yet
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
