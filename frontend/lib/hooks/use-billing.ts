"use client";

import { useQuery } from "@tanstack/react-query";

import { useApi } from "@/lib/api";
import type { BillingAccountOut } from "@/lib/types";

export function useBilling() {
  const api = useApi();
  return useQuery({
    queryKey: ["billing"],
    queryFn: () => api.get<BillingAccountOut>("/billing/me"),
  });
}
