"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFinanceDashboard } from "@/hooks/use-dashboard";

import { PrimaryAccount } from "./_components/kpis/primary-account";
import { NetWorth } from "./_components/kpis/net-worth";
import { MonthlyCashFlow } from "./_components/kpis/monthly-cash-flow";
import { SavingsRate } from "./_components/kpis/savings-rate";
import { CashFlowOverview } from "./_components/cash-flow-overview";
import { CardOverview } from "./_components/card-overview";
import { SpendingBreakdown } from "./_components/spending-breakdown";
import { IncomeReliability } from "./_components/income-reliability";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  Clock,
  TrendingUp,
  Wallet,
} from "lucide-react";

const cashFlowApiConfig: ChartConfig = {
  income: { label: "Income", color: "#10b981" },
  expense: { label: "Expense", color: "#ef4444" },
};

const reimbursementStatusConfig: ChartConfig = {
  count: { label: "Count" },
  SUBMITTED: { label: "Submitted", color: "#f59e0b" },
  APPROVED: { label: "Approved", color: "#3b82f6" },
  REJECTED: { label: "Rejected", color: "#ef4444" },
  PAID: { label: "Paid", color: "#10b981" },
};

const PIE_COLORS = ["#f59e0b", "#3b82f6", "#ef4444", "#10b981"];

