"use client";

import { useQuery } from "@tanstack/react-query";

import { useApi } from "@/lib/api";
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
