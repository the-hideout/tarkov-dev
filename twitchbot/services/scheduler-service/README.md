# Scheduler Service

The Scheduler Service manages scheduled tasks and recurring events for the NexusCore platform. It provides a reliable scheduling system for both Twitch and Discord platforms, handling automated actions, reminders, and periodic tasks.

## Features

- **Task Scheduling**
  - One-time tasks
  - Recurring tasks
  - Cron-based scheduling
  - Task prioritization
  - Timezone support

- **Task Management**
  - Task creation/modification
  - Task cancellation
  - Task history
  - Failure handling
  - Retry mechanisms

- **Task Types**
  - Stream reminders
  - Automated messages
  - Channel updates
  - Moderation actions
  - Data aggregation

- **Execution Control**
  - Concurrent execution limits
  - Rate limiting
  - Resource management
  - Task dependencies
  - Execution windows

## API Endpoints

### Task Management
```
POST   /tasks                  # Create task
GET    /tasks                  # List tasks
GET    /tasks/:id             # Get task details
PUT    /tasks/:id             # Update task
DELETE /tasks/:id             # Delete task
POST   /tasks/:id/execute     # Execute task now
POST   /tasks/:id/cancel      # Cancel task
```

### Schedule Management
```
GET    /schedules             # List schedules
POST   /schedules             # Create schedule
PUT    /schedules/:id         # Update schedule
DELETE /schedules/:id         # Delete schedule
GET    /schedules/:id/tasks   # List schedule tasks
```

### Task History
```
GET    /history               # Get execution history
GET    /history/:taskId       # Get task history
GET    /history/failed        # Get failed executions
POST   /history/:id/retry     # Retry failed task
```

## Database Schema

### Tasks
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  type VARCHAR(50),
  schedule_type VARCHAR(50),
  cron_expression VARCHAR(100),
  timezone VARCHAR(50),
  data JSONB,
  enabled BOOLEAN DEFAULT true,
  next_run TIMESTAMP,
  last_run TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tasks_next_run ON tasks(next_run) 
WHERE enabled = true;
```

### Task History
```sql
CREATE TABLE task_history (
  id UUID PRIMARY KEY,
  task_id UUID REFERENCES tasks(id),
  status VARCHAR(50),
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  duration INTEGER,
  error TEXT,
  result JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_task_history_task_id_start_time 
ON task_history(task_id, start_time);
```

### Task Dependencies
```sql
CREATE TABLE task_dependencies (
  id UUID PRIMARY KEY,
  task_id UUID REFERENCES tasks(id),
  depends_on UUID REFERENCES tasks(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(task_id, depends_on)
);
```

### Task Locks
```sql
CREATE TABLE task_locks (
  id UUID PRIMARY KEY,
  task_id UUID REFERENCES tasks(id),
  lock_until TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_task_locks_lock_until 
ON task_locks(lock_until);
```

## Configuration

### Environment Variables
```env
# Server Configuration
PORT=3006
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/scheduler_db

# Redis (for locks and rate limiting)
REDIS_URL=redis://redis:6379

# Message Queue
RABBITMQ_URL=amqp://rabbitmq:5672

# Service Integration
AUTH_SERVICE_URL=http://auth-service:3001
CONFIG_SERVICE_URL=http://config-service:3002
NOTIFICATION_SERVICE_URL=http://notification-service:3005

# Scheduler Configuration
MAX_CONCURRENT_TASKS=10
DEFAULT_TIMEOUT=300000
RETRY_ATTEMPTS=3
RETRY_DELAY=60000
MAINTENANCE_INTERVAL=60000

# Task Queue Configuration
QUEUE_PREFIX=scheduler
MAX_QUEUE_SIZE=1000
QUEUE_CONCURRENCY=5

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
```

## Development

### Prerequisites
- Node.js v16 or higher
- PostgreSQL 14+
- Redis 6+
- RabbitMQ 3.9+
- npm or yarn

### Installation
```bash
# Install dependencies
npm install

# Run database migrations
npm run migrate

# Start development server
npm run dev  # Runs on port 3006

# Build for production
npm run build

# Start production server
npm start
```

### Testing
```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run all tests with coverage
npm run test:coverage
```

## Task Definition

### Task Object
```json
{
  "name": "Stream Reminder",
  "type": "reminder",
  "scheduleType": "cron",
  "cronExpression": "0 0 * * *",
  "timezone": "UTC",
  "data": {
    "channelId": "channel-uuid",
    "message": "Time to start streaming!",
    "notifyVia": ["discord", "email"]
  },
  "retryPolicy": {
    "attempts": 3,
    "delay": 60000,
    "backoff": "exponential"
  }
}
```

### Task Types
```javascript
const TaskTypes = {
  REMINDER: 'reminder',
  MESSAGE: 'message',
  CHANNEL_UPDATE: 'channel_update',
  MODERATION: 'moderation',
  AGGREGATION: 'aggregation',
  CLEANUP: 'cleanup'
};
```

## Error Handling

### Standard Error Response
```json
{
  "error": {
    "code": "SCHEDULER_ERROR_CODE",
    "message": "Human readable error message",
    "details": {},
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

### Common Error Codes
- `INVALID_SCHEDULE`: Invalid schedule definition
- `TASK_LOCKED`: Task is currently locked
- `EXECUTION_FAILED`: Task execution failed
- `DEPENDENCY_FAILED`: Task dependency failed
- `TIMEOUT`: Task execution timeout

## Monitoring

### Health Check
- Endpoint: `GET /health`
- Checks:
  - Database connectivity
  - Redis connection
  - Message queue status
  - Task executor status
  - Service dependencies

### Metrics
- Task execution rate
- Success/failure rates
- Execution duration
- Queue length
- Lock acquisition
- Resource usage

## Task Execution

### Execution Flow
1. Task selection based on next_run
2. Lock acquisition
3. Dependency verification
4. Resource allocation
5. Task execution
6. Result processing
7. History update
8. Next run calculation

### Failure Handling
- Automatic retries with backoff
- Failure notification
- Task state preservation
- Dependency chain handling
- Resource cleanup

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License. 