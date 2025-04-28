# Bot Service

The Bot Service is the core component of NexusCore that handles bot functionalities for both Twitch and Discord platforms. It manages command processing, event handling, and platform-specific features while providing a unified interface for bot management.

## Features

- **Command Management**
  - Custom commands
  - Dynamic responses
  - Permission levels
  - Cooldowns
  - Aliases

- **Event Handling**
  - Twitch events
    - Stream start/end
    - Follows/Subscriptions
    - Raids/Hosts
    - Channel point redemptions
    - Chat messages
  
  - Discord events
    - Message events
    - Member events
    - Voice events
    - Reaction events
    - Role updates

- **Platform Integration**
  - Twitch chat interaction
  - Discord message handling
  - Cross-platform sync
  - Platform-specific features
  - OAuth management

- **Bot Features**
  - Auto-moderation
  - Custom responses
  - User tracking
  - Message filtering
  - Spam protection

## API Endpoints

### Command Management
```
POST   /commands                  # Create command
GET    /commands                  # List commands
GET    /commands/:id             # Get command details
PUT    /commands/:id             # Update command
DELETE /commands/:id             # Delete command
POST   /commands/:id/enable      # Enable command
POST   /commands/:id/disable     # Disable command
```

### Event Management
```
GET    /events                   # List recent events
POST   /events/hooks             # Configure webhooks
GET    /events/stats            # Event statistics
PUT    /events/settings         # Update event settings
```

### Bot Control
```
POST   /bot/twitch/connect      # Connect Twitch bot
POST   /bot/discord/connect     # Connect Discord bot
POST   /bot/twitch/disconnect   # Disconnect Twitch bot
POST   /bot/discord/disconnect  # Disconnect Discord bot
GET    /bot/status              # Get bot status
```

## Database Schema

### Commands
```sql
CREATE TABLE commands (
  id UUID PRIMARY KEY,
  name VARCHAR(50),
  platform VARCHAR(20),
  response TEXT,
  enabled BOOLEAN DEFAULT true,
  permission_level INTEGER,
  cooldown INTEGER,
  aliases JSONB,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_commands_name_platform 
ON commands(name, platform);
```

### Event Configurations
```sql
CREATE TABLE event_configurations (
  id UUID PRIMARY KEY,
  platform VARCHAR(20),
  event_type VARCHAR(50),
  enabled BOOLEAN DEFAULT true,
  settings JSONB,
  handlers JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_event_configurations_platform_type 
ON event_configurations(platform, event_type);
```

### Bot States
```sql
CREATE TABLE bot_states (
  id UUID PRIMARY KEY,
  platform VARCHAR(20),
  status VARCHAR(20),
  connection_info JSONB,
  last_connected TIMESTAMP,
  error_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_bot_states_platform 
ON bot_states(platform);
```

### Command History
```sql
CREATE TABLE command_history (
  id UUID PRIMARY KEY,
  command_id UUID REFERENCES commands(id),
  user_id VARCHAR(255),
  platform VARCHAR(20),
  channel_id VARCHAR(255),
  success BOOLEAN,
  error_message TEXT,
  execution_time INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_command_history_command_created 
ON command_history(command_id, created_at);
```

## Configuration

### Environment Variables
```env
# Server Configuration
PORT=3003
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/bot_db

# Redis (for caching and rate limiting)
REDIS_URL=redis://redis:6379

# Message Queue
RABBITMQ_URL=amqp://rabbitmq:5672

# Service Integration
AUTH_SERVICE_URL=http://auth-service:3001
CONFIG_SERVICE_URL=http://config-service:3002

# Twitch Configuration
TWITCH_CLIENT_ID=your_client_id
TWITCH_CLIENT_SECRET=your_client_secret
TWITCH_REDIRECT_URI=http://localhost:3003/auth/twitch/callback

# Discord Configuration
DISCORD_CLIENT_ID=your_client_id
DISCORD_CLIENT_SECRET=your_client_secret
DISCORD_REDIRECT_URI=http://localhost:3003/auth/discord/callback
DISCORD_BOT_TOKEN=your_bot_token

# Bot Configuration
COMMAND_PREFIX=!
MAX_COMMAND_COOLDOWN=300
DEFAULT_PERMISSION_LEVEL=0
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX=100

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
npm run dev  # Runs on port 3003

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

## Command System

### Command Definition
```json
{
  "name": "ping",
  "platform": "both",
  "response": "Pong! Response time: {responseTime}ms",
  "permissionLevel": 0,
  "cooldown": 10,
  "aliases": ["p"],
  "enabled": true,
  "variables": {
    "responseTime": "number"
  }
}
```

### Permission Levels
```javascript
const PermissionLevels = {
  USER: 0,
  SUBSCRIBER: 1,
  VIP: 2,
  MODERATOR: 3,
  ADMIN: 4,
  OWNER: 5
};
```

## Error Handling

### Standard Error Response
```json
{
  "error": {
    "code": "BOT_ERROR_CODE",
    "message": "Human readable error message",
    "details": {},
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

### Common Error Codes
- `COMMAND_NOT_FOUND`: Command does not exist
- `PERMISSION_DENIED`: Insufficient permissions
- `COOLDOWN_ACTIVE`: Command on cooldown
- `BOT_DISCONNECTED`: Bot is not connected
- `PLATFORM_ERROR`: Platform-specific error

## Monitoring

### Health Check
- Endpoint: `GET /health`
- Checks:
  - Database connectivity
  - Redis connection
  - Message queue status
  - Twitch bot status
  - Discord bot status

### Metrics
- Command usage
- Response times
- Error rates
- Platform status
- Event processing
- Resource usage

## Event System

### Event Processing Flow
1. Event received from platform
2. Event validation and normalization
3. Permission checking
4. Handler execution
5. Response generation
6. Platform-specific formatting
7. Response delivery
8. Event logging

### Event Handlers
- Message handlers
- Command handlers
- Moderation handlers
- Event notification handlers
- Custom handlers

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License. 