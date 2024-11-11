CREATE TYPE task_status AS ENUM (
  'completed',
  'failed',
  'delayed',
  'active',
  'waiting',
  'waiting-children',
  'unknown'
);

CREATE TYPE task_type AS ENUM (
  'REGULAR',
  'REALTIME'
);

CREATE TABLE tasks (
  id uuid default uuid_generate_v4() primary key,
  user_id UUID REFERENCES auth.users(id),
  job_id text not null,
  type task_type NOT NULL,
  action text not null,
  payload JSONB NOT NULL,
  status task_status NOT NULL,
  result JSONB,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);

-- Realtime enable
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;

-- ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Users can view their own tasks"
--   ON tasks
--   FOR SELECT
--   USING (auth.uid() = user_id);

-- CREATE POLICY "Users can create their own tasks"
--   ON tasks
--   FOR INSERT
--   WITH CHECK (auth.uid() = user_id);
