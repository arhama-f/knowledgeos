"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useApi } from "@/lib/api";
import { API_BASE } from "@/lib/api";
import type { ChatMessageOut, ChatSessionOut } from "@/lib/types";

export function useChatSessions() {
  const api = useApi();
  return useQuery({
    queryKey: ["chat-sessions"],
    queryFn: () => api.get<ChatSessionOut[]>("/ask/sessions"),
  });
}

export function useChatMessages(sessionId: string | null) {
  const api = useApi();
  return useQuery({
    queryKey: ["chat-sessions", sessionId, "messages"],
    queryFn: () => api.get<ChatMessageOut[]>(`/ask/sessions/${sessionId}/messages`),
    enabled: !!sessionId,
  });
}

export function useDeleteSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (sessionId: string) => {
      const res = await fetch(`${API_BASE}/ask/sessions/${sessionId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete conversation");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chat-sessions"] });
    },
    onError: () => {
      toast.error("Failed to delete conversation");
    },
  });
}
