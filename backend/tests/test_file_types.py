from app.core.file_types import canonical_kind, is_archive, is_supported, label_for


def test_canonical_kind_known_extensions():
    assert canonical_kind("report.pdf") == "pdf"
    assert canonical_kind("Notes.DOCX") == "docx"
    assert canonical_kind("data.csv") == "csv"
    assert canonical_kind("archive.zip") == "zip"
    assert canonical_kind("photo.JPG") == "image"


def test_canonical_kind_unknown_extension():
    assert canonical_kind("video.mp4") is None
    assert canonical_kind("legacy.doc") is None  # legacy binary Office formats unsupported


def test_is_supported():
    assert is_supported("file.pdf") is True
    assert is_supported("file.exe") is False


def test_is_archive():
    assert is_archive("bundle.zip") is True
    assert is_archive("report.pdf") is False


def test_label_for():
    assert label_for("report.pdf") == "PDF"
    assert label_for("unknown.xyz") == "File"
