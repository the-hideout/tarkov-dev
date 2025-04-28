# Analytics Service

The Analytics Service provides comprehensive data collection, processing, and visualization capabilities for the NexusCore platform. It handles analytics for both Twitch and Discord platforms, offering insights into user engagement, stream performance, and community metrics.

## Features

- **Real-time Analytics**
  - Stream metrics
  - Chat engagement
  - User activity
  - Event tracking
  - Performance monitoring

- **Historical Analytics**
  - Trend analysis
  - Growth metrics
  - Retention rates
  - Engagement patterns
  - Community insights

- **Data Processing**
  - Data aggregation
  - Custom metrics
  - Statistical analysis
  - Data filtering
  - Export capabilities

- **Visualization**
  - Interactive dashboards
  - Custom reports
  - Real-time graphs
  - Data exports
  - Metric comparisons

## API Endpoints

### Twitch Analytics
```
GET    /analytics/twitch/streams          # Stream analytics
GET    /analytics/twitch/chat             # Chat analytics
GET    /analytics/twitch/viewers          # Viewer analytics
GET    /analytics/twitch/events           # Event analytics
GET    /analytics/twitch/growth           # Growth metrics
```

### Discord Analytics
```
GET    /analytics/discord/messages        # Message analytics
GET    /analytics/discord/members         # Member analytics
GET    /analytics/discord/engagement      # Engagement metrics
GET    /analytics/discord/events          # Event analytics
GET    /analytics/discord/growth          # Growth metrics
```

### Data Management
```
POST   /analytics/export                  # Export data
GET    /analytics/reports                 # Get reports
POST   /analytics/reports                 # Create report
GET    /analytics/metrics                 # Custom metrics
POST   /analytics/metrics                 # Define metric
```

## Database Schema

### Stream Analytics
```sql
CREATE TABLE stream_analytics (
  id UUID PRIMARY KEY,
  channel_id UUID,
  stream_id VARCHAR(255),
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  peak_viewers INTEGER,
  average_viewers INTEGER,
  chat_messages INTEGER,
  new_followers INTEGER,
  new_subscribers INTEGER,
  bits_cheered INTEGER,
  raid_count INTEGER,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stream_analytics_channel_time 
ON stream_analytics(channel_id, start_time);
```

### Chat Analytics
```sql
CREATE TABLE chat_analytics (
  id UUID PRIMARY KEY,
  channel_id UUID,
  date DATE,
  total_messages INTEGER,
  unique_chatters INTEGER,
  commands_used INTEGER,
  emotes_used INTEGER,
  message_distribution JSONB,
  user_engagement JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chat_analytics_channel_date 
ON chat_analytics(channel_id, date);
```

### Discord Analytics
```sql
CREATE TABLE discord_analytics (
  id UUID PRIMARY KEY,
  guild_id VARCHAR(255),
  date DATE,
  total_messages INTEGER,
  active_users INTEGER,
  new_members INTEGER,
  left_members INTEGER,
  voice_minutes INTEGER,
  reaction_count INTEGER,
  channel_activity JSONB,
  role_distribution JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_discord_analytics_guild_date 
ON discord_analytics(guild_id, date);
```

### Custom Metrics
```sql
CREATE TABLE custom_metrics (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  query TEXT,
  parameters JSONB,
  cache_duration INTEGER,
  last_calculated TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_custom_metrics_name 
ON custom_metrics(name);
```

## Configuration

### Environment Variables
```env
# Server Configuration
PORT=3007
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/analytics_db

# Redis (for caching and real-time metrics)
REDIS_URL=redis://redis:6379

# Message Queue
RABBITMQ_URL=amqp://rabbitmq:5672

# Service Integration
AUTH_SERVICE_URL=http://auth-service:3001
CONFIG_SERVICE_URL=http://config-service:3002

# Analytics Configuration
RETENTION_DAYS=90
AGGREGATION_INTERVAL=300000  # 5 minutes
CACHE_TTL=3600              # 1 hour
MAX_EXPORT_ROWS=1000000

# Rate Limiting
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
npm run dev  # Runs on port 3007

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

## Data Processing

### Metric Definition
```json
{
  "name": "viewer_retention",
  "description": "Calculate viewer retention rate",
  "query": "SELECT ... FROM stream_analytics",
  "parameters": {
    "timeframe": "daily",
    "aggregation": "average",
    "filters": {
      "minimum_viewers": 100
    }
  },
  "cacheSettings": {
    "duration": 3600,
    "invalidateOn": ["stream_end"]
  }
}
```

### Export Format
```json
{
  "format": "csv",
  "metrics": ["viewers", "chat_activity"],
  "timeframe": {
    "start": "2024-01-01T00:00:00Z",
    "end": "2024-01-31T23:59:59Z"
  },
  "filters": {
    "channel_id": "channel-uuid",
    "minimum_viewers": 100
  }
}
```

## Error Handling

### Standard Error Response
```json
{
  "error": {
    "code": "ANALYTICS_ERROR_CODE",
    "message": "Human readable error message",
    "details": {},
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

### Common Error Codes
- `INVALID_METRIC`: Invalid metric definition
- `DATA_UNAVAILABLE`: Required data not available
- `PROCESSING_ERROR`: Data processing failed
- `EXPORT_FAILED`: Data export failed
- `CACHE_ERROR`: Cache operation failed

## Monitoring

### Health Check
- Endpoint: `GET /health`
- Checks:
  - Database connectivity
  - Redis connection
  - Message queue status
  - Processing pipeline
  - Export service

### Metrics
- Processing throughput
- Query performance
- Cache hit rates
- Export volumes
- Error rates
- Resource usage

## Data Retention

### Retention Policies
- Real-time data: 24 hours
- Hourly aggregates: 30 days
- Daily aggregates: 90 days
- Monthly aggregates: 1 year
- Yearly aggregates: Indefinite

### Aggregation Levels
- Per-minute metrics
- Hourly summaries
- Daily reports
- Monthly trends
- Yearly statistics

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License. 