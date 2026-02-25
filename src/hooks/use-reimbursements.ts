import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { PaginatedResponse } from "@/types/api";

export interface Reimbursement {
  id: string;
  title: string;
  description: string | null;
  amount: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "PAID";
  rejectionReason: string | null;
  projectId: string;
  categoryId: string;
  submittedById: string;
  approvedById: string | null;
  project: { id: string; name: string };
  category: { id: string; name: string };
  submittedBy: { id: string; name: string; email: string };
  approvedBy: { id: string; name: string; email: string } | null;
  attachments: {
    id: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    type: "SUBMISSION" | "PAYMENT";
  }[];
  createdAt: string;
  updatedAt: string;
}

export function useReimbursements(params?: { status?: string; projectId?: string; page?: number; size?: number; view?: 'me' | 'all' }) {
  const queryParams = {
    ...params,
    page: params?.page ?? 1,
    size: params?.size ?? 10,
  };
  return useQuery<PaginatedResponse<Reimbursement[]>>({
    queryKey: ["reimbursements", queryParams],
    queryFn: () => api.get("/reimbursements", { params: queryParams }).then((r: any) => r as any),
  });
}

export function useReimbursement(id: string) {
  return useQuery<Reimbursement>({
    queryKey: ["reimbursements", id],
    queryFn: () => api.get(`/reimbursements/${id}`).then((r: any) => r.data),
    enabled: !!id,
  });
}

export function useCreateReimbursement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      title: string;
      description?: string;
      amount: number;
      projectId?: string;
      categoryId: string;
    }) => api.post("/reimbursements", data).then((r: any) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reimbursements"] }),
  });
}

export function useApproveReimbursement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/reimbursements/${id}/approve`).then((r: any) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reimbursements"] }),
  });
}

export function useRejectReimbursement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.patch(`/reimbursements/${id}/reject`, { reason }).then((r: any) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reimbursements"] }),
  });
}

export function useMarkReimbursementPaid() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/reimbursements/${id}/pay`).then((r: any) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reimbursements"] }),
  });
}

export function useUploadReimbursementAttachment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ reimbursementId, file, type }: { reimbursementId: string; file: File; type?: 'SUBMISSION' | 'PAYMENT' }) => {
      const formData = new FormData();
      formData.append("file", file);
      return api.post(`/reimbursements/${reimbursementId}/attachments`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        params: { type },
      }).then((r: any) => r.data);
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["reimbursements"] });
      qc.invalidateQueries({ queryKey: ["reimbursements", variables.reimbursementId] });
    },
  });
}
