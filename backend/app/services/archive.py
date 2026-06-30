import io
import zipfile
from dataclasses import dataclass
from pathlib import Path

from app.core.file_types import is_archive, is_supported

MAX_MEMBERS = 50
MAX_MEMBER_BYTES = 50 * 1024 * 1024  # 50MB uncompressed, per file
MAX_TOTAL_UNCOMPRESSED_BYTES = 500 * 1024 * 1024  # zip-bomb guard
IGNORED_PREFIXES = ("__MACOSX/", ".")


@dataclass
class ArchiveMember:
    filename: str
    content: bytes


def extract_archive_members(content: bytes) -> list[ArchiveMember]:
    """Expands a ZIP in memory with basic zip-bomb/path-traversal safety limits.
    Skips directories, hidden/system files, nested archives, and unsupported
    file types — callers should report how many were skipped."""
    members: list[ArchiveMember] = []
    total_uncompressed = 0

    with zipfile.ZipFile(io.BytesIO(content)) as zf:
        for info in zf.infolist():
            if len(members) >= MAX_MEMBERS:
                break
            if info.is_dir():
                continue

            name = Path(info.filename).name  # strip any directory path — no traversal risk
            if not name or name.startswith(IGNORED_PREFIXES):
                continue
            if is_archive(name) or not is_supported(name):
                continue
            if info.file_size > MAX_MEMBER_BYTES:
                continue
            total_uncompressed += info.file_size
            if total_uncompressed > MAX_TOTAL_UNCOMPRESSED_BYTES:
                break

            members.append(ArchiveMember(filename=name, content=zf.read(info)))

    return members