export default function FinanceDashboardPage() {
  const { data, isLoading } = useFinanceDashboard();

  const formatCurrencyIDR = (val: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading finance data...</div>
      </div>
    );
  }

  // Prepare API data for Activity/Invoices/Reimbursements tabs
  const totalIncome = data?.monthlyIncome?.reduce((s: number, m: { amount: number }) => s + m.amount, 0) ?? 0;
  const totalExpense = data?.monthlyExpense?.reduce((s: number, m: { amount: number }) => s + m.amount, 0) ?? 0;
  const netCashFlow = totalIncome - totalExpense;

  const monthlyMap = new Map<string, { month: string; income: number; expense: number }>();
  for (const m of data?.monthlyIncome ?? []) {
    monthlyMap.set(m.month, { month: m.month, income: m.amount, expense: 0 });
  }
  for (const m of data?.monthlyExpense ?? []) {
    const existing = monthlyMap.get(m.month);
    if (existing) {
      existing.expense = m.amount;
    } else {
      monthlyMap.set(m.month, { month: m.month, income: 0, expense: m.amount });
    }
  }
  const cashFlowData = Array.from(monthlyMap.values()).sort((a, b) =>
    a.month.localeCompare(b.month),
  );

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <Tabs className="gap-4" defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="reimbursements">Reimbursements</TabsTrigger>
        </TabsList>

        {/* ────────── Overview Tab ────────── */}
        <TabsContent value="overview">
          <div className="flex flex-col gap-4">
            {/* KPI Row */}
            <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @3xl/main:grid-cols-4">
              <PrimaryAccount totalIncome={totalIncome} totalExpense={totalExpense} />
              <NetWorth
                outstandingInvoices={data?.outstandingInvoices ?? 0}
                outstandingAmount={data?.outstandingAmount ?? 0}
                overdueInvoices={data?.overdueInvoices ?? 0}
              />
              <MonthlyCashFlow netCashFlow={netCashFlow} totalIncome={totalIncome} totalExpense={totalExpense} />
              <SavingsRate
                totalPaidInvoices={data?.totalPaidInvoices ?? 0}
                outstandingInvoices={data?.outstandingInvoices ?? 0}
                overdueInvoices={data?.overdueInvoices ?? 0}
              />
            </div>

            {/* Cash Flow + Recent Invoices */}
            <div className="grid grid-cols-1 gap-4 @3xl/main:grid-cols-[1fr_380px]">
              <CashFlowOverview
                monthlyIncome={data?.monthlyIncome ?? []}
                monthlyExpense={data?.monthlyExpense ?? []}
              />
              <CardOverview recentInvoices={data?.recentInvoices ?? []} />
            </div>

            {/* Reimbursement Overview + Financial Summary */}
            <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2">
              <SpendingBreakdown reimbursementsByStatus={data?.reimbursementsByStatus ?? []} />
              <IncomeReliability
                totalIncome={totalIncome}
                totalExpense={totalExpense}
                totalPaidInvoices={data?.totalPaidInvoices ?? 0}
                outstandingInvoices={data?.outstandingInvoices ?? 0}
              />
            </div>
          </div>
        </TabsContent>

        {/* ────────── Activity Tab (API data) ────────── */}
        <TabsContent value="activity">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @3xl/main:grid-cols-4">
              <Card className="border-none bg-white/50 backdrop-blur-md dark:bg-slate-900/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-green-100 p-2 dark:bg-green-900">
                      <ArrowUpRight className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Income</p>
                      <p className="text-lg font-bold tabular-nums text-green-600">
                        {formatCurrencyIDR(totalIncome)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none bg-white/50 backdrop-blur-md dark:bg-slate-900/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-red-100 p-2 dark:bg-red-900">
                      <ArrowDownLeft className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Expense</p>
                      <p className="text-lg font-bold tabular-nums text-red-600">
                        {formatCurrencyIDR(totalExpense)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none bg-white/50 backdrop-blur-md dark:bg-slate-900/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Net Cash Flow</p>
                      <p className={`text-lg font-bold tabular-nums ${netCashFlow >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {formatCurrencyIDR(netCashFlow)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none bg-white/50 backdrop-blur-md dark:bg-slate-900/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-amber-100 p-2 dark:bg-amber-900">
                      <Clock className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Outstanding</p>
                      <p className="text-lg font-bold tabular-nums">
                        {formatCurrencyIDR(data?.outstandingAmount ?? 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-none bg-white/50 backdrop-blur-md dark:bg-slate-900/50">
              <CardHeader>
                <CardTitle>Cash Flow Overview</CardTitle>
                <CardDescription>Monthly income vs expense (Real data)</CardDescription>
              </CardHeader>
              <CardContent>
                {cashFlowData.length > 0 ? (
                  <ChartContainer config={cashFlowApiConfig} className="h-[300px] w-full">
                    <AreaChart data={cashFlowData}>
                      <defs>
                        <linearGradient id="fillIncome" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="fillExpense" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area type="monotone" dataKey="income" stroke="#10b981" fill="url(#fillIncome)" stackId="a" />
                      <Area type="monotone" dataKey="expense" stroke="#ef4444" fill="url(#fillExpense)" stackId="b" />
                    </AreaChart>
                  </ChartContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    No monthly data
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ────────── Invoices Tab ────────── */}
        <TabsContent value="invoices">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-3">
              <Card className="border-none bg-white/50 backdrop-blur-md dark:bg-slate-900/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
                      <Wallet className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Invoices</p>
                      <p className="text-xl font-bold tabular-nums">
                        {(data?.outstandingInvoices ?? 0) + (data?.totalPaidInvoices ?? 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-none bg-white/50 backdrop-blur-md dark:bg-slate-900/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-amber-100 p-2 dark:bg-amber-900">
                      <Clock className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Outstanding Amount</p>
                      <p className="text-xl font-bold tabular-nums">
                        {formatCurrencyIDR(data?.outstandingAmount ?? 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-none bg-white/50 backdrop-blur-md dark:bg-slate-900/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-red-100 p-2 dark:bg-red-900">
                      <Banknote className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Overdue</p>
                      <p className="text-xl font-bold tabular-nums">{data?.overdueInvoices ?? 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {data?.recentInvoices && data.recentInvoices.length > 0 && (
              <Card className="border-none bg-white/50 backdrop-blur-md dark:bg-slate-900/50">
                <CardHeader>
                  <CardTitle>Recent Invoices</CardTitle>
                  <CardDescription>Latest invoices across all projects</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.recentInvoices.map(
                      (inv: { id: string; invoiceNumber: string; type: string; status: string; total: number }) => (
                        <div key={inv.id} className="flex items-center justify-between rounded-lg border p-3">
                          <div className="flex items-center gap-3">
                            <Badge variant={inv.type === "INCOME" ? "default" : "destructive"}>
                              {inv.type}
                            </Badge>
                            <div>
                              <p className="text-sm font-medium">{inv.invoiceNumber}</p>
                              <p className="text-xs text-muted-foreground">{inv.status}</p>
                            </div>
                          </div>
                          <p className={`text-sm font-bold tabular-nums ${inv.type === "INCOME" ? "text-green-600" : "text-red-600"}`}>
                            {formatCurrencyIDR(inv.total)}
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* ────────── Reimbursements Tab ────────── */}
        <TabsContent value="reimbursements">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2">
              <Card className="border-none bg-white/50 backdrop-blur-md dark:bg-slate-900/50">
                <CardHeader>
                  <CardTitle>Reimbursements by Status</CardTitle>
                  <CardDescription>Distribution of reimbursement requests</CardDescription>
                </CardHeader>
                <CardContent>
                  {data?.reimbursementsByStatus && data.reimbursementsByStatus.length > 0 ? (
                    <ChartContainer config={reimbursementStatusConfig} className="h-[250px] w-full">
                      <PieChart>
                        <Pie
                          data={data.reimbursementsByStatus}
                          dataKey="count"
                          nameKey="status"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ status, count }: { status: string; count: number }) => `${status}: ${count}`}
                        >
                          {data.reimbursementsByStatus.map(
                            (entry: { status: string; count: number }, i: number) => (
                              <Cell key={entry.status} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                            ),
                          )}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ChartContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                      No reimbursement data
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-none bg-white/50 backdrop-blur-md dark:bg-slate-900/50">
                <CardHeader>
                  <CardTitle>Reimbursement Summary</CardTitle>
                  <CardDescription>Total amounts by status</CardDescription>
                </CardHeader>
                <CardContent>
                  {data?.reimbursementsByStatus && data.reimbursementsByStatus.length > 0 ? (
                    <div className="space-y-4">
                      {data.reimbursementsByStatus.map(
                        (item: { status: string; count: number; total?: number }, i: number) => (
                          <div key={item.status} className="flex items-center gap-3">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium">{item.status}</p>
                                <Badge variant="outline">{item.count}</Badge>
                              </div>
                              {item.total !== undefined && (
                                <p className="text-xs text-muted-foreground">
                                  {formatCurrencyIDR(item.total)}
                                </p>
                              )}
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                      No reimbursement data
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
