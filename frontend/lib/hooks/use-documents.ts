"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useApi } from "@/lib/api";
import type { ChunkPreview, DocumentOut, DocumentUploadResponse } from "@/lib/types";

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
      const { document, upload_url } = await api.post<DocumentUploadResponse>(
        "/documents/upload-url",
        { filename: file.name, content_type: file.type || "text/plain", size_bytes: file.size }
      );

      const putResponse = await fetch(upload_url, {
        method: "PUT",
        headers: { "Content-Type": file.type || "text/plain" },
        body: file,
      });
      if (!putResponse.ok) throw new Error("Upload to storage failed");

      await api.post(`/documents/${document.id}/process`);
      return document;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
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
  });
}

export function useDownloadOriginal() {
  const api = useApi();

  return useMutation({
    mutationFn: async (documentId: string) => {
      const { url } = await api.get<{ url: string }>(`/documents/${documentId}/download-url`);
      window.open(url, "_blank");
    },
  });
}
