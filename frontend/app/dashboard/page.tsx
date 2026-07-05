"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { FileText, MessageSquare, Plus, UploadCloud } from "lucide-react";

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
              <MessageSquare className="size-4" /> Ask a question
            </Link>
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Documents ready"
          value={ready}
          loading={documentsLoading}
          icon={FileText}
        />
        <StatCard
          label="Processing"
          value={processing}
          loading={documentsLoading}
          icon={UploadCloud}
        />
        <StatCard
          label="Failed"
          value={failed}
          loading={documentsLoading}
          tone={failed > 0 ? "destructive" : undefined}
          icon={FileText}
        />
      </div>

      {/* Recent conversations */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base font-semibold">Recent conversations</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/ask">View all</Link>
          </Button>
        </CardHeader>
        <CardContent className="pt-0">
          {sessionsLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-3/4" />
            </div>
          ) : sessions && sessions.length > 0 ? (
            <ul className="divide-y">
              {sessions.slice(0, 5).map((session) => (
                <li key={session.id}>
                  <Link
                    href={`/dashboard/ask?session=${session.id}`}
                    className="hover:text-primary flex items-center gap-3 py-3 text-sm transition-colors"
                  >
                    <MessageSquare className="text-muted-foreground size-4 shrink-0" />
                    <span className="truncate">
                      {session.title || "Untitled conversation"}
                    </span>
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

      {/* Recent documents */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base font-semibold">Documents</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/documents">
              <Plus className="size-4" /> Upload
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="pt-0">
          {documentsLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-3/4" />
            </div>
          ) : documents && documents.length > 0 ? (
            <ul className="divide-y">
              {documents.slice(0, 5).map((doc) => (
                <li key={doc.id} className="flex items-center gap-3 py-3 text-sm">
                  <FileText className="text-muted-foreground size-4 shrink-0" />
                  <span className="flex-1 truncate font-medium">{doc.name}</span>
                  <span
                    className={`text-xs capitalize ${
                      doc.status === "ready"
                        ? "text-emerald-600"
                        : doc.status === "failed"
                          ? "text-destructive"
                          : "text-muted-foreground"
                    }`}
                  >
                    {doc.status}
                  </span>
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
  icon: Icon,
}: {
  label: string;
  value: number;
  loading: boolean;
  tone?: "destructive";
  icon: LucideIcon;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <p className="text-muted-foreground text-sm">{label}</p>
          <div className="bg-primary/10 flex size-8 items-center justify-center rounded-lg">
            <Icon className="text-primary size-4" />
          </div>
        </div>
        {loading ? (
          <Skeleton className="mt-3 h-8 w-12" />
        ) : (
          <p
            className={`mt-2 text-3xl font-semibold ${
              tone === "destructive" ? "text-destructive" : ""
            }`}
          >
            {value}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
