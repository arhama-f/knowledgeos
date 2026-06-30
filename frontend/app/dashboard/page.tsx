"use client";

import Link from "next/link";
import { FileText, MessageSquare, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { useDocuments } from "@/lib/hooks/use-documents";
import { useChatSessions } from "@/lib/hooks/use-chat";

export default function DashboardOverviewPage() {
  const { data: documents, isLoading: documentsLoading } = useDocuments();
  const { data: sessions, isLoading: sessionsLoading } = useChatSessions();

  const ready = documents?.filter((d) => d.status === "ready").length ?? 0;
  const processing =
    documents?.filter((d) => d.status === "pending" || d.status === "processing").length ?? 0;
  const failed = documents?.filter((d) => d.status === "failed").length ?? 0;

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-8">
      <PageHeader
        title="Overview"
        description="Your company's knowledge, indexed and ready to answer."
        action={
          <Button asChild>
            <Link href="/dashboard/ask">
              <MessageSquare /> Ask a question
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Documents ready" value={ready} loading={documentsLoading} />
        <StatCard label="Processing" value={processing} loading={documentsLoading} />
        <StatCard
          label="Failed"
          value={failed}
          loading={documentsLoading}
          tone={failed > 0 ? "destructive" : undefined}
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recent conversations</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/ask">View all</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {sessionsLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : sessions && sessions.length > 0 ? (
            <ul className="divide-y">
              {sessions.slice(0, 5).map((session) => (
                <li key={session.id}>
                  <Link
                    href={`/dashboard/ask?session=${session.id}`}
                    className="hover:text-primary flex items-center gap-3 py-3 text-sm"
                  >
                    <MessageSquare className="text-muted-foreground size-4" />
                    {session.title || "Untitled conversation"}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={MessageSquare}
              title="No conversations yet"
              description="Ask your first question once a document has finished processing."
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Documents</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/documents">
              <Plus /> Upload
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {documentsLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : documents && documents.length > 0 ? (
            <ul className="divide-y">
              {documents.slice(0, 5).map((doc) => (
                <li key={doc.id} className="flex items-center gap-3 py-3 text-sm">
                  <FileText className="text-muted-foreground size-4" />
                  <span className="flex-1 truncate">{doc.name}</span>
                  <span className="text-muted-foreground text-xs capitalize">{doc.status}</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={FileText}
              title="No documents yet"
              description="Upload your first document to start building your knowledge base."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  loading,
  tone,
}: {
  label: string;
  value: number;
  loading: boolean;
  tone?: "destructive";
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-muted-foreground text-sm">{label}</p>
        {loading ? (
          <Skeleton className="mt-2 h-8 w-12" />
        ) : (
          <p
            className={`mt-1 text-3xl font-semibold ${tone === "destructive" ? "text-destructive" : ""}`}
          >
            {value}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
