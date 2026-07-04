"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { getMe, type AuthUser } from "@/lib/auth-client";

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
