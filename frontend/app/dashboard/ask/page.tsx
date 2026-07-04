"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { MessageSquare, Plus, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useChatMessages, useChatSessions } from "@/lib/hooks/use-chat";
import { streamAsk } from "@/lib/stream-ask";
import type { SourceOut } from "@/lib/types";
import { cn } from "@/lib/utils";

interface DisplayMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: SourceOut[] | null;
}

export default function AskPage() {
  return (
    <Suspense fallback={null}>
      <AskPageInner />
    </Suspense>
  );
}

function AskPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [sessionId, setSessionId] = useState<string | null>(searchParams.get("session"));
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: sessions } = useChatSessions();
  const { data: historyMessages } = useChatMessages(sessionId);

  useEffect(() => {
    if (sessionId && historyMessages) {
      setMessages(
        historyMessages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          sources: m.sources,
        }))
      );
    }
  }, [sessionId, historyMessages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const question = input.trim();
    if (!question || isStreaming) return;
    setInput("");

    const userMsgId = `local-${Date.now()}-user`;
    const assistantMsgId = `local-${Date.now()}-assistant`;
    setMessages((prev) => [
      ...prev,
      { id: userMsgId, role: "user", content: question },
      { id: assistantMsgId, role: "assistant", content: "" },
    ]);
    setIsStreaming(true);

    await streamAsk(question, sessionId, {
      onMeta: (data) => {
        if (!sessionId) {
          setSessionId(data.session_id);
          router.replace(`/dashboard/ask?session=${data.session_id}`);
        }
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantMsgId ? { ...m, sources: data.sources } : m))
        );
      },
      onDelta: (text) => {
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantMsgId ? { ...m, content: m.content + text } : m))
        );
      },
      onDone: () => {
        setIsStreaming(false);
        queryClient.invalidateQueries({ queryKey: ["chat-sessions"] });
      },
      onError: () => {
        setIsStreaming(false);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId ? { ...m, content: "Sorry, something went wrong." } : m
          )
        );
      },
    });
  };

  const startNewChat = () => {
    setSessionId(null);
    setMessages([]);
    router.replace("/dashboard/ask");
  };

  return (
    <div className="flex h-full">
      <div className="bg-card hidden w-64 shrink-0 flex-col border-r md:flex">
        <div className="border-b p-3">
          <Button variant="outline" className="w-full justify-start" onClick={startNewChat}>
            <Plus className="size-4" /> New conversation
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {sessions?.map((session) => (
            <button
              key={session.id}
              onClick={() => {
                setSessionId(session.id);
                router.replace(`/dashboard/ask?session=${session.id}`);
              }}
              className={cn(
                "flex w-full items-center gap-2 truncate rounded-md px-3 py-2 text-left text-sm",
                sessionId === session.id ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
              )}
            >
              <MessageSquare className="text-muted-foreground size-4 shrink-0" />
              <span className="truncate">{session.title || "Untitled conversation"}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-8">
          <div className="mx-auto max-w-2xl space-y-6">
            {messages.length === 0 && (
              <div className="py-16 text-center">
                <MessageSquare className="text-muted-foreground/40 mx-auto size-8" />
                <p className="mt-3 text-lg font-medium">Ask anything about your company</p>
                <p className="text-muted-foreground text-sm">
                  Answers are grounded in your uploaded documents, with citations.
                </p>
              </div>
            )}
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </div>
        </div>

        <div className="bg-card border-t p-4">
          <div className="mx-auto flex max-w-2xl items-end gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask a question about your company's documents…"
              className="min-h-11 resize-none"
              rows={1}
            />
            <Button onClick={handleSend} disabled={isStreaming || !input.trim()}>
              <Send className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: DisplayMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={cn("flex flex-col gap-2", isUser ? "items-end" : "items-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        )}
      >
        {message.content || (!isUser && <span className="text-muted-foreground">Thinking…</span>)}
      </div>
      {!isUser && message.sources && message.sources.length > 0 && (
        <div className="flex w-full max-w-[85%] flex-wrap gap-1.5">
          {message.sources.map((source, i) => (
            <SourceChip key={`${source.doc_id}-${i}`} index={i + 1} source={source} />
          ))}
        </div>
      )}
    </div>
  );
}

function SourceChip({ index, source }: { index: number; source: SourceOut }) {
  return (
    <a
      href={`/dashboard/documents/${source.doc_id}`}
      className="group bg-card text-muted-foreground hover:border-primary hover:text-primary relative flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors"
      title={source.preview}
    >
      <span className="font-semibold">[{index}]</span>
      <span className="max-w-32 truncate">{source.doc_name}</span>
      {source.page_number && (
        <span className="text-muted-foreground/70">p.{source.page_number}</span>
      )}
      {source.is_ocr && <span className="text-muted-foreground/70">· OCR</span>}
    </a>
  );
}
