"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Download, RotateCcw, ScanText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DocumentStatusBadge } from "@/components/dashboard/document-status-badge";
import { PipelineProgress } from "@/components/dashboard/pipeline-progress";
import {
  useDocument,
  useDocumentChunks,
  useDownloadOriginal,
  useRetryDocument,
} from "@/lib/hooks/use-documents";

export default function DocumentDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: document, isLoading: documentLoading } = useDocument(params.id);
  const { data: chunks, isLoading: chunksLoading } = useDocumentChunks(params.id);
  const downloadOriginal = useDownloadOriginal();
  const retry = useRetryDocument();

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-8">
      <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/documents")}>
        <ArrowLeft className="size-4" /> Back to documents
      </Button>

      <Card>
        <CardHeader>
          {documentLoading || !document ? (
            <Skeleton className="h-7 w-64" />
          ) : (
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">{document.name}</CardTitle>
              <div className="flex items-center gap-2">
                <DocumentStatusBadge status={document.status} stage={document.processing_stage} />
                {document.status === "failed" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => retry.mutate(document.id)}
                    disabled={retry.isPending}
                  >
                    <RotateCcw className="size-4" /> Retry
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadOriginal.mutate(document.id)}
                  disabled={downloadOriginal.isPending}
                >
                  <Download className="size-4" /> Download original
                </Button>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {document?.status === "failed" && document.error_message && (
            <p className="text-destructive text-sm">
              {document.error_message}
              {document.failed_stage && (
                <span className="text-muted-foreground">
                  {" "}
                  (failed during {document.failed_stage.replace("_", " ")})
                </span>
              )}
              {document.retry_count > 0 && (
                <span className="text-muted-foreground"> · retried {document.retry_count}x</span>
              )}
            </p>
          )}
          {document?.status === "processing" && (
            <PipelineProgress stage={document.processing_stage} />
          )}
          {document?.status === "ready" && (
            <div className="text-muted-foreground flex gap-4 text-sm">
              {document.page_count != null && <span>{document.page_count} pages</span>}
              {document.word_count != null && (
                <span>{document.word_count.toLocaleString()} words</span>
              )}
              {document.language && <span className="uppercase">{document.language}</span>}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Indexed chunks {chunks ? `(${chunks.length})` : ""}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {chunksLoading ? (
            <>
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </>
          ) : chunks && chunks.length > 0 ? (
            chunks.map((chunk) => (
              <div key={chunk.id} className="bg-muted/30 rounded-lg border p-4">
                <div className="text-muted-foreground mb-1.5 flex items-center gap-2 text-xs font-medium">
                  <span>
                    Chunk {chunk.chunk_index + 1}
                    {chunk.page_number ? ` · Page ${chunk.page_number}` : ""}
                  </span>
                  {chunk.is_ocr && (
                    <Badge variant="secondary" className="gap-1">
                      <ScanText className="size-3" /> OCR
                    </Badge>
                  )}
                </div>
                <p className="text-sm leading-relaxed">{chunk.content}</p>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground py-6 text-center text-sm">
              No chunks yet — this document hasn&apos;t finished processing.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
