# NexusCore

A comprehensive platform for managing Twitch and Discord communities, featuring automation, analytics, and powerful bot integrations.

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Service Overview](#service-overview)
5. [Project Structure](#project-structure)
6. [System Requirements](#system-requirements)
7. [Getting Started](#getting-started)
    - [Quick Start (Docker Compose)](#quick-start-docker-compose)
    - [Manual Start (Development)](#manual-start-development)
8. [Configuration](#configuration)
9. [API Documentation](#api-documentation)
10. [Development](#development)
11. [Troubleshooting](#troubleshooting)
12. [Contributing](#contributing)
13. [Support](#support)
14. [License](#license)

---

## Overview

NexusCore integrates Twitch and Discord functionalities, providing streamers and community managers with tools for automation, analytics, and community management.

---

## Features

- **Multi-Platform Integration:** Twitch & Discord bots, cross-platform sync, unified management.
- **Advanced Analytics:** Real-time metrics, chat engagement, growth tracking, custom reports.
- **Automation Tools:** Scheduled events, custom commands, auto-moderation, role management.
- **Community Management:** User engagement, permissions, rewards, notifications, challenges.

---

## Architecture

NexusCore uses a microservices architecture. Each service handles a specific domain:

- **API Gateway:** Central entry, routing, authentication, docs.
- **Auth Service:** User authentication, OAuth, JWT, roles.
- **Config Service:** Channel settings, bot config, feature toggles.
- **Bot Service:** Twitch/Discord bot logic, commands, events.
- **Scheduler Service:** Task scheduling, reminders, automation.
- **Analytics Service:** Data collection, metrics, reporting.
- **Notification Service:** Real-time notifications, templates, delivery.

---

## Service Overview

| Service                 | Description                                                                 | Docs/README                                                                 |
|-------------------------|-----------------------------------------------------------------------------|-----------------------------------------------------------------------------|
| **Frontend**            | React app for managing Twitch/Discord bots and analytics.                    | [frontend/README.md](./frontend/README.md)                                  |
| **API Gateway**         | Central entry for all client requests, routing, auth, and API management.    | [services/api-gateway/README.md](./services/api-gateway/README.md)          |
| **Auth Service**        | Handles authentication, OAuth, user management, and access control.          | [services/auth-service/README.md](./services/auth-service/README.md)         |
| **Bot Service**         | Core bot logic for Twitch/Discord, commands, events, moderation, etc.        | [services/bot-service/README.md](./services/bot-service/README.md)           |
| **Config Service**      | Centralized platform and bot configuration for Twitch/Discord.               | [services/config-service/README.md](./services/config-service/README.md)     |
| **Scheduler Service**   | Schedules and manages recurring/automated tasks and reminders.               | [services/scheduler-service/README.md](./services/scheduler-service/README.md)|
| **Notification Service**| Real-time notifications, alerts, and delivery preferences.                  | [services/notification-service/README.md](./services/notification-service/README.md)|
| **Analytics Service**   | Data collection, metrics, and reporting for Twitch/Discord.                  | [services/analytics-service/README.md](./services/analytics-service/README.md)|

---

## Project Structure

```
/
├── frontend/                # React frontend
├── services/                # All backend microservices
│   ├── api-gateway/
│   ├── auth-service/
│   ├── bot-service/
│   ├── analytics-service/
│   ├── notification-service/
│   ├── config-service/
│   ├── scheduler-service/
│   └── ... (other services)
├── docker-compose.yml
├── README.md
└── ...
```

---

## System Requirements

**Development:**
- Node.js v16+
- Docker & Docker Compose
- PostgreSQL 14+, Redis 6+, RabbitMQ 3.9+

**Production:**
- Linux (Ubuntu 20.04+ recommended)
- 4+ CPU cores, 8GB+ RAM, 50GB+ storage
- SSL certificate, domain name

---

## Getting Started

### Quick Start (Docker Compose)

1. **Clone the repository:**
   ```sh
   git clone https://github.com/NYOGamesCOM/NexusCore.git
   cd twitchbot
   ```

2. **Copy environment files:**
   ```sh
   cp .env.example .env
   cp frontend/.env.example frontend/.env
   # Repeat for each service in /services if needed
   ```
   Edit these files to set your secrets, database URLs, and API keys.

3. **Start all services:**
   ```sh
   docker-compose up --build
   ```

4. **Access the app:**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - API Gateway: [http://localhost:8080](http://localhost:8080)
   - Other services: see `docker-compose.yml` for ports

---

### Manual Start (Development)

**Backend:**
```sh
cd services/<service-name>
npm install
npm run dev
```
Repeat for each service you want to run.

**Frontend:**
```sh
cd frontend
npm install
npm start
```
App: [http://localhost:3000](http://localhost:3000)

---

## Configuration

- Each service and the frontend has its own `.env` file.
- Common variables:
  - `PORT=...`
  - `DATABASE_URL=...`
  - `JWT_SECRET=...`
  - `REACT_APP_API_URL=...`

---

## API Documentation

Each service provides its own API docs (usually at `/docs`). For full details, see each service's README:

- [Frontend](./frontend/README.md)
- [API Gateway](./services/api-gateway/README.md)
- [Auth Service](./services/auth-service/README.md)
- [Bot Service](./services/bot-service/README.md)
- [Config Service](./services/config-service/README.md)
- [Scheduler Service](./services/scheduler-service/README.md)
- [Notification Service](./services/notification-service/README.md)
- [Analytics Service](./services/analytics-service/README.md)

---

## Development

- **Code Style:** ESLint, Prettier, TypeScript
- **Testing:** Jest
- **Scripts:**
  - `npm start` (frontend/service): Start dev server
  - `npm run dev` (service): Start backend in dev mode
  - `docker-compose up --build`: Build and start all services

---

## Troubleshooting

- **Navigation/Pages Not Working:**  
  - Restart the frontend after file renames/deletions.
  - Ensure all route files are `.tsx` (not `.js`) if using TypeScript.
  - Check the browser console for errors.

- **Port Conflicts:**  
  - Stop conflicting processes or change the port in `.env`.

- **Docker Issues:**  
  - `docker-compose down -v` to remove all containers/volumes.
  - `docker-compose logs <service>` for logs.

- **Database Issues:**  
  - Ensure database containers are running and accessible.
  - Check connection strings in `.env`.

---

## Contributing

1. Fork the repo
2. Create a feature branch
3. Make your changes (with tests)
4. Submit a pull request

---

## Support

- Check the [documentation](https://github.com/NYOGamesCOM/NexusCore/wiki)
- Search [existing issues](https://github.com/NYOGamesCOM/NexusCore/issues)
- Create a new issue if needed

---

## License

MIT License. See the [LICENSE](LICENSE) file for details. 