"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export type User = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  banned: boolean | null;
  banReason: string | null;
  banExpires: string | null;
  createdAt: string;
  updatedAt: string;
};

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const result = await authClient.admin.listUsers({
        query: {
          limit: 100,
          sortBy: "createdAt",
          sortDirection: "desc",
        },
      });

      if (result.error) {
        throw new Error(result.error.message || "Failed to fetch users");
      }

      return (result.data?.users ?? []) as User[];
    },
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      email: string;
      password: string;
      role: string;
    }) => {
      const result = await authClient.admin.createUser({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role as "admin" | "user",
      });

      if (result.error) {
        throw new Error(result.error.message || "Failed to create user");
      }

      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useSetUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { userId: string; role: string }) => {
      const result = await authClient.admin.setRole({
        userId: data.userId,
        role: data.role as "admin" | "user",
      });

      if (result.error) {
        throw new Error(result.error.message || "Failed to update role");
      }

      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User role updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useBanUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { userId: string; banReason?: string }) => {
      const result = await authClient.admin.banUser({
        userId: data.userId,
        banReason: data.banReason,
      });

      if (result.error) {
        throw new Error(result.error.message || "Failed to ban user");
      }

      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User banned successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUnbanUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { userId: string }) => {
      const result = await authClient.admin.unbanUser({
        userId: data.userId,
      });

      if (result.error) {
        throw new Error(result.error.message || "Failed to unban user");
      }

      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User unbanned successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useRemoveUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { userId: string }) => {
      const result = await authClient.admin.removeUser({
        userId: data.userId,
      });

      if (result.error) {
        throw new Error(result.error.message || "Failed to delete user");
      }

      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
