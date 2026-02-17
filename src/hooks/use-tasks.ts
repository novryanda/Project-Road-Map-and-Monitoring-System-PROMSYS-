import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export interface TaskAttachment {
  id: string;
  taskId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  createdAt: string;
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: string;
  user: { id: string; name: string; email: string };
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  assignedToId: string;
  deadline: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "TODO" | "IN_PROGRESS" | "SUBMITTED" | "REVISION" | "DONE";
  createdById: string;
  project: { id: string; name: string };
  assignedTo: { id: string; name: string; email: string };
  createdBy: { id: string; name: string; email: string };
  attachments: TaskAttachment[];
  comments: TaskComment[];
  createdAt: string;
  updatedAt: string;
}

import { PaginatedResponse } from "@/types/api";

export function useTasks(page = 1, size = 10) {
  return useQuery<PaginatedResponse<Task[]>>({
    queryKey: ["tasks", page, size],
    queryFn: () => api.get("/tasks", { params: { page, size } }).then((r) => r.data),
  });
}

export function useProjectTasks(projectId: string, page = 1, size = 10) {
  return useQuery<PaginatedResponse<Task[]>>({
    queryKey: ["tasks", "project", projectId, page, size],
    queryFn: () => api.get(`/projects/${projectId}/tasks`, { params: { page, size } }).then((r) => r.data),
    enabled: !!projectId,
  });
}

export function useTask(id: string) {
  return useQuery<Task>({
    queryKey: ["tasks", id],
    queryFn: () => api.get(`/tasks/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectId,
      ...data
    }: {
      projectId: string;
      title: string;
      description?: string;
      assignedToId: string;
      deadline: string;
      priority?: Task["priority"];
    }) => api.post(`/projects/${projectId}/tasks`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<Omit<Task, "id" | "project" | "assignedTo" | "createdBy" | "attachments" | "comments" | "createdAt" | "updatedAt">>) =>
      api.patch(`/tasks/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/tasks/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useUpdateTaskStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Task["status"] }) =>
      api.patch(`/tasks/${id}/status`, { status }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useAddTaskComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, content }: { taskId: string; content: string }) =>
      api.post(`/tasks/${taskId}/comments`, { content }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useUploadTaskAttachment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, file }: { taskId: string; file: File }) => {
      const formData = new FormData();
      formData.append("file", file);
      return api.post(`/tasks/${taskId}/attachments`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }).then((r) => r.data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}
