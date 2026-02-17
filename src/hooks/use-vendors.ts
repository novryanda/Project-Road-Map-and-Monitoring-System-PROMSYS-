import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { PaginatedResponse } from "@/types/api";
import type { Category } from "./use-categories";

export interface Vendor {
  id: string;
  name: string;
  location: string;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  categoryId: string;
  category: Category;
  createdAt: string;
  updatedAt: string;
}

export function useVendors(page = 1, size = 10) {
  return useQuery<PaginatedResponse<Vendor[]>>({
    queryKey: ["vendors", page, size],
    queryFn: () => api.get("/vendors", { params: { page, size } }).then((r) => r.data),
  });
}

export function useVendor(id: string) {
  return useQuery<Vendor>({
    queryKey: ["vendors", id],
    queryFn: () => api.get(`/vendors/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCreateVendor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Vendor, "id" | "category" | "createdAt" | "updatedAt">) =>
      api.post("/vendors", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vendors"] }),
  });
}

export function useUpdateVendor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<Omit<Vendor, "id" | "category" | "createdAt" | "updatedAt">>) =>
      api.patch(`/vendors/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vendors"] }),
  });
}

export function useDeleteVendor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/vendors/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vendors"] }),
  });
}
