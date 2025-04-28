# MarkSoftBot

A powerful Twitch chat bot with web dashboard and EFT integration, built with NestJS and React.

## Features

### Core Bot Features
- **Custom Commands**: Create, manage, and execute custom chat commands with cooldowns and permissions
- **Timers**: Set up automated messages with customizable intervals
- **Giveaways**: Run interactive giveaways with customizable rules and winner selection
- **Polls**: Create and manage real-time polls with voting tracking
- **Moderation**: Built-in chat moderation tools with customizable rules
- **Currency System**: Track and manage user points/currency with custom rewards

### EFT Integration
- **Item Price Tracking**: Real-time price monitoring for Escape from Tarkov items
- **Trader Information**: Access trader prices and stock information
- **Price History**: View historical price data for items
- **Item Search**: Quick search for items with detailed information
- **Market Analysis**: Get insights on item price trends and market movements

### Dashboard Features
- **Real-time Chat**: Monitor and interact with chat directly from the dashboard
- **Command Management**: Create and manage custom commands through a user-friendly interface
- **User Management**: View and manage user permissions and currency
- **Analytics**: Track chat activity, command usage, and user engagement
- **Settings**: Configure bot behavior, integrations, and appearance

### Technical Features
- **Microservices Architecture**: Separate services for bot, dashboard, and API
- **Real-time Updates**: WebSocket integration for instant updates
- **Scalable Infrastructure**: Kubernetes deployment with auto-scaling
- **High Availability**: Pod disruption budgets and redundancy
- **Security**: JWT authentication and network policies
- **Monitoring**: Built-in metrics and logging

## Architecture

The application is built using a microservices architecture with the following components:

1. **Bot Service**: Handles Twitch chat interaction and command processing
2. **Dashboard Service**: Provides web interface for bot management
3. **API Service**: Manages data and communication between services
4. **Database**: PostgreSQL for persistent data storage
5. **Cache**: Redis for real-time data and session management

## Kubernetes Deployment

The application is deployed using Kubernetes with the following resources:

### Namespace
- Dedicated namespace `marksoftbot`
- Resource quotas and limits
- Network policies for security

### Services
- Bot service (port 3000)
- Dashboard service (port 3001)
- API service (port 3002)
- Load balancer for external access

### Network Policies
- Default deny all ingress/egress
- Service-specific policies for bot, dashboard, and API
- External access restrictions

### Resource Management
- Pod disruption budgets for high availability
- Priority classes for critical components
- Horizontal pod autoscaling
- Resource quotas and limits

## Development

### Prerequisites
- Node.js 18+
- Docker
- Kubernetes cluster
- PostgreSQL
- Redis

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/marksoftbot.git
cd marksoftbot
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the development server:
```bash
npm run start:dev
```

### Kubernetes Deployment

1. Apply namespace:
```bash
kubectl apply -f k8s/namespace.yaml
```

2. Apply configurations:
```bash
kubectl apply -f k8s/
```

3. Monitor deployment:
```bash
kubectl get all -n marksoftbot
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 