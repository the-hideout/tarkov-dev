# UltimateTwitchBot

A powerful, feature-rich Twitch chat bot and web platform for streamers of all sizes. Built with modern technologies and designed for extensibility.

## 🚀 Features

### Core Features
- Advanced chat moderation with AI-powered toxicity detection
- Custom commands with variables and role-based permissions
- Community engagement tools (polls, giveaways, mini-games)
- Stream integration (OBS control, channel points)
- Music and media management
- Comprehensive analytics and reporting
- Deepseek AI co-host integration
- Escape from Tarkov market integration

### Web Platform
- Modern admin dashboard
- Real-time analytics
- Command and timer management
- EFT market console
- User management and permissions

## 🏗 Architecture

```
ultimate-twitch-bot/
├── bot/                    # Twitch bot core
│   ├── src/
│   │   ├── core/          # Bot core functionality
│   │   ├── modules/       # Feature modules
│   │   ├── services/      # External service integrations
│   │   └── utils/         # Utility functions
│   └── tests/             # Bot unit tests
├── web/                    # Web application
│   ├── frontend/          # React/Next.js frontend
│   └── backend/           # Node.js/NestJS backend
├── shared/                 # Shared types and utilities
├── docker/                 # Docker configuration
└── docs/                   # Documentation
```

## 🛠 Tech Stack

### Backend
- Node.js/NestJS
- TypeScript
- PostgreSQL
- Redis (caching)
- GraphQL (EFT API integration)

### Frontend
- React/Next.js
- TypeScript
- TailwindCSS
- Chart.js
- Socket.io (real-time updates)

### Infrastructure
- Docker
- Kubernetes
- GitHub Actions
- AWS/GCP

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Docker
- PostgreSQL
- Redis
- Twitch Developer Account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ultimate-twitch-bot.git
cd ultimate-twitch-bot
```

2. Install dependencies:
```bash
# Install bot dependencies
cd bot
npm install

# Install web dependencies
cd ../web
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your credentials
```

4. Start the development environment:
```bash
# Start bot
cd bot
npm run dev

# Start web platform
cd web
npm run dev
```

## 📚 Documentation

- [Bot Configuration](docs/bot-configuration.md)
- [Web Platform Guide](docs/web-platform.md)
- [API Documentation](docs/api.md)
- [Deployment Guide](docs/deployment.md)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [tmi.js](https://github.com/tmijs/tmi.js) - Twitch Messaging Interface
- [api.tarkov.dev](https://api.tarkov.dev/) - EFT Market API
- [Deepseek](https://deepseek.com) - AI Integration 