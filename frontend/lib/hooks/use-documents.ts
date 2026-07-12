"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useApi } from "@/lib/api";
import type { ChunkPreview, DocumentOut } from "@/lib/types";

export function useDocuments() {
  const api = useApi();
  return useQuery({
    queryKey: ["documents"],
    queryFn: () => api.get<DocumentOut[]>("/documents"),
    refetchInterval: (query) =>
      query.state.data?.some((d) => d.status === "pending" || d.status === "processing")
        ? 4000
        : false,
  });
}

export function useDocument(documentId: string) {
  const api = useApi();
  return useQuery({
    queryKey: ["documents", documentId],
    queryFn: () => api.get<DocumentOut>(`/documents/${documentId}`),
    enabled: !!documentId,
  });
}

export function useDocumentChunks(documentId: string) {
  const api = useApi();
  return useQuery({
    queryKey: ["documents", documentId, "chunks"],
    queryFn: () => api.get<ChunkPreview[]>(`/documents/${documentId}/chunks`),
    enabled: !!documentId,
  });
}

export function useUploadDocument() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      if (file.size > 4 * 1024 * 1024) {
        throw new Error(
          `"${file.name}" is ${(file.size / 1024 / 1024).toFixed(1)} MB — files must be under 4 MB.`
        );
      }
      const formData = new FormData();
      formData.append("file", file);
      return api.upload<DocumentOut>("/documents/upload", formData);
    },
    onSuccess: (doc) => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast.success(`"${doc.name}" uploaded and indexed`);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Upload failed");
    },
  });
}

export function useDeleteDocument() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentId: string) => api.delete(`/documents/${documentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Document deleted");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to delete document");
    },
  });
}

export function useRetryDocument() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentId: string) => api.post(`/documents/${documentId}/retry`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Retry failed — please re-upload the document");
    },
  });
}

export function useDownloadOriginal() {
  const api = useApi();

  return useMutation({
    mutationFn: async (documentId: string) => {
      const { url } = await api.get<{ url: string }>(`/documents/${documentId}/download-url`);
      window.open(url, "_blank");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Download failed");
    },
  });
}
