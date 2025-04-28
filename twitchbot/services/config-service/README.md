# Config Service

The Config Service manages platform-specific configurations and settings for the NexusCore platform. It handles settings for both Twitch and Discord integrations, providing a centralized configuration management system.

## Features

- **Platform Settings**
  - Twitch channel configurations
  - Discord server settings
  - Bot behavior settings
  - Integration preferences

- **Configuration Management**
  - Real-time configuration updates
  - Version control for settings
  - Configuration validation
  - Default value management

- **Role Management**
  - Custom role definitions
  - Permission mappings
  - Role hierarchy management
  - Cross-platform role sync

- **Channel Management**
  - Channel categories
  - Permission settings
  - Channel-specific configurations
  - Auto-moderation rules

## API Endpoints

### Twitch Configuration
```
GET    /twitch/:channelId/settings     # Get channel settings
PUT    /twitch/:channelId/settings     # Update channel settings
GET    /twitch/:channelId/rewards      # Get channel rewards
POST   /twitch/:channelId/rewards      # Create channel reward
PUT    /twitch/:channelId/chat         # Update chat settings
GET    /twitch/:channelId/moderation   # Get moderation settings
```

### Discord Configuration
```
GET    /discord/:serverId/settings     # Get server settings
PUT    /discord/:serverId/settings     # Update server settings
GET    /discord/:serverId/roles        # Get server roles
POST   /discord/:serverId/roles        # Create server role
GET    /discord/:serverId/channels     # Get channel categories
POST   /discord/:serverId/channels     # Create channel category
```

### General Configuration
```
GET    /config/templates               # Get configuration templates
POST   /config/templates               # Create configuration template
GET    /config/defaults               # Get default settings
PUT    /config/defaults               # Update default settings
```

## Database Schema

### Channel Settings
```sql
CREATE TABLE channel_settings (
  id UUID PRIMARY KEY,
  channel_id VARCHAR(255),
  platform VARCHAR(50),
  settings JSONB,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Role Configurations
```sql
CREATE TABLE role_configs (
  id UUID PRIMARY KEY,
  server_id VARCHAR(255),
  role_name VARCHAR(255),
  permissions JSONB,
  color VARCHAR(7),
  position INTEGER,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Channel Categories
```sql
CREATE TABLE channel_categories (
  id UUID PRIMARY KEY,
  server_id VARCHAR(255),
  name VARCHAR(255),
  position INTEGER,
  permissions JSONB,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Configuration History
```sql
CREATE TABLE config_history (
  id UUID PRIMARY KEY,
  entity_id UUID,
  entity_type VARCHAR(50),
  change_type VARCHAR(50),
  previous_value JSONB,
  new_value JSONB,
  user_id UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Configuration

### Environment Variables
```env
# Server Configuration
PORT=3002
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/config_db

# Redis (for caching)
REDIS_URL=redis://redis:6379

# Message Queue
RABBITMQ_URL=amqp://rabbitmq:5672

# Logging
LOG_LEVEL=info
LOG_FORMAT=json

# Service Integration
AUTH_SERVICE_URL=http://auth-service:3001
BOT_SERVICE_URL=http://bot-service:3003

# Cache Configuration
CACHE_TTL=300
CACHE_MAX_ITEMS=10000
```

### Default Configuration Templates
```json
{
  "twitch": {
    "chat": {
      "slowMode": false,
      "followerOnly": false,
      "subscriberOnly": false,
      "emoteOnly": false
    },
    "moderation": {
      "autoMod": true,
      "blockLinks": false,
      "wordBlacklist": []
    }
  },
  "discord": {
    "welcome": {
      "enabled": true,
      "channel": "welcome",
      "message": "Welcome {user} to the server!"
    },
    "moderation": {
      "autoMod": true,
      "logChannel": "mod-logs"
    }
  }
}
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
npm run dev  # Runs on port 3002

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

## Configuration Management

### Version Control
- Configuration changes are versioned
- Rollback capability
- Change history tracking
- Audit logging

### Validation
- JSON Schema validation
- Platform-specific validation rules
- Cross-reference checking
- Default value handling

### Caching
- Redis-based caching
- Cache invalidation on updates
- Configurable TTL
- Cache warming strategies

## Event Publishing

### Configuration Updates
```json
{
  "type": "CONFIG_UPDATE",
  "platform": "twitch|discord",
  "entityId": "channel_id|server_id",
  "version": 1,
  "changes": {
    "path": "setting.path",
    "oldValue": "previous_value",
    "newValue": "new_value"
  },
  "userId": "user-uuid",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Role Updates
```json
{
  "type": "ROLE_UPDATE",
  "serverId": "discord_server_id",
  "roleId": "role_id",
  "version": 1,
  "changes": {
    "permissions": ["ADDED_PERM", "REMOVED_PERM"],
    "position": "new_position"
  },
  "userId": "user-uuid",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Error Handling

### Standard Error Response
```json
{
  "error": {
    "code": "CONFIG_ERROR_CODE",
    "message": "Human readable error message",
    "details": {},
    "version": 1,
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

### Common Error Codes
- `INVALID_CONFIG`: Invalid configuration format
- `VALIDATION_ERROR`: Configuration validation failed
- `NOT_FOUND`: Configuration not found
- `PERMISSION_DENIED`: Insufficient permissions
- `CONFLICT`: Configuration conflict
- `VERSION_MISMATCH`: Configuration version mismatch

## Monitoring

### Health Check
- Endpoint: `GET /health`
- Checks:
  - Database connectivity
  - Redis connection
  - Message queue status
  - Service dependencies

### Metrics
- Configuration update frequency
- Cache hit/miss rates
- Validation error rates
- API response times
- Version conflicts
- Rollback frequency

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License. 