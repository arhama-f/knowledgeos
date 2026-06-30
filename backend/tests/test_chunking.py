from app.services.chunking import chunk_text
from app.services.cleaning import clean_text


def test_clean_text_collapses_whitespace_and_blank_lines():
    raw = "Hello   world\r\n\r\n\r\n\r\nNext paragraph\x00\x07"
    cleaned = clean_text(raw)
    assert "\r" not in cleaned
    assert "\x00" not in cleaned
    assert "\n\n\n" not in cleaned
    assert "Hello world" in cleaned


def test_chunk_text_respects_target_size():
    paragraph = "Sentence one. Sentence two. Sentence three. " * 20
    chunks = chunk_text(paragraph)
    assert len(chunks) > 1
    # Allow some slack since chunking is sentence-boundary-aware, not a hard cutoff.
    assert all(len(c) < 1000 for c in chunks)


def test_chunk_text_drops_fragments_below_min_length():
    chunks = chunk_text("hi")
    assert chunks == []


def test_chunk_text_empty_input():
    assert chunk_text("") == []
