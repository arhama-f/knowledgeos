"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { FileText, RotateCcw, Trash2, UploadCloud } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DocumentStatusBadge } from "@/components/dashboard/document-status-badge";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import {
  useDeleteDocument,
  useDocuments,
  useRetryDocument,
  useUploadDocument,
} from "@/lib/hooks/use-documents";
import { fileKindLabel } from "@/lib/file-kind";

const ACCEPTED_TYPES =
  ".pdf,.docx,.txt,.md,.markdown,.csv,.xlsx,.pptx,.eml,.zip,.png,.jpg,.jpeg,.webp,.tiff,.bmp";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentsPage() {
  const { data: documents, isLoading } = useDocuments();
  const upload = useUploadDocument();
  const remove = useDeleteDocument();
  const retry = useRetryDocument();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadError(null);
    Array.from(files).forEach((file) => {
      upload.mutate(file, { onError: (err) => setUploadError(err.message) });
    });
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-8">
      <PageHeader
        title="Documents"
        description="PDF, Word, Excel, PowerPoint, CSV, text, images (OCR), email, and ZIP archives of these. Once processed, they're searchable in Ask."
      />

      <Card
        className={`border-2 border-dashed transition-colors ${
          isDragging ? "border-primary bg-accent/40" : "border-input"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
      >
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <UploadCloud className="text-muted-foreground size-8" />
          <div>
            <p className="font-medium">Drag and drop files here</p>
            <p className="text-muted-foreground text-sm">
              or click to browse · PDF, DOCX, XLSX, PPTX, CSV, TXT, MD, images, EML, ZIP
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={upload.isPending}
          >
            {upload.isPending ? "Uploading…" : "Choose files"}
          </Button>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={ACCEPTED_TYPES}
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          {uploadError && <p className="text-destructive text-sm">{uploadError}</p>}
        </CardContent>
      </Card>

      <Card>
        {isLoading ? (
          <CardContent className="space-y-2 p-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        ) : documents && documents.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Chunks</TableHead>
                <TableHead>Size</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <Link
                      href={`/dashboard/documents/${doc.id}`}
                      className="hover:text-primary flex items-center gap-2 font-medium"
                    >
                      <FileText className="text-muted-foreground size-4" />
                      {doc.name}
                    </Link>
                    {doc.status === "failed" && doc.error_message && (
                      <p className="text-destructive mt-1 text-xs">{doc.error_message}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{fileKindLabel(doc.file_type)}</Badge>
                  </TableCell>
                  <TableCell>
                    <DocumentStatusBadge status={doc.status} stage={doc.processing_stage} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">{doc.chunk_count}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatBytes(doc.size_bytes)}
                  </TableCell>
                  <TableCell className="text-right">
                    {doc.status === "failed" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => retry.mutate(doc.id)}
                        disabled={retry.isPending}
                        title="Retry"
                      >
                        <RotateCcw className="size-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => remove.mutate(doc.id)}
                      disabled={remove.isPending}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <CardContent>
            <EmptyState icon={FileText} title="No documents uploaded yet." />
          </CardContent>
        )}
      </Card>
    </div>
  );
}
