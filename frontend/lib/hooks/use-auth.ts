"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getMe, type AuthUser } from "@/lib/auth-client";
import { API_BASE } from "@/lib/api";

export function useCurrentUser() {
  return useQuery<AuthUser | null>({
    queryKey: ["auth", "me"],
    queryFn: getMe,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useInvalidateAuth() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["auth", "me"] });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async ({
      current_password,
      new_password,
    }: {
      current_password: string;
      new_password: string;
    }) => {
      const res = await fetch(`${API_BASE}/auth/change-password`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_password, new_password }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail ?? "Failed to change password");
      }
    },
    onSuccess: () => {
      toast.success("Password changed successfully");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to change password");
    },
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch(`${API_BASE}/auth/me`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail ?? "Failed to update profile");
      }
      return res.json() as Promise<AuthUser>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["auth", "me"] });
      toast.success("Profile updated");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update profile");
    },
  });
}
