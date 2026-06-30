from sqlalchemy.orm import Session

from app.models.document import Document, DocumentStatus, DocumentVersion, ProcessingStage


def set_stage(
    db: Session, version: DocumentVersion, document: Document, stage: ProcessingStage
) -> None:
    version.processing_stage = stage.value
    document.processing_stage = stage.value
    db.commit()


def fail(
    db: Session,
    version: DocumentVersion,
    document: Document,
    message: str,
    stage: ProcessingStage | None = None,
) -> None:
    version.status = DocumentStatus.FAILED.value
    version.error_message = message
    version.failed_stage = stage.value if stage else version.processing_stage
    document.status = DocumentStatus.FAILED.value
    document.error_message = message
    document.failed_stage = version.failed_stage
    db.commit()
