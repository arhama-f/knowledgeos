"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useApi } from "@/lib/api";
import type { ApiKeyCreateResponse, ApiKeyOut } from "@/lib/types";

export function useApiKeys() {
  const api = useApi();
  return useQuery({
    queryKey: ["api-keys"],
    queryFn: () => api.get<ApiKeyOut[]>("/api-keys"),
  });
}

export function useCreateApiKey() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => api.post<ApiKeyCreateResponse>("/api-keys", { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      toast.success("API key created");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to create API key");
    },
  });
}

export function useRevokeApiKey() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(`/api-keys/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      toast.success("API key revoked");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to revoke API key");
    },
  });
}
