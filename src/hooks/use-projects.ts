import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { PaginatedResponse } from "@/types/api";
import { Task } from "./use-tasks";

// ─── Types ───────────────────────────────────────────────

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: string;
  joinedAt: string;
  user: { id: string; name: string; email: string; image: string | null; role: string };
}

export interface Project {
  id: string;
  name: string;
  clientName: string | null;
  ptName: string | null;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  contractValue: number | null;
  status: "PLANNING" | "ACTIVE" | "ON_HOLD" | "COMPLETED" | "CANCELLED";
  createdById: string;
  createdBy: { id: string; name: string; email: string };
  members?: ProjectMember[];
  _count?: { tasks: number; invoices: number; members: number };
  financialSummary?: {
    totalIncome: number;
    outstandingIncome: number;
    totalExpense: number;
    invoiceExpense: number;
    reimbursementExpense: number;
    netProfit: number;
  };
  createdAt: string;
  updatedAt: string;
}

export type DocumentType = "PROPOSAL" | "TUTORIAL" | "CONTRACT" | "REPORT" | "MINUTES" | "OTHER";

export interface ProjectDocument {
  id: string;
  projectId: string;
  name: string;
  type: DocumentType;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string | null;
  uploadedById: string;
  uploadedBy: { id: string; name: string; email: string; image: string | null };
  createdAt: string;
  updatedAt: string;
}

export interface ProjectActivity {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  activityDate: string;
  createdById: string;
  createdBy: { id: string; name: string; email: string; image: string | null };
  createdAt: string;
  updatedAt: string;
}

export interface ProjectUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
}

export function useProjects(page = 1, size = 10) {
  return useQuery<PaginatedResponse<Project[]>>({
    queryKey: ["projects", page, size],
    queryFn: () =>
      api.get("/projects", { params: { page, size } }).then((r: any) => {
        console.log("[useProjects] API Response:", r);
        return r as any;
      }),
  });
}

export function useProject(id: string) {
  return useQuery<Project>({
    queryKey: ["projects", id],
    queryFn: () => api.get(`/projects/${id}`).then((r: any) => r.data),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      clientName?: string;
      ptName?: string;
      description?: string;
      startDate?: string;
      endDate?: string;
      contractValue?: number;
      status?: Project["status"];
    }) => api.post("/projects", data).then((r: any) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: string;
      name?: string;
      clientName?: string;
      ptName?: string;
      description?: string;
      startDate?: string;
      endDate?: string;
      contractValue?: number;
      status?: Project["status"];
    }) => api.patch(`/projects/${id}`, data).then((r: any) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/projects/${id}`).then((r: any) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}

export function useProjectTasks(projectId: string, page = 1, size = 10) {
  return useQuery<PaginatedResponse<Task[]>>({
    queryKey: ["tasks", "project", projectId, page, size],
    queryFn: () => api.get(`/projects/${projectId}/tasks`, { params: { page, size } }).then((r: any) => r as any),
    enabled: !!projectId,
  });
}

export function useAddProjectMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, userId, role }: { projectId: string; userId: string; role?: string }) =>
      api.post(`/projects/${projectId}/members`, { userId, role }).then((r: any) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}

export function useRemoveProjectMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, userId }: { projectId: string; userId: string }) =>
      api.delete(`/projects/${projectId}/members/${userId}`).then((r: any) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}

// ─── Users (for member picker) ───────────────────────────

export function useProjectUsers(search?: string) {
  return useQuery<ProjectUser[]>({
    queryKey: ["project-users", search],
    queryFn: () =>
      api.get("/projects/users", { params: search ? { search } : undefined }).then((r: any) => r.data),
  });
}

// ─── Project Documents ───────────────────────────────────

export function useProjectDocuments(projectId: string) {
  return useQuery<ProjectDocument[]>({
    queryKey: ["projects", projectId, "documents"],
    queryFn: () => api.get(`/projects/${projectId}/documents`).then((r: any) => r.data),
    enabled: !!projectId,
  });
}

export function useCreateProjectDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectId,
      name,
      type,
      file,
    }: {
      projectId: string;
      name: string;
      type: DocumentType;
      file: File;
    }) => {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("type", type);
      formData.append("file", file);
      return api
        .post(`/projects/${projectId}/documents`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((r: any) => r.data);
    },
    onSuccess: (_data, variables) =>
      qc.invalidateQueries({ queryKey: ["projects", variables.projectId, "documents"] }),
  });
}

export function useDeleteProjectDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, documentId }: { projectId: string; documentId: string }) =>
      api.delete(`/projects/${projectId}/documents/${documentId}`).then((r: any) => r.data),
    onSuccess: (_data, variables) =>
      qc.invalidateQueries({ queryKey: ["projects", variables.projectId, "documents"] }),
  });
}

// ─── Project Activities ──────────────────────────────────

export function useProjectActivities(projectId: string) {
  return useQuery<ProjectActivity[]>({
    queryKey: ["projects", projectId, "activities"],
    queryFn: () => api.get(`/projects/${projectId}/activities`).then((r: any) => r.data),
    enabled: !!projectId,
  });
}

export function useCreateProjectActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectId,
      title,
      description,
      activityDate,
    }: {
      projectId: string;
      title: string;
      description?: string;
      activityDate?: string;
    }) =>
      api
        .post(`/projects/${projectId}/activities`, { title, description, activityDate })
        .then((r: any) => r.data),
    onSuccess: (_data, variables) =>
      qc.invalidateQueries({ queryKey: ["projects", variables.projectId, "activities"] }),
  });
}

export function useUpdateProjectActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectId,
      activityId,
      ...data
    }: {
      projectId: string;
      activityId: string;
      title?: string;
      description?: string;
      activityDate?: string;
    }) =>
      api
        .patch(`/projects/${projectId}/activities/${activityId}`, data)
        .then((r: any) => r.data),
    onSuccess: (_data, variables) =>
      qc.invalidateQueries({ queryKey: ["projects", variables.projectId, "activities"] }),
  });
}

export function useDeleteProjectActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, activityId }: { projectId: string; activityId: string }) =>
      api.delete(`/projects/${projectId}/activities/${activityId}`).then((r: any) => r.data),
    onSuccess: (_data, variables) =>
      qc.invalidateQueries({ queryKey: ["projects", variables.projectId, "activities"] }),
  });
}
