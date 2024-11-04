CREATE TYPE task_status AS ENUM (
  'completed',
  'failed',
  'delayed',
  'active',
  'waiting',
  'waiting-children',
  'unknown'
);

CREATE TABLE tasks (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  type VARCHAR(255) NOT NULL,
  payload JSONB NOT NULL,
  status task_status NOT NULL,
  result JSONB,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);

-- ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Users can view their own tasks"
--   ON tasks
--   FOR SELECT
--   USING (auth.uid() = user_id);

-- CREATE POLICY "Users can create their own tasks"
--   ON tasks
--   FOR INSERT
--   WITH CHECK (auth.uid() = user_id);
