-- First, backup existing tasks
-- Drop the existing tasks table (which depends on the enum)
DROP TABLE IF EXISTS tasks;

-- Now we can safely drop and recreate the enums
DROP TYPE IF EXISTS task_type;
CREATE TYPE task_type AS ENUM (
  'REGULAR',
  'REALTIME',
  'BACKGROUND'
);

DROP TYPE IF EXISTS task_status;
CREATE TYPE task_status AS ENUM (
  'completed',
  'failed',
  'delayed',
  'active',
  'waiting',
  'waiting-children',
  'unknown'
);

-- Create enhanced tasks table
CREATE TABLE tasks (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  job_id text NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  type task_type NOT NULL,
  action text NOT NULL,
  payload JSONB NOT NULL,
  status task_status NOT NULL DEFAULT 'waiting',
  result JSONB,
  error TEXT,
  parent_task_id uuid REFERENCES tasks(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_type ON tasks(type);
CREATE INDEX idx_tasks_parent ON tasks(parent_task_id);

-- Enable RLS and realtime
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
