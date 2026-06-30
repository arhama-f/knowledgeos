import uuid
from dataclasses import dataclass

from sqlalchemy import select, text
from sqlalchemy.orm import Session

from app.ai.base import Message
from app.core.config import get_settings
from app.models.chat import Citation
from app.models.document import Document, DocumentChunk, DocumentVersion
from app.models.embedding import Embedding

settings = get_settings()

RRF_K = 60  # standard reciprocal-rank-fusion constant; dampens the impact of rank 1 vs rank 2


@dataclass
class ChunkResult:
    chunk_id: uuid.UUID
    doc_id: uuid.UUID
    doc_name: str
    content: str
    chunk_index: int
    page_number: int | None
    similarity: float
    is_ocr: bool = False


def search_chunks(
    db: Session,
    org_id: uuid.UUID,
    query_text: str,
    query_vector: list[float],
    provider: str,
    model: str,
    top_k: int | None = None,
) -> list[ChunkResult]:
    """Hybrid retrieval: fuses semantic (vector) and lexical (keyword) search via
    Reciprocal Rank Fusion. Vector search alone misses exact matches embeddings
    handle poorly (product codes, names, numbers); keyword search alone misses
    paraphrases. RRF combines rank positions rather than raw scores, since cosine
    similarity and ts_rank live on incomparable scales."""
    top_k = top_k or settings.retrieval_top_k
    candidate_k = max(top_k * 4, 20)

    vector_results = _vector_search(db, org_id, query_vector, provider, model, candidate_k)
    keyword_results = _keyword_search(db, org_id, query_text, candidate_k)

    rrf_scores: dict[uuid.UUID, float] = {}
    by_id: dict[uuid.UUID, ChunkResult] = {}
    for rank, result in enumerate(vector_results, start=1):
        rrf_scores[result.chunk_id] = rrf_scores.get(result.chunk_id, 0.0) + 1 / (RRF_K + rank)
        by_id[result.chunk_id] = result
    for rank, result in enumerate(keyword_results, start=1):
        rrf_scores[result.chunk_id] = rrf_scores.get(result.chunk_id, 0.0) + 1 / (RRF_K + rank)
        by_id.setdefault(result.chunk_id, result)

    ranked_ids = sorted(rrf_scores, key=lambda cid: rrf_scores[cid], reverse=True)[:top_k]
    return [by_id[chunk_id] for chunk_id in ranked_ids]


def _vector_search(
    db: Session,
    org_id: uuid.UUID,
    query_vector: list[float],
    provider: str,
    model: str,
    top_k: int,
) -> list[ChunkResult]:
    """Cosine similarity search, restricted to embeddings produced by the same
    provider/model as the query (different models live in different vector
    spaces and aren't comparable)."""
    similarity = (1 - Embedding.vector.cosine_distance(query_vector)).label("similarity")
    stmt = (
        select(
            DocumentChunk.id,
            Document.id.label("doc_id"),
            Document.name.label("doc_name"),
            DocumentChunk.content,
            DocumentChunk.chunk_index,
            DocumentChunk.page_number,
            DocumentChunk.is_ocr,
            similarity,
        )
        .select_from(Embedding)
        .join(DocumentChunk, DocumentChunk.id == Embedding.chunk_id)
        .join(DocumentVersion, DocumentVersion.id == DocumentChunk.document_version_id)
        .join(Document, Document.id == DocumentVersion.document_id)
        .where(
            Embedding.org_id == org_id,
            Embedding.provider == provider,
            Embedding.model == model,
            Embedding.deleted_at.is_(None),
            DocumentChunk.deleted_at.is_(None),
            Document.deleted_at.is_(None),
        )
        .order_by(Embedding.vector.cosine_distance(query_vector))
        .limit(top_k)
    )
    rows = db.execute(stmt).all()
    return [
        ChunkResult(
            chunk_id=row.id,
            doc_id=row.doc_id,
            doc_name=row.doc_name,
            content=row.content,
            chunk_index=row.chunk_index,
            page_number=row.page_number,
            similarity=float(row.similarity),
            is_ocr=row.is_ocr,
        )
        for row in rows
    ]


