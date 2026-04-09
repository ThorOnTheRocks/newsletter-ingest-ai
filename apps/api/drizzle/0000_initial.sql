CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS documents (
  id varchar(191) PRIMARY KEY,
  title text NOT NULL,
  source text,
  original_content text NOT NULL,
  cleaned_content text NOT NULL,
  created_at timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS documents_created_at_idx
  ON documents (created_at);

CREATE TABLE IF NOT EXISTS document_summaries (
  document_id varchar(191) PRIMARY KEY REFERENCES documents(id) ON DELETE CASCADE,
  tl_dr text NOT NULL,
  main_points jsonb NOT NULL,
  important_terms jsonb NOT NULL,
  insights jsonb NOT NULL,
  actions jsonb NOT NULL,
  follow_up_questions jsonb NOT NULL
);

CREATE TABLE IF NOT EXISTS document_chunks (
  id varchar(191) PRIMARY KEY,
  document_id varchar(191) NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  chunk_index integer NOT NULL,
  text text NOT NULL,
  embedding vector(1536)
);

CREATE INDEX IF NOT EXISTS document_chunks_document_id_chunk_index_idx
  ON document_chunks (document_id, chunk_index);
