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
  getToken: () => Promise<string | null>,
  callbacks: StreamAskCallbacks
): Promise<void> {
  try {
    const token = await getToken();
    const response = await fetch(`${API_BASE}/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ question, session_id: sessionId }),
    });

    if (!response.ok || !response.body) {
      throw new Error(`Request failed: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const frames = buffer.split("\n\n");
      buffer = frames.pop() ?? "";

      for (const frame of frames) {
        const line = frame.trim();
        if (!line.startsWith("data:")) continue;
        const payload = JSON.parse(line.slice(5).trim());
        if (payload.type === "meta") callbacks.onMeta?.(payload);
        else if (payload.type === "delta") callbacks.onDelta?.(payload.text);
        else if (payload.type === "done") callbacks.onDone?.();
      }
    }
  } catch (error) {
    callbacks.onError?.(error instanceof Error ? error : new Error(String(error)));
  }
}
