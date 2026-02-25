import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { PaginatedResponse } from "@/types/api";

export type NotificationType =
  | "TASK_ASSIGNED"
  | "TASK_SUBMITTED"
  | "TASK_APPROVED"
  | "TASK_REVISION"
  | "INVOICE_CREATED"
  | "REIMBURSEMENT_SUBMITTED"
  | "REIMBURSEMENT_APPROVED"
  | "REIMBURSEMENT_REJECTED"
  | "REIMBURSEMENT_PAID"
  | "PROJECT_ASSIGNED";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  userId: string;
  referenceId: string | null;
  referenceType: string | null;
  createdAt: string;
}

export function getNotificationLink(n: Notification): string | null {
  if (!n.referenceId || !n.referenceType) return null;
  switch (n.referenceType) {
    case "PROJECT":
      return `/dashboard/project-management/project?id=${n.referenceId}`;
    case "TASK":
      return `/dashboard/project-management/tasks?taskId=${n.referenceId}`;
    case "REIMBURSEMENT":
      return `/dashboard/invoice/reimburse`;
    default:
      return null;
  }
}

export function useNotifications(page = 1, size = 20) {
  return useQuery<PaginatedResponse<Notification[]>>({
    queryKey: ["notifications", page, size],
    queryFn: () => api.get("/notifications", { params: { page, size } }).then((r: any) => r as any),
  });
}

export function useUnreadNotificationCount() {
  return useQuery<{ count: number }>({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => api.get("/notifications/unread-count").then((r: any) => r.data),
    refetchInterval: 30000,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`).then((r: any) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.patch("/notifications/read-all").then((r: any) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useDeleteReadNotifications() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.delete("/notifications/read").then((r: any) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

