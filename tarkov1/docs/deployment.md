# UltimateTwitchBot Deployment Guide

## 1. Prerequisites

### 1.1 System Requirements
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 14+
- Redis 6+
- Git

### 1.2 Required Accounts
- Twitch Developer Account
- Docker Hub Account
- Cloud Provider Account (AWS/GCP/Azure)

## 2. Local Development Setup

### 2.1 Clone Repository
```bash
git clone https://github.com/yourusername/UltimateTwitchBot.git
cd UltimateTwitchBot
```

### 2.2 Environment Setup
1. Copy environment template:
```bash
cp .env.example .env
```

2. Edit `.env` with your configuration:
```bash
# Twitch Configuration
TWITCH_BOT_USERNAME=your_bot_username
TWITCH_OAUTH_TOKEN=oauth:your_oauth_token
TWITCH_CLIENT_ID=your_client_id
TWITCH_CLIENT_SECRET=your_client_secret

# Database Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DB=ultimate_twitch_bot

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
```

### 2.3 Start Development Environment
```bash
# Install dependencies
npm install

# Start development environment
docker-compose up -d

# Start the application
npm run start:dev
```

## 3. Production Deployment

### 3.1 Docker Deployment
1. Build the Docker image:
```bash
docker build -t ultimate-twitch-bot .
```

2. Push to Docker Hub:
```bash
docker tag ultimate-twitch-bot yourusername/ultimate-twitch-bot:latest
docker push yourusername/ultimate-twitch-bot:latest
```

3. Deploy using Docker Compose:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 3.2 Kubernetes Deployment
1. Create Kubernetes manifests:
```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
```

2. Verify deployment:
```bash
kubectl get pods -n ultimate-twitch-bot
kubectl get services -n ultimate-twitch-bot
```

## 4. Database Setup

### 4.1 PostgreSQL
1. Create database:
```sql
CREATE DATABASE ultimate_twitch_bot;
```

2. Run migrations:
```bash
npm run migration:run
```

### 4.2 Redis
1. Configure Redis:
```bash
redis-cli
CONFIG SET requirepass your_redis_password
```

## 5. Monitoring Setup

### 5.1 Prometheus
1. Install Prometheus:
```bash
helm install prometheus stable/prometheus
```

2. Configure scraping:
```yaml
scrape_configs:
  - job_name: 'ultimate-twitch-bot'
    static_configs:
      - targets: ['ultimate-twitch-bot:3000']
```

### 5.2 Grafana
1. Install Grafana:
```bash
helm install grafana stable/grafana
```

2. Import dashboard:
- Use dashboard ID: 12345
- Configure data source

## 6. SSL/TLS Setup

### 6.1 Let's Encrypt
1. Install certbot:
```bash
sudo apt-get install certbot
```

2. Obtain certificate:
```bash
certbot certonly --standalone -d yourdomain.com
```

3. Configure Nginx:
```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
    }
}
```

## 7. Backup Strategy

### 7.1 Database Backups
1. Schedule PostgreSQL backups:
```bash
0 0 * * * pg_dump -U postgres ultimate_twitch_bot > /backups/db_$(date +%Y%m%d).sql
```

2. Configure Redis persistence:
```redis
save 900 1
save 300 10
save 60 10000
```

### 7.2 Configuration Backups
1. Backup configuration files:
```bash
tar -czf config_backup_$(date +%Y%m%d).tar.gz .env k8s/
```

## 8. Scaling Strategy

### 8.1 Horizontal Scaling
1. Configure load balancer:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: ultimate-twitch-bot
spec:
  type: LoadBalancer
  ports:
    - port: 80
      targetPort: 3000
  selector:
    app: ultimate-twitch-bot
```

2. Configure auto-scaling:
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ultimate-twitch-bot
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ultimate-twitch-bot
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
```

## 9. Maintenance

### 9.1 Regular Updates
1. Update dependencies:
```bash
npm update
```

2. Update Docker images:
```bash
docker-compose pull
docker-compose up -d
```

### 9.2 Monitoring
1. Check logs:
```bash
kubectl logs -f deployment/ultimate-twitch-bot
```

2. Monitor metrics:
```bash
kubectl top pods
```

## 10. Troubleshooting

### 10.1 Common Issues
1. **Bot Connection Issues**
   - Verify OAuth token
   - Check network connectivity
   - Verify channel permissions

2. **Database Issues**
   - Check connection string
   - Verify database permissions
   - Check disk space

3. **Performance Issues**
   - Monitor resource usage
   - Check Redis cache
   - Review query performance

### 10.2 Logging
1. Enable debug logging:
```bash
LOG_LEVEL=debug npm start
```

2. View logs:
```bash
docker-compose logs -f
```

## 11. Security Checklist

### 11.1 Pre-deployment
- [ ] Update all dependencies
- [ ] Set secure passwords
- [ ] Configure firewalls
- [ ] Enable SSL/TLS

### 11.2 Post-deployment
- [ ] Test authentication
- [ ] Verify backups
- [ ] Check monitoring
- [ ] Review logs 