#!/bin/bash

# Exit on error
set -e

echo "Setting up Task Manager System..."

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "npm is not installed. Please install Node.js and npm first."
    exit 1
fi

# Install required dependencies
echo "Installing dependencies..."
npm install bull redis bull-board prom-client winston @supabase/supabase-js

# Create necessary directories
echo "Creating directories..."
mkdir -p app/protected/task-manager/{components,lib,actions,types}
mkdir -p lib/queue
mkdir -p lib/monitoring

# Create queue management files
echo "Setting up queue management..."
cat > lib/queue/taskQueue.ts << 'EOL'
import Queue from 'bull';
import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

export const taskQueue = new Queue('task-queue', {
  createClient: (type) => {
    switch (type) {
      case 'client':
        return redisClient.duplicate();
      case 'subscriber':
        return redisClient.duplicate();
      case 'bclient':
        return redisClient.duplicate();
      default:
        return redisClient;
    }
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  },
});

export const asyncQueue = new Queue('async-queue', {
  redis: process.env.REDIS_URL || 'redis://localhost:6379',
});
EOL

cat > lib/queue/taskProcessor.ts << 'EOL'
import { Job } from 'bull';
import { supabase } from '@/utils/supabase/client';
import logger from '../monitoring/logger';

export type TaskData = {
  type: string;
  payload: any;
  userId: string;
};

export const taskProcessor = async (job: Job<TaskData>) => {
  try {
    logger.info(`Processing task: ${job.id}`, { type: job.data.type });
    
    await supabase
      .from('tasks')
      .update({ status: 'processing' })
      .eq('id', job.id);

    switch (job.data.type) {
      case 'sendMessage':
        // Implement message sending logic
        break;
      case 'processVoice':
        // Implement voice processing logic
        break;
      default:
        throw new Error(`Unknown task type: ${job.data.type}`);
    }

    await supabase
      .from('tasks')
      .update({ status: 'completed' })
      .eq('id', job.id);
      
    logger.info(`Task completed: ${job.id}`);
  } catch (error) {
    logger.error(`Task failed: ${job.id}`, { error });
    await supabase
      .from('tasks')
      .update({ 
        status: 'failed', 
        error: error.message 
      })
      .eq('id', job.id);
    throw error;
  }
};
EOL

# Create monitoring setup
echo "Setting up monitoring..."
cat > lib/monitoring/logger.ts << 'EOL'
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

export default logger;
EOL

cat > lib/monitoring/metrics.ts << 'EOL'
import { register, collectDefaultMetrics } from 'prom-client';
import { taskQueue, asyncQueue } from '../queue/taskQueue';

collectDefaultMetrics();

const completedJobs = new register.Counter({
  name: 'completed_jobs_total',
  help: 'Total number of completed jobs',
  labelNames: ['queue']
});

const failedJobs = new register.Counter({
  name: 'failed_jobs_total',
  help: 'Total number of failed jobs',
  labelNames: ['queue']
});

[taskQueue, asyncQueue].forEach(queue => {
  queue.on('completed', (job) => {
    completedJobs.inc({ queue: queue.name });
  });

  queue.on('failed', (job) => {
    failedJobs.inc({ queue: queue.name });
  });
});

export const metrics = () => register.metrics();
EOL

# Create Supabase migration
echo "Creating Supabase migration..."
cat > supabase/migrations/$(date +%Y%m%d%H%M%S)_task_manager.sql << 'EOL'
CREATE TYPE task_status AS ENUM (
  'pending',
  'processing',
  'completed',
  'failed'
);

CREATE TABLE tasks (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  type VARCHAR(255) NOT NULL,
  payload JSONB NOT NULL,
  status task_status NOT NULL DEFAULT 'pending',
  result JSONB,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tasks"
  ON tasks
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tasks"
  ON tasks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
EOL

# Create API routes
echo "Creating API routes..."
mkdir -p app/api/tasks
mkdir -p app/api/metrics

cat > app/api/tasks/route.ts << 'EOL'
import { NextRequest, NextResponse } from 'next/server';
import { taskQueue, asyncQueue } from '@/lib/queue/taskQueue';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, payload, isAsync = false } = await req.json();
    const queue = isAsync ? asyncQueue : taskQueue;
    
    const job = await queue.add({
      type,
      payload,
      userId: user.id
    });

    return NextResponse.json({ jobId: job.id });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}