def _keyword_search(
    db: Session, org_id: uuid.UUID, query_text: str, top_k: int
) -> list[ChunkResult]:
    """Lexical search against document_chunks.search_vector (a Postgres GENERATED
    tsvector column, GIN-indexed) — not mapped on the ORM model, queried via raw
    SQL since SQLAlchemy has no first-class generated-column support."""
    if not query_text or not query_text.strip():
        return []
    stmt = text(
        """
        SELECT
            dc.id AS chunk_id,
            d.id AS doc_id,
            d.name AS doc_name,
            dc.content AS content,
            dc.chunk_index AS chunk_index,
            dc.page_number AS page_number,
            dc.is_ocr AS is_ocr,
            ts_rank(dc.search_vector, websearch_to_tsquery('english', :query)) AS rank
        FROM document_chunks dc
        JOIN document_versions dv ON dv.id = dc.document_version_id
        JOIN documents d ON d.id = dv.document_id
        WHERE dc.org_id = :org_id
          AND dc.deleted_at IS NULL
          AND d.deleted_at IS NULL
          AND dc.search_vector @@ websearch_to_tsquery('english', :query)
        ORDER BY rank DESC
        LIMIT :top_k
        """
    )
    rows = db.execute(stmt, {"query": query_text, "org_id": str(org_id), "top_k": top_k}).all()
    return [
        ChunkResult(
            chunk_id=row.chunk_id,
            doc_id=row.doc_id,
            doc_name=row.doc_name,
            content=row.content,
            chunk_index=row.chunk_index,
            page_number=row.page_number,
            similarity=float(row.rank),
            is_ocr=row.is_ocr,
        )
        for row in rows
    ]


def build_system_prompt(chunks: list[ChunkResult]) -> str:
    if not chunks:
        return (
            "You are KnowledgeOS, an internal knowledge assistant for this company. No "
            "relevant company documents were found for this question. Tell the user you "
            "don't have information on this topic in the knowledge base — do not guess."
        )

    context = "\n\n---\n\n".join(
        f"[Source {i + 1}: {c.doc_name}"
        + (f", p.{c.page_number}" if c.page_number else "")
        + f"]\n{c.content}"
        for i, c in enumerate(chunks)
    )

    return (
        "You are KnowledgeOS, an internal knowledge assistant for this company.\n\n"
        "Rules:\n"
        "1. Answer ONLY using the sources below — never invent facts not present in them.\n"
        "2. Cite sources inline using the bracketed numbers, e.g. [Source 1].\n"
        "3. Be concise and direct. If the answer isn't in the sources, say so plainly.\n\n"
        f"COMPANY KNOWLEDGE BASE:\n{context}"
    )


def build_messages(system_prompt: str, question: str) -> list[Message]:
    return [
        Message(role="system", content=system_prompt),
        Message(role="user", content=question),
    ]


def chunks_to_sources(chunks: list[ChunkResult]) -> list[dict]:
    return [
        {
            "doc_id": str(c.doc_id),
            "doc_name": c.doc_name,
            "chunk_index": c.chunk_index,
            "page_number": c.page_number,
            "similarity": round(c.similarity, 4),
            "preview": c.content[:200],
            "is_ocr": c.is_ocr,
        }
        for c in chunks
    ]


def persist_citations(db: Session, message_id: uuid.UUID, chunks: list[ChunkResult]) -> None:
    for rank, chunk in enumerate(chunks, start=1):
        db.add(
            Citation(
                message_id=message_id,
                chunk_id=chunk.chunk_id,
                document_id=chunk.doc_id,
                rank=rank,
                similarity=chunk.similarity,
            )
        )
    db.commit()


def load_sources_for_messages(
    db: Session, message_ids: list[uuid.UUID]
) -> dict[uuid.UUID, list[dict]]:
    """Reassembles the SourceOut-shaped sources list for each message from its
    Citation rows, joining back to chunk content/page and document name."""
    if not message_ids:
        return {}
    stmt = (
        select(
            Citation.message_id,
            Citation.rank,
            Citation.similarity,
            Document.id.label("doc_id"),
            Document.name.label("doc_name"),
            DocumentChunk.chunk_index,
            DocumentChunk.page_number,
            DocumentChunk.content,
            DocumentChunk.is_ocr,
        )
        .join(DocumentChunk, DocumentChunk.id == Citation.chunk_id)
        .join(Document, Document.id == Citation.document_id)
        .where(Citation.message_id.in_(message_ids))
        .order_by(Citation.message_id, Citation.rank)
    )
    result: dict[uuid.UUID, list[dict]] = {}
    for row in db.execute(stmt).all():
        result.setdefault(row.message_id, []).append(
            {
                "doc_id": str(row.doc_id),
                "doc_name": row.doc_name,
                "chunk_index": row.chunk_index,
                "page_number": row.page_number,
                "similarity": round(float(row.similarity), 4),
                "preview": row.content[:200],
                "is_ocr": row.is_ocr,
            }
        )
    return result
