import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.ai.registry import get_embedding_provider, get_llm_provider
from app.api.deps import AuthContext, get_auth_context
from app.core.billing import QuotaExceeded, ensure_ai_quota
from app.core.rate_limit import rate_limit
from app.db.session import get_db
from app.models.chat import ChatSession, Message
from app.models.organization import Organization
from app.schemas.chat import AskRequest, ChatMessageOut, ChatSessionOut
from app.services.rag import (
    build_messages,
    build_system_prompt,
    chunks_to_sources,
    load_sources_for_messages,
    persist_citations,
    search_chunks,
)

router = APIRouter(prefix="/ask", tags=["ask"])


@router.post("", dependencies=[Depends(rate_limit(20))])
async def ask(
    body: AskRequest,
    auth: AuthContext = Depends(get_auth_context),
    db: Session = Depends(get_db),
) -> dict:
    try:
        ensure_ai_quota(db, auth.org_id)
    except QuotaExceeded as exc:
        raise HTTPException(status.HTTP_402_PAYMENT_REQUIRED, exc.message) from exc

    org = db.get(Organization, auth.org_id)
    if org is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Organization not found")

    session = _get_or_create_session(db, auth, body.session_id)
    db.add(Message(session_id=session.id, org_id=auth.org_id, role="user", content=body.question))
    db.commit()

    embedding_provider_name = org.resolved_embedding_provider()
    embedding_model = org.resolved_embedding_model()
    embedding_provider = get_embedding_provider(embedding_provider_name)
    query_vector = (await embedding_provider.embed([body.question], embedding_model))[0]
    chunks = search_chunks(
        db, auth.org_id, body.question, query_vector, embedding_provider_name, embedding_model
    )
    sources = chunks_to_sources(chunks)

    system_prompt = build_system_prompt(chunks)
    messages = build_messages(system_prompt, body.question)

    llm_provider_name = org.resolved_llm_provider()
    llm = get_llm_provider(llm_provider_name)
    llm_model = org.resolved_llm_model()

    full_text = ""
    async for delta in llm.stream(messages, llm_model):
        full_text += delta

    assistant_message = Message(
        session_id=session.id,
        org_id=auth.org_id,
        role="assistant",
        content=full_text,
        provider=llm_provider_name,
        model=llm_model,
    )
    db.add(assistant_message)
    db.commit()
    persist_citations(db, assistant_message.id, chunks)

    if not session.title:
        session.title = body.question[:80]
        db.commit()

    return {"session_id": str(session.id), "answer": full_text, "sources": sources}


@router.get("/sessions", response_model=list[ChatSessionOut])
def list_sessions(
    skip: int = Query(default=0, ge=0, le=10000),
    limit: int = Query(default=50, ge=1, le=200),
    auth: AuthContext = Depends(get_auth_context),
    db: Session = Depends(get_db),
) -> list[ChatSession]:
    stmt = (
        select(ChatSession)
        .where(
            ChatSession.org_id == auth.org_id,
            ChatSession.user_id == auth.user_pk,
            ChatSession.deleted_at.is_(None),
        )
        .order_by(ChatSession.created_at.desc())
        .offset(skip)
        .limit(min(limit, 200))
    )
    return list(db.execute(stmt).scalars())


@router.get("/sessions/{session_id}/messages", response_model=list[ChatMessageOut])
def list_messages(
    session_id: uuid.UUID,
    auth: AuthContext = Depends(get_auth_context),
    db: Session = Depends(get_db),
) -> list[ChatMessageOut]:
    session = db.get(ChatSession, session_id)
    if not session or session.org_id != auth.org_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Session not found")
    stmt = (
        select(Message)
        .where(Message.session_id == session_id, Message.deleted_at.is_(None))
        .order_by(Message.created_at)
    )
    messages = list(db.execute(stmt).scalars())
    sources_by_message = load_sources_for_messages(db, [m.id for m in messages])
    return [
        ChatMessageOut(
            id=m.id,
            role=m.role,
            content=m.content,
            sources=sources_by_message.get(m.id),
            created_at=m.created_at,
        )
        for m in messages
    ]


@router.delete("/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_session(
    session_id: uuid.UUID,
    auth: AuthContext = Depends(get_auth_context),
    db: Session = Depends(get_db),
) -> None:
    session = db.get(ChatSession, session_id)
    if not session or session.org_id != auth.org_id or session.user_id != auth.user_pk:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Session not found")
    session.deleted_at = datetime.now(timezone.utc)
    db.commit()


def _get_or_create_session(
    db: Session, auth: AuthContext, session_id: uuid.UUID | None
) -> ChatSession:
    if session_id:
        session = db.get(ChatSession, session_id)
        if session and session.org_id == auth.org_id:
            return session
    session = ChatSession(org_id=auth.org_id, user_id=auth.user_pk)
    db.add(session)
    db.commit()
    db.refresh(session)
    return session
