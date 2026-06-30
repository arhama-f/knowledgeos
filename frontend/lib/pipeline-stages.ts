import type { ProcessingStage } from "@/lib/types";

export const PIPELINE_STAGES: { value: ProcessingStage; label: string }[] = [
  { value: "ocr", label: "OCR" },
  { value: "cleaning", label: "Cleaning" },
  { value: "metadata_extraction", label: "Metadata extraction" },
  { value: "chunking", label: "Chunking" },
  { value: "embedding", label: "Embedding" },
  { value: "keyword_indexing", label: "Keyword indexing" },
  { value: "hybrid_indexing", label: "Hybrid search indexing" },
];

export function stageLabel(stage: ProcessingStage | null): string {
  return PIPELINE_STAGES.find((s) => s.value === stage)?.label ?? "";
}

export function stageIndex(stage: ProcessingStage | null): number {
  return PIPELINE_STAGES.findIndex((s) => s.value === stage);
}
