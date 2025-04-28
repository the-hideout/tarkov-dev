# Deployment Guide

This guide explains how to deploy the UltimateTwitchBot using Docker, Docker Compose, or Kubernetes.

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Git
- Twitch Developer Account
- Redis
- PostgreSQL

## Local Development

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ultimate-twitch-bot.git
cd ultimate-twitch-bot
```

2. Install dependencies:
```bash
cd bot
npm install
```

3. Create environment file:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the bot:
```bash
npm run dev
```

## Docker Deployment

1. Build the Docker image:
```bash
docker build -t ultimate-twitch-bot .
```

2. Create a docker-compose.yml file:
```yaml
version: '3.8'
services:
  bot:
    image: ultimate-twitch-bot
    environment:
      - TWITCH_BOT_USERNAME=${TWITCH_BOT_USERNAME}
      - TWITCH_OAUTH_TOKEN=${TWITCH_OAUTH_TOKEN}
      # ... other environment variables
    depends_on:
      - redis
      - postgres

  redis:
    image: redis:6-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}

  postgres:
    image: postgres:14-alpine
    environment:
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=${POSTGRES_DB}
```

3. Start the services:
```bash
docker-compose up -d
```

## Kubernetes Deployment

1. Create Kubernetes secrets:
```bash
kubectl create secret generic twitch-secrets \
  --from-literal=bot-username=${TWITCH_BOT_USERNAME} \
  --from-literal=oauth-token=${TWITCH_OAUTH_TOKEN} \
  --from-literal=channel=${TWITCH_CHANNEL}

kubectl create secret generic redis-secrets \
  --from-literal=password=${REDIS_PASSWORD}

kubectl create secret generic postgres-secrets \
  --from-literal=username=${POSTGRES_USER} \
  --from-literal=password=${POSTGRES_PASSWORD}
```

2. Apply the Kubernetes manifests:
```bash
kubectl apply -f docker/kubernetes/deployment.yaml
```

3. Verify the deployment:
```bash
kubectl get pods
kubectl get services
```

## CI/CD Pipeline

The project includes a GitHub Actions workflow for automated testing, building, and deployment:

1. Push to main branch triggers:
   - Linting
   - Testing
   - Docker image build
   - Deployment to Kubernetes

2. Required secrets:
   - `DOCKERHUB_USERNAME`
   - `DOCKERHUB_TOKEN`
   - `KUBE_CONFIG`

## Monitoring and Logging

### Prometheus Metrics

The bot exposes metrics at `/metrics`:
- Chat message count
- Command usage
- API response times
- Error rates

### Logging

Logs are available through:
- Docker logs: `docker logs ultimate-twitch-bot`
- Kubernetes logs: `kubectl logs deployment/ultimate-twitch-bot`

## Scaling

### Horizontal Scaling

For high-traffic channels:
1. Increase Kubernetes replicas:
```bash
kubectl scale deployment ultimate-twitch-bot --replicas=3
```

2. Configure Redis cluster:
```yaml
redis:
  image: redis:6-alpine
  command: redis-server --cluster-enabled yes
```

### Vertical Scaling

Adjust resource limits in Kubernetes:
```yaml
resources:
  requests:
    cpu: "500m"
    memory: "512Mi"
  limits:
    cpu: "1000m"
    memory: "1Gi"
```

## Backup and Recovery

### Database Backup

1. PostgreSQL backup:
```bash
pg_dump -U ${POSTGRES_USER} -d ${POSTGRES_DB} > backup.sql
```

2. Redis backup:
```bash
redis-cli SAVE
cp /var/lib/redis/dump.rdb backup.rdb
```

### Disaster Recovery

1. Restore PostgreSQL:
```bash
psql -U ${POSTGRES_USER} -d ${POSTGRES_DB} < backup.sql
```

2. Restore Redis:
```bash
cp backup.rdb /var/lib/redis/dump.rdb
redis-cli SHUTDOWN
redis-server
```

## Security Considerations

1. Use strong passwords for:
   - Redis
   - PostgreSQL
   - JWT secret

2. Enable SSL/TLS for:
   - Web dashboard
   - API endpoints
   - Database connections

3. Regular updates:
   - Update dependencies
   - Apply security patches
   - Rotate credentials

## Troubleshooting

### Common Issues

1. **Bot not connecting**
   - Check network connectivity
   - Verify Twitch credentials
   - Check Redis/PostgreSQL connections

2. **High latency**
   - Monitor resource usage
   - Check network latency
   - Optimize database queries

3. **Memory leaks**
   - Monitor memory usage
   - Check for unclosed connections
   - Review garbage collection

### Support

For additional help:
- Check logs
- Review metrics
- Open GitHub issue
- Join Discord support 