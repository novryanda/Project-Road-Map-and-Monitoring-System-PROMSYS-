import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export interface Category {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
  createdAt: string;
  updatedAt: string;
}

export function useCategories(type?: "INCOME" | "EXPENSE") {
  return useQuery<Category[]>({
    queryKey: ["categories", type],
    queryFn: () =>
      api
        .get("/categories", { params: type ? { type } : undefined })
        .then((r) => r.data),
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; type: "INCOME" | "EXPENSE" }) =>
      api.post("/categories", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"], exact: false }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; type?: "INCOME" | "EXPENSE" }) =>
      api.patch(`/categories/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"], exact: false }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/categories/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"], exact: false }),
  });
}
