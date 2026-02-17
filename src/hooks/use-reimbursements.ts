import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

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
    fileId: string;
    file: { id: string; originalName: string; url: string; size: number };
  }[];
  createdAt: string;
  updatedAt: string;
}

export function useReimbursements(params?: { status?: string; projectId?: string }) {
  return useQuery<Reimbursement[]>({
    queryKey: ["reimbursements", params],
    queryFn: () => api.get("/reimbursements", { params }).then((r) => r.data),
  });
}

export function useReimbursement(id: string) {
  return useQuery<Reimbursement>({
    queryKey: ["reimbursements", id],
    queryFn: () => api.get(`/reimbursements/${id}`).then((r) => r.data),
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
    }) => api.post("/reimbursements", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reimbursements"] }),
  });
}

export function useApproveReimbursement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/reimbursements/${id}/approve`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reimbursements"] }),
  });
}

export function useRejectReimbursement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.patch(`/reimbursements/${id}/reject`, { reason }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reimbursements"] }),
  });
}

export function useMarkReimbursementPaid() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/reimbursements/${id}/pay`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reimbursements"] }),
  });
}

export function useUploadReimbursementAttachment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ reimbursementId, file }: { reimbursementId: string; file: File }) => {
      const formData = new FormData();
      formData.append("file", file);
      return api.post(`/reimbursements/${reimbursementId}/attachments`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }).then((r) => r.data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reimbursements"] }),
  });
}
