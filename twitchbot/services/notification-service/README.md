# Notification Service

The Notification Service handles real-time notifications and alerts across the NexusCore platform. It manages notification delivery, preferences, and integrations for both Twitch and Discord platforms, providing a unified notification system.

## Features

- **Real-time Notifications**
  - Stream alerts
  - Chat notifications
  - Event notifications
  - System alerts

- **Notification Channels**
  - In-app notifications
  - Discord webhooks
  - Email notifications
  - Push notifications
  - WebSocket events

- **Notification Management**
  - User preferences
  - Channel settings
  - Delivery rules
  - Rate limiting
  - Batching options

- **Templates & Customization**
  - Custom templates
  - Dynamic content
  - Localization
  - Rich media support

## API Endpoints

### Notification Management
```
POST   /notifications/send              # Send notification
POST   /notifications/broadcast         # Broadcast to multiple users
GET    /notifications/user/:userId      # Get user notifications
PUT    /notifications/read/:id          # Mark as read
DELETE /notifications/:id               # Delete notification
```

### Preferences
```
GET    /preferences/:userId             # Get user preferences
PUT    /preferences/:userId             # Update preferences
GET    /preferences/channels            # Get channel settings
PUT    /preferences/channels/:id        # Update channel settings
```

### Templates
```
GET    /templates                       # List templates
POST   /templates                       # Create template
PUT    /templates/:id                   # Update template
DELETE /templates/:id                   # Delete template
GET    /templates/preview              # Preview template
```

## Database Schema

### Notifications
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  user_id UUID,
  type VARCHAR(50),
  title VARCHAR(255),
  content TEXT,
  metadata JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  priority INTEGER DEFAULT 0
);

CREATE INDEX idx_notifications_user_created 
ON notifications(user_id, created_at);
```

### Notification Preferences
```sql
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY,
  user_id UUID,
  channel_type VARCHAR(50),
  enabled BOOLEAN DEFAULT true,
  settings JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_notification_preferences_user_channel 
ON notification_preferences(user_id, channel_type);
```

### Notification Templates
```sql
CREATE TABLE notification_templates (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  type VARCHAR(50),
  content TEXT,
  variables JSONB,
  metadata JSONB,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Notification Delivery
```sql
CREATE TABLE notification_delivery (
  id UUID PRIMARY KEY,
  notification_id UUID REFERENCES notifications(id),
  channel_type VARCHAR(50),
  status VARCHAR(50),
  attempts INTEGER DEFAULT 0,
  last_attempt TIMESTAMP,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notification_delivery_status 
ON notification_delivery(status, created_at);
```

## Configuration

### Environment Variables
```env
# Server Configuration
PORT=3005
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/notification_db

# Redis (for caching and rate limiting)
REDIS_URL=redis://redis:6379

# Message Queue
RABBITMQ_URL=amqp://rabbitmq:5672

# Service Integration
AUTH_SERVICE_URL=http://auth-service:3001
CONFIG_SERVICE_URL=http://config-service:3002

# Email Configuration
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password

# Discord Webhook
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...

# Push Notifications
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_SUBJECT=mailto:support@nexuscore.io

# WebSocket
WS_PORT=3006
WS_PATH=/notifications/ws

# Rate Limiting
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX=100

# Notification Settings
NOTIFICATION_TTL=2592000  # 30 days in seconds
BATCH_INTERVAL=300000     # 5 minutes in milliseconds
MAX_BATCH_SIZE=100

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
npm run dev  # Runs on port 3005

# Start WebSocket server
npm run ws   # Runs on port 3006

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

## Notification Processing

### Notification Object
```json
{
  "type": "NOTIFICATION",
  "recipient": {
    "userId": "user-uuid",
    "channels": ["in-app", "email", "discord"]
  },
  "content": {
    "title": "Notification Title",
    "body": "Notification content with {variable}",
    "variables": {
      "variable": "value"
    }
  },
  "metadata": {
    "priority": 1,
    "ttl": 86400,
    "category": "stream_alert"
  }
}
```

### Template Variables
```json
{
  "user": {
    "name": "Username",
    "avatar": "url_to_avatar"
  },
  "stream": {
    "title": "Stream Title",
    "game": "Game Name",
    "viewers": 1000
  },
  "event": {
    "type": "follow|subscribe|raid",
    "data": {}
  }
}
```

## Error Handling

### Standard Error Response
```json
{
  "error": {
    "code": "NOTIFICATION_ERROR_CODE",
    "message": "Human readable error message",
    "details": {},
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

### Common Error Codes
- `DELIVERY_FAILED`: Notification delivery failed
- `INVALID_TEMPLATE`: Template validation failed
- `RATE_LIMITED`: Too many notifications
- `INVALID_RECIPIENT`: Invalid recipient
- `CHANNEL_UNAVAILABLE`: Delivery channel unavailable

## Monitoring

### Health Check
- Endpoint: `GET /health`
- Checks:
  - Database connectivity
  - Redis connection
  - Message queue status
  - Email service
  - Discord webhook
  - WebSocket server

### Metrics
- Notification delivery rate
- Success/failure rates
- Channel performance
- Template usage
- Error rates
- WebSocket connections

## WebSocket Events

### Connection
```javascript
// Connect to WebSocket
const ws = new WebSocket('ws://localhost:3006/notifications/ws');

// Authentication
ws.send(JSON.stringify({
  type: 'AUTH',
  token: 'user-jwt-token'
}));
```

### Event Types
```javascript
// Notification received
{
  type: 'NOTIFICATION',
  data: {
    id: 'notification-uuid',
    title: 'New Notification',
    content: 'Notification content'
  }
}

// Status update
{
  type: 'STATUS',
  data: {
    type: 'read|delivered',
    notificationId: 'notification-uuid'
  }
}
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License. 