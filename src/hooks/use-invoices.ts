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
  status: "PAID" | "UNPAID" | "DEBT";
  projectId: string | null;
  vendorId: string | null;
  categoryId: string;
  taxId: string | null;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  dueDate: string | null;
  paidAt: string | null;
  notes: string | null;
  createdById: string;
  project: { id: string; name: string } | null;
  vendor: { id: string; name: string; location: string; email: string } | null;
  category: { id: string; name: string };
  tax: { id: string; name: string; percentage: number } | null;
  createdBy: { id: string; name: string; email: string };
  attachments: InvoiceAttachment[];
  createdAt: string;
  updatedAt: string;
}

import { PaginatedResponse } from "@/types/api";

export function useInvoices(params?: { type?: string; status?: string; projectId?: string; page?: number; size?: number }) {
  const queryParams = {
    ...params,
    page: params?.page ?? 1,
    size: params?.size ?? 10,
  };
  return useQuery<PaginatedResponse<Invoice[]>>({
    queryKey: ["invoices", queryParams],
    queryFn: () => api.get("/invoices", { params: queryParams }).then((r: any) => r as any),
  });
}

export function useInvoice(id: string) {
  return useQuery<Invoice>({
    queryKey: ["invoices", id],
    queryFn: () => api.get(`/invoices/${id}`).then((r: any) => r.data),
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
      amount: number;
      dueDate: string;
      notes?: string;
    }) => api.post("/invoices", data).then((r: any) => r.data),
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
      amount: number;
      dueDate: string;
      notes: string;
    }>) => api.patch(`/invoices/${id}`, data).then((r: any) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["invoices"] }),
  });
}

export function useDeleteInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/invoices/${id}`).then((r: any) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["invoices"] }),
  });
}

export function useUpdateInvoiceStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Invoice["status"] }) =>
      api.patch(`/invoices/${id}/status`, { status }).then((r: any) => r.data),
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
      }).then((r: any) => r.data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["invoices"] }),
  });
}

export interface FinanceItem {
  id: string;
  type: "INVOICE" | "REIMBURSEMENT";
  number: string;
  title: string;
  description: string | null;
  amount: number;
  status: string;
  date: string;
  dueDate: string | null;
  vendor: { id: string; name: string } | null;
  submitter?: { id: string; name: string; email: string };
  project: { id: string; name: string } | null;
  category: { id: string; name: string };
  createdBy: { id: string; name: string; email: string };
  attachments: any[];
  isPaid: boolean;
}

export function useFinanceSummary(params?: { page?: number; size?: number; search?: string }) {
  const queryParams = {
    ...params,
    page: params?.page ?? 1,
    size: params?.size ?? 10,
  };
  return useQuery<PaginatedResponse<FinanceItem[]> & { summary: any }>({
    queryKey: ["finance-summary", queryParams],
    queryFn: () => api.get("/invoices/finance-summary", { params: queryParams }).then((r: any) => r as any),
  });
}
