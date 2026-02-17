import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export interface DashboardSummary {
  totalProjects: number;
  activeProjects: number;
  totalTasks: number;
  completedTasks: number;
  taskCompletionRate: number;
  totalInvoices: number;
  unpaidInvoices: number;
  totalReimbursements: number;
  pendingReimbursements: number;
  totalUsers: number;
}

export interface FinanceDashboard {
  monthlyIncome: { month: string; amount: number }[];
  monthlyExpense: { month: string; amount: number }[];
  outstandingInvoices: number;
  outstandingAmount: number;
  overdueInvoices: number;
  totalPaidInvoices: number;
  recentInvoices: {
    id: string;
    invoiceNumber: string;
    type: string;
    status: string;
    total: number;
  }[];
  reimbursementsByStatus: { status: string; count: number; total: number }[];
}

export interface ProjectDashboard {
  projectsByStatus: { status: string; count: number }[];
  recentProjects: {
    id: string;
    name: string;
    clientName: string | null;
    ptName: string | null;
    status: string;
    contractValue: number | null;
    startDate: string | null;
    endDate: string | null;
    createdAt: string;
    createdBy: { id: string; name: string; email: string };
    _count: { tasks: number; members: number };
  }[];
  tasksByStatus: { status: string; count: number }[];
  upcomingDeadlines: { id: string; title: string; deadline: string; projectName: string }[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  type: "project" | "task";
  status: string;
  projectId?: string;
}

export function useDashboardSummary() {
  return useQuery<DashboardSummary>({
    queryKey: ["dashboard", "summary"],
    queryFn: () => api.get("/dashboard/summary").then((r) => r.data),
  });
}

export function useFinanceDashboard() {
  return useQuery<FinanceDashboard>({
    queryKey: ["dashboard", "finance"],
    queryFn: () => api.get("/dashboard/finance").then((r) => r.data),
  });
}

export function useProjectDashboard() {
  return useQuery<ProjectDashboard>({
    queryKey: ["dashboard", "projects"],
    queryFn: () => api.get("/dashboard/projects").then((r) => r.data),
  });
}

export function useCalendarEvents(params?: { start?: string; end?: string }) {
  return useQuery<CalendarEvent[]>({
    queryKey: ["calendar", "events", params],
    queryFn: () => api.get("/calendar/events", { params }).then((r) => r.data),
  });
}
