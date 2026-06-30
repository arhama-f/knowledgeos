"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useApi } from "@/lib/api";
import type { OrganizationOut } from "@/lib/types";

export function useOrganization() {
  const api = useApi();
  return useQuery({
    queryKey: ["organization"],
    queryFn: () => api.get<OrganizationOut>("/organizations/me"),
  });
}

export function useUpdateOrganization() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: { llm_provider?: string; llm_model?: string }) =>
      api.patch<OrganizationOut>("/organizations/me", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization"] });
    },
  });
}

export function useUpdateBranding() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: {
      name?: string;
      logo_url?: string;
      primary_color?: string;
      website_url?: string;
    }) => api.patch<OrganizationOut>("/organizations/branding", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization"] });
    },
  });
}
