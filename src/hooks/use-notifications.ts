import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { PaginatedResponse } from "@/types/api";

export interface Notification {
  id: string;
  type: "TASK_ASSIGNED" | "TASK_STATUS_CHANGED" | "INVOICE_CREATED" | "INVOICE_STATUS_CHANGED" | "REIMBURSEMENT_SUBMITTED" | "REIMBURSEMENT_STATUS_CHANGED" | "PROJECT_MEMBER_ADDED" | "GENERAL";
  title: string;
  message: string;
  isRead: boolean;
  userId: string;
  linkUrl: string | null;
  createdAt: string;
}

export function useNotifications(page = 1, size = 20) {
  return useQuery<PaginatedResponse<Notification[]>>({
    queryKey: ["notifications", page, size],
    queryFn: () => api.get("/notifications", { params: { page, size } }).then((r) => r as any),
  });
}

export function useUnreadNotificationCount() {
  return useQuery<{ count: number }>({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => api.get("/notifications/unread-count").then((r) => r.data),
    refetchInterval: 30000,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.patch("/notifications/read-all").then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
