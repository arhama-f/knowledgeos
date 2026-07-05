"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { FileText, MessageSquare, Plus, Send, Sparkles } from "lucide-react";

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

const SUGGESTED_QUESTIONS = [
  "What is our vacation policy for remote employees?",
  "Summarise the onboarding process for new hires",
  "What are our data retention requirements?",
];

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

  const send = async (question: string) => {
    if (!question.trim() || isStreaming) return;
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

  const handleSend = () => send(input.trim());

  const startNewChat = () => {
    setSessionId(null);
    setMessages([]);
    router.replace("/dashboard/ask");
  };

  return (
    <div className="flex h-full">
      {/* Conversation history sidebar */}
      <div className="bg-secondary/40 hidden w-60 shrink-0 flex-col border-r md:flex">
        <div className="border-b p-3">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 bg-background text-sm"
            onClick={startNewChat}
          >
            <Plus className="size-3.5" />
            New conversation
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {sessions && sessions.length > 0 ? (
            <div className="space-y-0.5">
              {sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => {
                    setSessionId(session.id);
                    router.replace(`/dashboard/ask?session=${session.id}`);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 truncate rounded-md px-3 py-2 text-left text-sm transition-colors",
                    sessionId === session.id
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                  )}
                >
                  <MessageSquare className="size-3.5 shrink-0" />
                  <span className="truncate">{session.title || "Untitled conversation"}</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground px-3 py-4 text-xs">
              Your conversations will appear here.
            </p>
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex flex-1 flex-col">
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-2xl space-y-6 px-6 py-8">
            {messages.length === 0 ? (
              <EmptyChat onSuggestion={send} />
            ) : (
              messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))
            )}
          </div>
        </div>

        {/* Input bar */}
        <div className="border-t bg-background p-4">
          <div className="mx-auto max-w-2xl">
            <div className="flex items-end gap-2 rounded-xl border bg-card shadow-sm focus-within:ring-2 focus-within:ring-ring px-4 py-3">
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
                className="min-h-0 flex-1 resize-none border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 text-sm"
                rows={1}
              />
              <Button
                size="icon"
                className="size-8 shrink-0 rounded-lg"
                onClick={handleSend}
                disabled={isStreaming || !input.trim()}
              >
                <Send className="size-3.5" />
              </Button>
            </div>
            <p className="text-muted-foreground mt-1.5 text-center text-[11px]">
              Enter to send · Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyChat({ onSuggestion }: { onSuggestion: (q: string) => void }) {
  return (
    <div className="flex flex-col items-center py-20 text-center">
      <div className="bg-primary/10 mb-4 flex size-12 items-center justify-center rounded-full">
        <Sparkles className="text-primary size-5" />
      </div>
      <h3 className="text-lg font-semibold">Ask anything about your company</h3>
      <p className="text-muted-foreground mt-1 max-w-sm text-sm">
        Answers are grounded in your uploaded documents with clickable source citations.
      </p>
      <div className="mt-6 flex flex-col gap-2 w-full max-w-md">
        {SUGGESTED_QUESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => onSuggestion(q)}
            className="hover:border-primary/50 hover:bg-accent rounded-xl border bg-card px-4 py-3 text-sm text-left transition-colors"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: DisplayMessage }) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="bg-primary text-primary-foreground max-w-[80%] rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      <div className="bg-primary/10 mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full">
        <Sparkles className="text-primary size-3.5" />
      </div>
      <div className="flex-1 min-w-0 space-y-2">
        <div className="bg-card border rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap">
          {message.content || (
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <span className="flex gap-0.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="bg-muted-foreground/40 size-1.5 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </span>
              Thinking…
            </span>
          )}
        </div>
        {message.sources && message.sources.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {message.sources.map((source, i) => (
              <SourceChip key={`${source.doc_id}-${i}`} index={i + 1} source={source} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SourceChip({ index, source }: { index: number; source: SourceOut }) {
  return (
    <a
      href={`/dashboard/documents/${source.doc_id}`}
      className="hover:border-primary/50 hover:text-primary group flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground transition-colors"
      title={source.preview}
    >
      <FileText className="size-3 shrink-0" />
      <span className="font-semibold">[{index}]</span>
      <span className="max-w-36 truncate">{source.doc_name}</span>
      {source.page_number && <span>· p.{source.page_number}</span>}
    </a>
  );
}
