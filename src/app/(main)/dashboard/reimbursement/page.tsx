"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useReimbursements } from "@/hooks/use-reimbursements";
import { useAuth } from "@/components/auth/auth-provider";
import { Plus, Search, ArrowRight, User } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  APPROVED: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  REJECTED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  PAID: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
};

export default function ReimbursementPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [view, setView] = useState<'me' | 'all'>(
    (user?.role === 'ADMIN' || user?.role === 'FINANCE') ? 'all' : 'me'
  );

  const { data: response, isLoading } = useReimbursements({
    page: 1,
    size: 100,
    view: view
  });

  const reimbursements = response?.data || [];
  const isAdminOrFinance = user?.role === 'ADMIN' || user?.role === 'FINANCE';

  const filteredReimbursements = reimbursements.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.description?.toLowerCase().includes(search.toLowerCase()) ||
    r.submittedBy?.name.toLowerCase().includes(search.toLowerCase())
  );

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {view === 'all' ? 'Reimbursement Moderation' : 'My Reimbursements'}
          </h1>
          <p className="text-muted-foreground">
            {view === 'all' ? 'Review and manage team reimbursement requests' : 'Manage and track your private reimbursement requests'}
          </p>
        </div>
        <Link href="/dashboard/reimbursement/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> New Request
          </Button>
        </Link>
      </div>

      <Card className="border-none bg-white/50 backdrop-blur-md dark:bg-slate-900/50">
        <CardHeader className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 pb-4">
          <div className="flex flex-col gap-4 w-full md:w-auto">
            <CardTitle className="text-lg font-medium">Request History</CardTitle>
            {isAdminOrFinance && (
              <Tabs value={view} onValueChange={(v) => setView(v as 'me' | 'all')}>
                <TabsList className="grid w-[240px] grid-cols-2">
                  <TabsTrigger value="me">My Requests</TabsTrigger>
                  <TabsTrigger value="all">All Requests</TabsTrigger>
                </TabsList>
              </Tabs>
            )}
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search requests..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border bg-white dark:bg-slate-900 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  {view === 'all' && <TableHead>Applicant</TableHead>}
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={view === 'all' ? 7 : 6} className="h-24 text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredReimbursements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={view === 'all' ? 7 : 6} className="h-24 text-center text-muted-foreground">
                      No reimbursements found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReimbursements.map((item) => (
                    <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => router.push(`/dashboard/reimbursement/${item.id}`)}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{item.title}</span>
                          {item.project && (
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{item.project.name}</span>
                          )}
                        </div>
                      </TableCell>
                      {view === 'all' && (
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center dark:bg-slate-800">
                              <User className="h-3 w-3 text-slate-500" />
                            </div>
                            <span className="text-sm">{item.submittedBy?.name}</span>
                          </div>
                        </TableCell>
                      )}
                      <TableCell>
                        <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10 dark:bg-slate-900 dark:text-slate-400">
                          {item.category?.name}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap">{formatDate(item.createdAt)}</TableCell>
                      <TableCell className="font-bold tabular-nums">{formatCurrency(item.amount)}</TableCell>
                      <TableCell>
                        <Badge
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold border-none ${STATUS_COLORS[item.status]}`}
                          variant="secondary"
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/dashboard/reimbursement/${item.id}`}>
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
