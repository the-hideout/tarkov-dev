# API Gateway

The API Gateway serves as the central entry point for all client requests in the NexusCore platform. It handles request routing, authentication, rate limiting, and provides a unified API interface for both Twitch and Discord functionalities.

## Features

- **Request Routing**
  - Service discovery
  - Load balancing
  - Request forwarding
  - Response caching
  - Circuit breaking

- **Authentication & Security**
  - JWT validation
  - API key management
  - Rate limiting
  - CORS configuration
  - Request validation

- **API Management**
  - Version control
  - Documentation
  - Response transformation
  - Error handling
  - Metrics collection

- **Traffic Management**
  - Load balancing
  - Circuit breakers
  - Retry policies
  - Timeout handling
  - Request queuing

## API Routes

### Authentication
```
POST   /auth/login              # User login
POST   /auth/refresh           # Refresh token
POST   /auth/logout            # User logout
GET    /auth/status            # Auth status
```

### Twitch Integration
```
GET    /twitch/channels        # List channels
GET    /twitch/streams        # Active streams
POST   /twitch/webhooks       # Configure webhooks
GET    /twitch/events         # Stream events
```

### Discord Integration
```
GET    /discord/guilds        # List guilds
GET    /discord/channels      # List channels
POST   /discord/webhooks      # Configure webhooks
GET    /discord/events        # Server events
```

### Bot Management
```
GET    /bots                  # List bots
POST   /bots/commands         # Create command
GET    /bots/status          # Bot status
PUT    /bots/settings        # Update settings
```

### Analytics
```
GET    /analytics/metrics     # Get metrics
GET    /analytics/reports     # Get reports
POST   /analytics/export     # Export data
GET    /analytics/events     # Get events
```

## Configuration

### Environment Variables
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Service Discovery
CONSUL_HOST=consul
CONSUL_PORT=8500

# Redis (for caching and rate limiting)
REDIS_URL=redis://redis:6379

# Authentication
JWT_SECRET=your-jwt-secret
JWT_EXPIRATION=1h
REFRESH_TOKEN_EXPIRATION=7d

# Rate Limiting
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX=100
RATE_LIMIT_DELAY=0

# Service URLs
AUTH_SERVICE_URL=http://auth-service:3001
CONFIG_SERVICE_URL=http://config-service:3002
BOT_SERVICE_URL=http://bot-service:3003
NOTIFICATION_SERVICE_URL=http://notification-service:3005
SCHEDULER_SERVICE_URL=http://scheduler-service:3006
ANALYTICS_SERVICE_URL=http://analytics-service:3007

# CORS Configuration
CORS_ORIGIN=*
CORS_METHODS=GET,POST,PUT,DELETE,OPTIONS
CORS_ALLOWED_HEADERS=Content-Type,Authorization

# Circuit Breaker
CIRCUIT_BREAKER_TIMEOUT=10000
CIRCUIT_BREAKER_RESET_TIMEOUT=30000
CIRCUIT_BREAKER_ERROR_THRESHOLD=50

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
```

## Service Discovery

### Service Registration
```json
{
  "service": {
    "name": "api-gateway",
    "id": "api-gateway-1",
    "tags": ["gateway", "api"],
    "address": "api-gateway",
    "port": 3000,
    "checks": [
      {
        "http": "http://api-gateway:3000/health",
        "interval": "15s",
        "timeout": "5s"
      }
    ]
  }
}
```

### Service Resolution
```javascript
const services = {
  auth: { url: process.env.AUTH_SERVICE_URL, timeout: 5000 },
  config: { url: process.env.CONFIG_SERVICE_URL, timeout: 5000 },
  bot: { url: process.env.BOT_SERVICE_URL, timeout: 10000 },
  notification: { url: process.env.NOTIFICATION_SERVICE_URL, timeout: 5000 },
  scheduler: { url: process.env.SCHEDULER_SERVICE_URL, timeout: 5000 },
  analytics: { url: process.env.ANALYTICS_SERVICE_URL, timeout: 10000 }
};
```

## Rate Limiting

### Configuration
```javascript
const rateLimiter = {
  windowMs: 60000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.',
  headers: true,
  handler: (req, res) => {
    res.status(429).json({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests, please try again later.',
        resetTime: res.getHeader('X-RateLimit-Reset')
      }
    });
  }
};
```

## Error Handling

### Standard Error Response
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {},
    "timestamp": "2024-01-01T00:00:00Z",
    "path": "/api/resource",
    "method": "GET"
  }
}
```

### Common Error Codes
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `RATE_LIMITED`: Too many requests
- `SERVICE_UNAVAILABLE`: Downstream service unavailable
- `VALIDATION_ERROR`: Invalid request parameters

## Request Flow

### Processing Steps
1. Request received
2. Authentication check
3. Rate limit check
4. Request validation
5. Service resolution
6. Request forwarding
7. Response transformation
8. Response caching
9. Response delivery

### Circuit Breaker
```javascript
const circuitBreaker = {
  timeout: 10000,
  errorThresholdPercentage: 50,
  resetTimeout: 30000,
  fallback: (err, args) => {
    return {
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: 'Service temporarily unavailable',
        details: { service: args.service }
      }
    };
  }
};
```

## Monitoring

### Health Check
- Endpoint: `GET /health`
- Checks:
  - Redis connection
  - Service discovery
  - Downstream services
  - Memory usage
  - Response times

### Metrics
- Request rates
- Error rates
- Response times
- Cache hit rates
- Circuit breaker status
- Service availability

### Logging
```javascript
const logConfig = {
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'api-gateway' },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
};
```

## Development

### Prerequisites
- Node.js v16 or higher
- Redis 6+
- Consul 1.9+
- npm or yarn

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev  # Runs on port 3000

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

## API Documentation

The API Gateway provides OpenAPI/Swagger documentation at:
```
http://localhost:3000/docs
```

### Documentation Features
- Interactive API explorer
- Request/response examples
- Authentication details
- Schema definitions
- Error responses

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License. 