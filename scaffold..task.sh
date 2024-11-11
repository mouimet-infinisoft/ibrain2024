#!/bin/bash

# Set the project base directory
PROJECT_DIR="/home/nitr0gen/ibrain2024/ibrain2024"

# Define the folder structure
mkdir -p "$PROJECT_DIR/lib/features/tasks"

# Create lib/features/tasks/types.ts
cat << 'EOF' > "$PROJECT_DIR/lib/features/tasks/types.ts"
export type TaskType = 'REGULAR' | 'STREAMING';

export interface Task {
  id: string;
  user_id: string;
  type: TaskType;
  status: 'completed' | 'failed' | 'delayed' | 'active' | 'waiting' | 'waiting-children' | 'unknown';
  payload: Record<string, any>;
  result?: Record<string, any>;
  error?: string;
  created_at: string;
  updated_at: string;
}
EOF

# Create lib/features/tasks/events.ts
cat << 'EOF' > "$PROJECT_DIR/lib/features/tasks/events.ts"
import { Redis } from 'ioredis';

export const publishEvent = (redis: Redis) =>
  async (event: any): Promise<void> => {
    await redis.publish('tasks', JSON.stringify(event));
  };

export const subscribeToEvents = (redis: Redis) =>
  (handler: (event: any) => void): (() => void) => {
    const subscriber = redis.duplicate();

    subscriber.subscribe('tasks');
    subscriber.on('message', (_, message) => {
      handler(JSON.parse(message));
    });

    return () => {
      subscriber.unsubscribe();
      subscriber.quit();
    };
  };
EOF

# Create lib/features/tasks/storage.ts
cat << 'EOF' > "$PROJECT_DIR/lib/features/tasks/storage.ts"
import { SupabaseClient } from '@supabase/supabase-js';
import { Task } from './types';

export const updateTaskState = (supabase: SupabaseClient) =>
  async (taskId: string, updates: Partial<Task>): Promise<void> => {
    await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId);
  };
EOF

# Create lib/features/tasks/queue.ts
cat << 'EOF' > "$PROJECT_DIR/lib/features/tasks/queue.ts"
import { Queue } from 'bullmq';
import { Task } from './types';

export const enqueueTask = (queue: Queue) =>
  async (task: Task): Promise<void> => {
    await queue.add(task.id, task);
  };
EOF

# Create lib/features/tasks/operations.ts
cat << 'EOF' > "$PROJECT_DIR/lib/features/tasks/operations.ts"
import { Redis } from 'ioredis';
import { Queue } from 'bullmq';
import { SupabaseClient } from '@supabase/supabase-js';
import { Task } from './types';
import { enqueueTask } from './queue';

export const createTask = (queue: Queue) =>
  async (taskData: Omit<Task, 'id' | 'status' | 'created_at' | 'updated_at'>): Promise<string> => {
    const task: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      status: 'waiting',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await enqueueTask(queue)(task);

    return task.id;
  };

export const sendMessage = (queue: Queue) =>
  async (message: string): Promise<string> => {
    return createTask(queue)({
      user_id: 'some-user-id',
      type: 'REGULAR',
      payload: {
        action: 'SEND_MESSAGE',
        message
      }
    });
  };
EOF

# Create lib/features/tasks/processors.ts
cat << 'EOF' > "$PROJECT_DIR/lib/features/tasks/processors.ts"
import { Task } from './types';

export const processMessage = async (task: Task): Promise<void> => {
  if (task.payload.action !== 'SEND_MESSAGE') return;

  console.log('Sending message:', task.payload.message);
  await new Promise(resolve => setTimeout(resolve, 1000));
};
EOF

# Create lib/features/tasks/worker.ts
cat << 'EOF' > "$PROJECT_DIR/lib/features/tasks/worker.ts"
import { Worker, QueueEvents } from 'bullmq';
import { Redis } from 'ioredis';
import { SupabaseClient } from '@supabase/supabase-js';
import { Task } from './types';
import { processMessage } from './processors';
import { updateTaskState } from './storage';

export const setupWorker = (
  redis: Redis,
  supabase: SupabaseClient
) => {
  const updateState = updateTaskState(supabase);

  const worker = new Worker('tasks', async job => {
    const task = job.data as Task;

    switch (task.payload.action) {
      case 'SEND_MESSAGE':
        await processMessage(task);
        break;
    }
  });

  const queueEvents = new QueueEvents('tasks', { connection: redis });

  queueEvents.on('completed', async ({ jobId }) => {
    await updateState(jobId, { status: 'completed', updated_at: new Date().toISOString() });
  });

  queueEvents.on('failed', async ({ jobId }) => {
    await updateState(jobId, { status: 'failed', updated_at: new Date().toISOString() });
  });

  queueEvents.on('active', async ({ jobId }) => {
    await updateState(jobId, { status: 'active', updated_at: new Date().toISOString() });
  });

  queueEvents.on('waiting', async ({ jobId }) => {
    await updateState(jobId, { status: 'waiting', updated_at: new Date().toISOString() });
  });

  return { worker, queueEvents };
};

import { Redis } from 'ioredis';
import { Queue } from 'bullmq';
import { createClient } from '@supabase/supabase-js';
import { sendMessage } from './operations';

const redis = new Redis();
const queue = new Queue('tasks', { connection: redis });
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

const messageTask = sendMessage(queue);

await messageTask('Hello, World!');

const { worker, queueEvents } = setupWorker(redis, supabase);

process.on('SIGTERM', () => {
  worker.close();
  queueEvents.close();
});
EOF

echo "All files and folders have been created under $PROJECT_DIR"
