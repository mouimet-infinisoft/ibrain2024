CREATE TABLE conversation_contexts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  input TEXT,
  response TEXT,
  workflow_id UUID,
  context JSONB,
  type TEXT CHECK (type IN ('input', 'response')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);