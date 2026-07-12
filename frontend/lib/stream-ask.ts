import { API_BASE } from "@/lib/api";
import type { SourceOut } from "@/lib/types";

export interface StreamAskCallbacks {
  onMeta?: (data: { session_id: string; sources: SourceOut[] }) => void;
  onDelta?: (text: string) => void;
  onDone?: () => void;
  onError?: (error: Error) => void;
}

export async function streamAsk(
  question: string,
  sessionId: string | null,
  callbacks: StreamAskCallbacks
): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ question, session_id: sessionId }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail ?? `Request failed: ${response.status}`);
    }

    const data = await response.json();
    callbacks.onMeta?.({ session_id: data.session_id, sources: data.sources ?? [] });
    callbacks.onDelta?.(data.answer ?? "");
    callbacks.onDone?.();
  } catch (error) {
    callbacks.onError?.(error instanceof Error ? error : new Error(String(error)));
  }
}
