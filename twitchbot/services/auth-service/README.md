# Auth Service

The Auth Service manages authentication, authorization, and user management for the NexusCore platform. It provides secure authentication flows for both Twitch and Discord integrations, handles user sessions, and manages access control across the platform.

## Features

- **User Authentication**
  - Local authentication
  - OAuth2 integration
    - Twitch login
    - Discord login
  - JWT token management
  - Session handling
  - Password management

- **Authorization**
  - Role-based access control
  - Permission management
  - Scope validation
  - API key management
  - Token validation

- **User Management**
  - User registration
  - Profile management
  - Password reset
  - Email verification
  - Account linking

- **Security**
  - Password hashing
  - Rate limiting
  - Brute force protection
  - Session management
  - Audit logging

## API Endpoints

### Authentication
```
POST   /auth/register           # User registration
POST   /auth/login             # Local login
POST   /auth/logout            # User logout
POST   /auth/refresh           # Refresh token
GET    /auth/verify            # Verify token

POST   /auth/twitch            # Twitch OAuth login
GET    /auth/twitch/callback   # Twitch OAuth callback
POST   /auth/discord           # Discord OAuth login
GET    /auth/discord/callback  # Discord OAuth callback
```

### User Management
```
GET    /users                  # List users
GET    /users/:id             # Get user details
PUT    /users/:id             # Update user
DELETE /users/:id             # Delete user
PUT    /users/:id/password    # Change password
POST   /users/reset-password  # Reset password
```

### Role Management
```
GET    /roles                  # List roles
POST   /roles                  # Create role
PUT    /roles/:id             # Update role
DELETE /roles/:id             # Delete role
POST   /roles/:id/permissions # Add permissions
```

### API Keys
```
GET    /api-keys              # List API keys
POST   /api-keys              # Create API key
DELETE /api-keys/:id          # Delete API key
PUT    /api-keys/:id/revoke   # Revoke API key
```

## Database Schema

### Users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  username VARCHAR(255) UNIQUE,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  salt VARCHAR(255),
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_username_email 
ON users(username, email);
```

### OAuth Accounts
```sql
CREATE TABLE oauth_accounts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  provider VARCHAR(50),
  provider_id VARCHAR(255),
  access_token TEXT,
  refresh_token TEXT,
  token_expires TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(provider, provider_id)
);

CREATE INDEX idx_oauth_accounts_user_provider 
ON oauth_accounts(user_id, provider);
```

### Roles and Permissions
```sql
CREATE TABLE roles (
  id UUID PRIMARY KEY,
  name VARCHAR(50) UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE permissions (
  id UUID PRIMARY KEY,
  name VARCHAR(50) UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE role_permissions (
  role_id UUID REFERENCES roles(id),
  permission_id UUID REFERENCES permissions(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE user_roles (
  user_id UUID REFERENCES users(id),
  role_id UUID REFERENCES roles(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, role_id)
);
```

### API Keys
```sql
CREATE TABLE api_keys (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  key_hash VARCHAR(255),
  name VARCHAR(255),
  scopes JSONB,
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used TIMESTAMP
);

CREATE INDEX idx_api_keys_user_active 
ON api_keys(user_id, is_active);
```

### Audit Log
```sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  action VARCHAR(50),
  resource_type VARCHAR(50),
  resource_id UUID,
  metadata JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_log_user_action 
ON audit_log(user_id, action, created_at);
```

## Configuration

### Environment Variables
```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/auth_db

# Redis (for session and cache)
REDIS_URL=redis://redis:6379

# JWT Configuration
JWT_SECRET=your-jwt-secret
JWT_ACCESS_EXPIRATION=1h
JWT_REFRESH_EXPIRATION=7d

# OAuth Configuration
TWITCH_CLIENT_ID=your-twitch-client-id
TWITCH_CLIENT_SECRET=your-twitch-client-secret
TWITCH_CALLBACK_URL=http://localhost:3001/auth/twitch/callback

DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret
DISCORD_CALLBACK_URL=http://localhost:3001/auth/discord/callback

# Email Configuration
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
EMAIL_FROM=noreply@nexuscore.io

# Security
PASSWORD_SALT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=5
LOGIN_TIMEOUT=300
API_KEY_EXPIRATION=30d

# Rate Limiting
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX=100

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
```

## Authentication Flow

### Local Authentication
```javascript
const authFlow = {
  login: async (username, password) => {
    // 1. Validate credentials
    // 2. Check login attempts
    // 3. Verify password hash
    // 4. Generate tokens
    // 5. Update last login
    // 6. Create audit log
  },
  refresh: async (refreshToken) => {
    // 1. Validate refresh token
    // 2. Check token blacklist
    // 3. Generate new tokens
    // 4. Update audit log
  }
};
```

### OAuth Flow
```javascript
const oauthFlow = {
  authorize: async (provider) => {
    // 1. Generate state token
    // 2. Store state in Redis
    // 3. Redirect to provider
  },
  callback: async (provider, code, state) => {
    // 1. Verify state token
    // 2. Exchange code for tokens
    // 3. Get user profile
    // 4. Create/update user
    // 5. Generate platform tokens
  }
};
```

## Security

### Password Hashing
```javascript
const security = {
  hashPassword: async (password) => {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    return bcrypt.hash(password, salt);
  },
  verifyPassword: async (password, hash) => {
    return bcrypt.compare(password, hash);
  }
};
```

### Token Management
```javascript
const tokenManager = {
  generateTokens: (user) => {
    // Generate access and refresh tokens
  },
  verifyToken: (token) => {
    // Verify token signature and expiration
  },
  blacklistToken: (token) => {
    // Add token to blacklist in Redis
  }
};
```

## Development

### Prerequisites
- Node.js v16 or higher
- PostgreSQL 14+
- Redis 6+
- npm or yarn

### Installation
```bash
# Install dependencies
npm install

# Run database migrations
npm run migrate

# Start development server
npm run dev  # Runs on port 3001

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

## Error Handling

### Standard Error Response
```json
{
  "error": {
    "code": "AUTH_ERROR_CODE",
    "message": "Human readable error message",
    "details": {},
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

### Common Error Codes
- `INVALID_CREDENTIALS`: Invalid username or password
- `ACCOUNT_LOCKED`: Account is locked
- `TOKEN_EXPIRED`: Token has expired
- `INVALID_TOKEN`: Token is invalid
- `INSUFFICIENT_PERMISSIONS`: Insufficient permissions

## Monitoring

### Health Check
- Endpoint: `GET /health`
- Checks:
  - Database connectivity
  - Redis connection
  - Email service
  - Token validation
  - OAuth providers

### Metrics
- Authentication attempts
- Success/failure rates
- Token operations
- API key usage
- Error rates
- Response times

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License. 