EOL

cat > app/api/metrics/route.ts << 'EOL'
import { NextRequest, NextResponse } from 'next/server';
import { metrics } from '@/lib/monitoring/metrics';
import { register } from 'prom-client';

export async function GET(req: NextRequest) {
  return new NextResponse(await metrics(), {
    headers: {
      'Content-Type': register.contentType
    }
  });
}
EOL

# Create React components
echo "Creating React components..."
cat > app/protected/task-manager/components/TaskList.tsx << 'EOL'
import React from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

export const TaskList = () => {
  const supabase = useSupabaseClient();
  const [tasks, setTasks] = React.useState([]);

  React.useEffect(() => {
    const fetchTasks = async () => {
      const { data } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) setTasks(data);
    };

    const subscription = supabase
      .channel('tasks')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tasks' },
        (payload) => {
          fetchTasks();
        }
      )
      .subscribe();

    fetchTasks();
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Tasks</h2>
      <div className="grid gap-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="p-4 border rounded-lg shadow-sm"
          >
            <div className="flex justify-between items-center">
              <span className="font-medium">{task.type}</span>
              <span className={`px-2 py-1 rounded-full text-sm ${
                task.status === 'completed' ? 'bg-green-100 text-green-800' :
                task.status === 'failed' ? 'bg-red-100 text-red-800' :
                task.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {task.status}
              </span>
            </div>
            {task.error && (
              <p className="mt-2 text-sm text-red-600">{task.error}</p>
            )}
            <p className="mt-2 text-sm text-gray-500">
              Created: {new Date(task.created_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
EOL

# Update environment variables
echo "Updating .env.local..."
if [ ! -f .env.local ]; then
  touch .env.local
fi

# Only add if not already present
grep -q "REDIS_URL" .env.local || echo "REDIS_URL=redis://localhost:6379" >> .env.local

echo "Creating Prometheus configuration..."
mkdir -p prometheus
cat > prometheus/prometheus.yml << 'EOL'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'task-manager'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/api/metrics'
EOL

# Create Grafana dashboards
echo "Creating Grafana dashboards..."
mkdir -p grafana/dashboards
mkdir -p grafana/provisioning/dashboards
mkdir -p grafana/provisioning/datasources

cat > grafana/dashboards/task-metrics.json << 'EOL'
{
  "annotations": {
    "list": []
  },
  "editable": true,
  "fiscalYearStartMonth": 0,
  "graphTooltip": 0,
  "links": [],
  "liveNow": false,
  "panels": [
    {
      "datasource": {
        "type": "prometheus",
        "uid": "prometheus"
      },
      "fieldConfig": {
        "defaults": {
          "color": {
            "mode": "palette-classic"
          },
          "custom": {
            "axisCenteredZero": false,
            "axisColorMode": "text",
            "axisLabel": "",
            "axisPlacement": "auto",
            "barAlignment": 0,
            "drawStyle": "line",
            "fillOpacity": 0,
            "gradientMode": "none",
            "hideFrom": {
              "legend": false,
              "tooltip": false,
              "viz": false
            },
            "lineInterpolation": "linear",
            "lineWidth": 1,
            "pointSize": 5,
            "scaleDistribution": {
              "type": "linear"
            },
            "showPoints": "auto",
            "spanNulls": false,
            "stacking": {
              "group": "A",
              "mode": "none"
            },
            "thresholdsStyle": {
              "mode": "off"
            }
          },
          "mappings": [],
          "thresholds": {
            "mode": "absolute",
            "steps": [
              {
                "color": "green",
                "value": null
              }
            ]
          }
        },
        "overrides": []
      },
      "gridPos": {
        "h": 8,
        "w": 12,
        "x": 0,
        "y": 0
      },
      "id": 1,
      "options": {
        "legend": {
          "calcs": [],
          "displayMode": "list",
          "placement": "bottom",
          "showLegend": true
        },
        "tooltip": {
          "mode": "single",
          "sort": "none"
        }
      },
      "targets": [
        {
          "datasource": {
            "type": "prometheus",
            "uid": "prometheus"
          },
          "editorMode": "code",
          "expr": "rate(completed_jobs_total[5m])",
          "legendFormat": "{{queue}}",
          "range": true,
          "refId": "A"
        }
      ],
      "title": "Task Completion Rate",
      "type": "timeseries"
    }
  ],
  "refresh": "5s",
  "schemaVersion": 38,
  "style": "dark",
  "tags": [],
  "templating": {
    "list": []
  },
  "time": {
    "from": "now-6h",
    "to": "now"
  },
  "timepicker": {},
  "timezone": "",
  "title": "Task Metrics",
  "version": 0,
  "weekStart": ""
}
EOL

cat > grafana/provisioning/dashboards/default.yml << 'EOL'
apiVersion: 1

providers:
  - name: 'Task Manager'
    orgId: 1
    folder: ''
    type: file
    disableDeletion: false
    editable: true
    options:
      path: /var/lib/grafana/dashboards
EOL

cat > grafana/provisioning/datasources/prometheus.yml << 'EOL'
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    orgId: 1
    uid: prometheus
    url: http://prometheus:9090
    version: 1
    editable: false
EOL

# Update Docker Compose with all services
echo "Updating Docker Compose configuration..."
cat > docker-compose.yml << 'EOL'
version: '3.8'

services:
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    networks:
      - task-manager-network

  redis-insight:
    image: redislabs/redisinsight:latest
    ports:
      - "8001:8001"
    volumes:
      - redis-insight-data:/db
    networks:
      - task-manager-network

  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus:/etc/prometheus
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/usr/share/prometheus/console_libraries'
      - '--web.console.templates=/usr/share/prometheus/consoles'
    networks:
      - task-manager-network

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    volumes:
      - ./grafana/provisioning:/etc/grafana/provisioning
      - ./grafana/dashboards:/var/lib/grafana/dashboards
      - grafana_data:/var/lib/grafana
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_USERS_ALLOW_SIGN_UP=false
    depends_on:
      - prometheus
    networks:
      - task-manager-network

networks:
  task-manager-network:
    driver: bridge

volumes:
  redis_data:
  redis-insight-data:
  prometheus_data:
  grafana_data:
EOL

# Add monitoring URLs to .env.local
echo "Updating .env.local with monitoring URLs..."
cat >> .env.local << 'EOL'

# Monitoring URLs
REDIS_INSIGHT_URL=http://localhost:8001
PROMETHEUS_URL=http://localhost:9090
GRAFANA_URL=http://localhost:3001
EOL

echo "Setup complete! Next steps:"
echo "1. Start Redis: docker-compose up -d"
echo "2. Run Supabase migrations: npx supabase migration up"
echo "3. Run Supabase type gen: npx supabase gen types typescript --local > utils/supabase-types.ts"
echo "4. Update your Next.js configuration as needed"
echo "5. Start your application"

echo "Here's how to access the monitoring tools:"
echo "1. Access monitoring tools at:"
echo "   - Redis Insight: http://localhost:8001"
echo "   - Prometheus: http://localhost:9090"
echo "   - Grafana: http://localhost:3001 (admin/admin)"
echo ""
echo "Initial setup steps:"
echo "1. In Redis Insight:"
echo "   - Add Redis database with host: redis, port: 6379"
echo "2. In Grafana:"
echo "   - Login with admin/admin"
echo "   - The Prometheus datasource and dashboard will be automatically provisioned"
echo ""
echo "For production use:"
echo "1. Change the default Grafana password"
echo "2. Set up proper authentication for Redis"
echo "3. Configure appropriate network security"