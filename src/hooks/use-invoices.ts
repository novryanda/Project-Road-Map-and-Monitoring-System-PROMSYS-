import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export interface InvoiceAttachment {
  id: string;
  invoiceId: string;
  fileId: string;
  file: { id: string; originalName: string; url: string; size: number };
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  type: "INCOME" | "EXPENSE";
  status: "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED";
  projectId: string;
  vendorId: string | null;
  categoryId: string;
  taxId: string | null;
  subtotal: number;
  taxAmount: number;
  total: number;
  dueDate: string;
  notes: string | null;
  createdById: string;
  project: { id: string; name: string };
  vendor: { id: string; name: string } | null;
  category: { id: string; name: string };
  tax: { id: string; name: string; rate: number } | null;
  createdBy: { id: string; name: string; email: string };
  attachments: InvoiceAttachment[];
  createdAt: string;
  updatedAt: string;
}

export function useInvoices(params?: { type?: string; status?: string; projectId?: string }) {
  return useQuery<Invoice[]>({
    queryKey: ["invoices", params],
    queryFn: () => api.get("/invoices", { params }).then((r) => r.data),
  });
}

export function useInvoice(id: string) {
  return useQuery<Invoice>({
    queryKey: ["invoices", id],
    queryFn: () => api.get(`/invoices/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCreateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      type: Invoice["type"];
      projectId?: string;
      categoryId: string;
      vendorId?: string;
      taxId?: string;
      subtotal: number;
      dueDate: string;
      notes?: string;
    }) => api.post("/invoices", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["invoices"] }),
  });
}

export function useUpdateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<{
      type: Invoice["type"];
      projectId: string;
      categoryId: string;
      vendorId: string;
      taxId: string;
      subtotal: number;
      dueDate: string;
      notes: string;
    }>) => api.patch(`/invoices/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["invoices"] }),
  });
}

export function useDeleteInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/invoices/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["invoices"] }),
  });
}

export function useUpdateInvoiceStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Invoice["status"] }) =>
      api.patch(`/invoices/${id}/status`, { status }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["invoices"] }),
  });
}

export function useUploadInvoiceAttachment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ invoiceId, file }: { invoiceId: string; file: File }) => {
      const formData = new FormData();
      formData.append("file", file);
      return api.post(`/invoices/${invoiceId}/attachments`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }).then((r) => r.data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["invoices"] }),
  });
}
