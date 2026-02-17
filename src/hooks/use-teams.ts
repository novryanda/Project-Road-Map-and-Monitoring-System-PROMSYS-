import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { PaginatedResponse } from "@/types/api";

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  joinedAt: string;
  user: { id: string; name: string; email: string; image: string | null; role: string };
}

export interface Team {
  id: string;
  name: string;
  description: string | null;
  members: TeamMember[];
  _count?: { members: number };
  createdAt: string;
  updatedAt: string;
}

export function useTeams(page = 1, size = 10) {
  return useQuery<PaginatedResponse<Team[]>>({
    queryKey: ["teams", page, size],
    queryFn: () => api.get("/teams", { params: { page, size } }).then((r) => r as any),
  });
}

export function useTeam(id: string) {
  return useQuery<Team>({
    queryKey: ["teams", id],
    queryFn: () => api.get(`/teams/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCreateTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      api.post("/teams", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["teams"] }),
  });
}

export function useUpdateTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; description?: string }) =>
      api.patch(`/teams/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["teams"] }),
  });
}

export function useDeleteTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/teams/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["teams"] }),
  });
}

export function useAddTeamMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) =>
      api.post(`/teams/${teamId}/members`, { userId }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["teams"] }),
  });
}

export function useRemoveTeamMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) =>
      api.delete(`/teams/${teamId}/members/${userId}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["teams"] }),
  });
}
