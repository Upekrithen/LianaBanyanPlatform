ALTER TABLE compiled_documents
  ADD COLUMN IF NOT EXISTS content_size_bytes INTEGER,
  ADD COLUMN IF NOT EXISTS is_lode BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_compiled_documents_is_lode ON compiled_documents (is_lode);

CREATE OR REPLACE FUNCTION public.append_compiled_document_chunk(
  p_slug TEXT,
  p_chunk_content TEXT,
  p_chunk_bytes INTEGER,
  p_mark_lode BOOLEAN DEFAULT true
)
RETURNS TABLE(id UUID, slug TEXT, content_size_bytes INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE compiled_documents
  SET
    compiled_markdown = COALESCE(compiled_markdown, '') || COALESCE(p_chunk_content, ''),
    content_size_bytes = COALESCE(content_size_bytes, 0) + COALESCE(p_chunk_bytes, 0),
    is_lode = CASE WHEN p_mark_lode THEN true ELSE is_lode END,
    updated_at = now()
  WHERE compiled_documents.slug = p_slug
  RETURNING compiled_documents.id, compiled_documents.slug, compiled_documents.content_size_bytes
  INTO id, slug, content_size_bytes;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'compiled_documents row not found for slug %', p_slug
      USING ERRCODE = 'P0002';
  END IF;

  RETURN NEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION public.append_compiled_document_chunk(TEXT, TEXT, INTEGER, BOOLEAN)
  TO service_role, authenticated, anon;
