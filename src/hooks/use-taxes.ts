import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export interface Tax {
  id: string;
  name: string;
  percentage: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function useTaxes() {
  return useQuery<Tax[]>({
    queryKey: ["taxes"],
    queryFn: () => api.get("/taxes").then((r) => r.data),
  });
}

export function useCreateTax() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; percentage: number; isActive?: boolean }) =>
      api.post("/taxes", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["taxes"], exact: false }),
  });
}

export function useUpdateTax() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; percentage?: number; isActive?: boolean }) =>
      api.patch(`/taxes/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["taxes"], exact: false }),
  });
}

export function useDeleteTax() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/taxes/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["taxes"], exact: false }),
  });
}
