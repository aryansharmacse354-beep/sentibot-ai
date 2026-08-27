-- Enable pgvector extension for RAG FAQ search
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Sessions Table
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'escalated', 'closed')),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 2. Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'bot', 'system')),
    content TEXT NOT NULL,
    sentiment TEXT DEFAULT 'neutral',
    confidence NUMERIC(4,3) DEFAULT 0.900,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Escalations Table
CREATE TABLE IF NOT EXISTS public.escalations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
    user_email TEXT,
    customer_anger_level NUMERIC(4,3) NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. FAQs Vector Table
CREATE TABLE IF NOT EXISTS public.faqs (
    id BIGSERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    embedding VECTOR(1536)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escalations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read/write for frontend demo
CREATE POLICY "Allow public read/write on sessions" ON public.sessions FOR ALL USING (true);
CREATE POLICY "Allow public read/write on messages" ON public.messages FOR ALL USING (true);
CREATE POLICY "Allow public read/write on escalations" ON public.escalations FOR ALL USING (true);
CREATE POLICY "Allow public read on faqs" ON public.faqs FOR SELECT USING (true);

-- Create RAG Vector match function
CREATE OR REPLACE FUNCTION match_faqs (
  query_text TEXT,
  match_threshold FLOAT,
  match_count INT
)
RETURNS TABLE (
  id BIGINT,
  question TEXT,
  answer TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    faqs.id,
    faqs.question,
    faqs.answer,
    1 - (faqs.embedding <=> (SELECT embedding FROM faqs LIMIT 1)) AS similarity
  FROM faqs
  WHERE 1 - (faqs.embedding <=> (SELECT embedding FROM faqs LIMIT 1)) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;
