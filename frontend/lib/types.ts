export type DocumentStatus = "pending" | "processing" | "ready" | "failed";

export type ProcessingStage =
  | "ocr"
  | "cleaning"
  | "metadata_extraction"
  | "chunking"
  | "embedding"
  | "keyword_indexing"
  | "hybrid_indexing";

export interface DocumentOut {
  id: string;
  name: string;
  file_type: string;
  size_bytes: number;
  status: DocumentStatus;
  error_message: string | null;
  chunk_count: number;
  processing_stage: ProcessingStage | null;
  failed_stage: ProcessingStage | null;
  retry_count: number;
  page_count: number | null;
  word_count: number | null;
  language: string | null;
  created_at: string;
}

export interface DocumentUploadResponse {
  document: DocumentOut;
  upload_url: string;
  upload_fields: Record<string, string>;
}

export interface ChunkPreview {
  id: string;
  chunk_index: number;
  page_number: number | null;
  content: string;
  is_ocr: boolean;
}

export interface SourceOut {
  doc_id: string;
  doc_name: string;
  chunk_index: number;
  page_number: number | null;
  similarity: number;
  preview: string;
  is_ocr: boolean;
}

export interface ChatMessageOut {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources: SourceOut[] | null;
  created_at: string;
}

export interface ChatSessionOut {
  id: string;
  title: string | null;
  created_at: string;
}

export interface OrganizationOut {
  id: string;
  name: string;
  slug: string;
  plan: string;
  llm_provider: string | null;
  llm_model: string | null;
  embedding_provider: string | null;
  embedding_model: string | null;
  logo_url: string | null;
  primary_color: string | null;
  website_url: string | null;
  created_at: string;
}

export interface ApiKeyOut {
  id: string;
  name: string;
  key_prefix: string;
  last_used_at: string | null;
  revoked_at: string | null;
  created_at: string;
}

export interface ApiKeyCreateResponse {
  api_key: ApiKeyOut;
  secret: string;
}

export interface TeamOut {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  department_id: string | null;
  created_at: string;
}

export interface DepartmentOut {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
}

export interface BillingAccountOut {
  id: string;
  plan: string;
  status: string;
  billing_cycle: string;
  storage_quota_bytes: number | null;
  ai_quota_monthly_questions: number | null;
  storage_used_bytes: number;
  questions_used_this_month: number;
  current_period_start: string | null;
  current_period_end: string | null;
}

export interface TeamMemberOut {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
}

export interface ProjectOut {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  team_id: string | null;
  created_at: string;
}

export interface PermissionOut {
  id: string;
  subject_type: "user" | "team";
  subject_id: string;
  resource_type: "project" | "document";
  resource_id: string;
  role: "viewer" | "editor" | "admin";
  created_at: string;
}

export interface MemberOut {
  user_id: string;
  clerk_user_id: string;
  email: string | null;
  name: string | null;
  avatar_url: string | null;
  role: string;
  joined_at: string;
}

export interface AuditLogOut {
  id: string;
  actor_user_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  metadata_json: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}
