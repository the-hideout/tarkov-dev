# UltimateTwitchBot Kubernetes Configuration

This directory contains the Kubernetes configurations for deploying the UltimateTwitchBot application in a production environment.

## Directory Structure

```
k8s/
├── README.md                 # This file
├── deploy.sh                 # Deployment script
├── namespace.yaml            # Namespace configuration
├── priority-classes.yaml     # Priority classes for pod scheduling
├── resource-quota.yaml       # Resource quotas for the namespace
├── limit-range.yaml          # Resource limits for containers
├── configmap.yaml            # Configuration data
├── secret.yaml               # Sensitive configuration data
├── network-policy-*.yaml     # Network policies for security
├── service-*.yaml            # Service definitions
├── deployment-*.yaml         # Deployment configurations
├── hpa-*.yaml               # Horizontal pod autoscalers
├── pdb-*.yaml               # Pod disruption budgets
└── ingress.yaml             # Ingress configuration
```

## Components

### 1. Namespace
- Dedicated namespace `ultimate-twitch-bot`
- Labels for environment and management
- Resource isolation and organization

### 2. Resource Management
- Resource quotas for namespace limits
- Limit ranges for container defaults
- Priority classes for pod scheduling
- CPU and memory constraints
- Storage quotas

### 3. Security
- Network policies for pod communication
- Secrets for sensitive data
- ConfigMaps for configuration
- SSL/TLS termination
- Pod security contexts

### 4. Services
- Bot service (port 3000)
- Dashboard service (port 3001)
- API service (port 3002)
- Service discovery
- Load balancing

### 5. Deployments
- High availability with multiple replicas
- Resource limits and requests
- Health checks
- Pod anti-affinity
- Rolling updates
- Configurable replicas

### 6. Autoscaling
- CPU and memory-based scaling
- Configurable scaling policies
- Stabilization windows
- Custom metrics support
- Scale-to-zero capability

### 7. Availability
- Pod disruption budgets
- Minimum available pods
- Graceful shutdown
- Node affinity
- Pod topology spread

### 8. Networking
- Ingress configuration
- SSL/TLS termination
- Path-based routing
- Rate limiting
- CORS configuration

## Deployment

### Prerequisites
1. Kubernetes cluster (version 1.20+)
2. kubectl configured with cluster access
3. Helm (optional, for package management)
4. Cert-manager (for SSL/TLS)
5. Ingress controller (e.g., Nginx, Traefik)

### Deployment Steps

1. Ensure you have `kubectl` configured with proper permissions
2. Make the deployment script executable:
   ```bash
   chmod +x deploy.sh
   ```
3. Run the deployment script:
   ```bash
   ./deploy.sh
   ```

The deployment script will:
1. Create the namespace
2. Apply priority classes
3. Set up resource quotas and limits
4. Create configmaps and secrets
5. Apply network policies
6. Create services and deployments
7. Set up autoscaling
8. Create pod disruption budgets
9. Configure ingress
10. Wait for deployments to be ready

### Customization

Before deployment, you can customize:
1. Resource limits in `resource-quota.yaml`
2. Container defaults in `limit-range.yaml`
3. Priority classes in `priority-classes.yaml`
4. Network policies in `network-policy-*.yaml`
5. Autoscaling settings in `hpa-*.yaml`

## Monitoring

After deployment, you can monitor the application using:

```bash
# View all resources
kubectl get all -n ultimate-twitch-bot

# View pod status
kubectl get pods -n ultimate-twitch-bot

# View logs
kubectl logs -f deployment/ultimate-twitch-bot -n ultimate-twitch-bot

# View resource usage
kubectl top pods -n ultimate-twitch-bot

# View events
kubectl get events -n ultimate-twitch-bot

# View network policies
kubectl describe networkpolicy -n ultimate-twitch-bot
```

## Maintenance

### Scaling
```bash
# Scale bot deployment
kubectl scale deployment ultimate-twitch-bot --replicas=3 -n ultimate-twitch-bot

# View autoscaling status
kubectl get hpa -n ultimate-twitch-bot
```

### Updates
```bash
# Update image
kubectl set image deployment/ultimate-twitch-bot bot=yourusername/ultimate-twitch-bot:new-version -n ultimate-twitch-bot

# Rollback deployment
kubectl rollout undo deployment/ultimate-twitch-bot -n ultimate-twitch-bot
```

### Troubleshooting
```bash
# Describe pod
kubectl describe pod <pod-name> -n ultimate-twitch-bot

# View events
kubectl get events -n ultimate-twitch-bot

# Check network policies
kubectl describe networkpolicy -n ultimate-twitch-bot

# View resource usage
kubectl top pods -n ultimate-twitch-bot
```

## Security Considerations

1. All sensitive data is stored in Kubernetes Secrets
2. Network policies restrict pod-to-pod communication
3. Resource quotas prevent resource exhaustion
4. Pod disruption budgets ensure high availability
5. SSL/TLS is enforced through ingress
6. Regular security updates and patches
7. RBAC for access control
8. Pod security contexts
9. Network segmentation
10. Regular security audits

## Best Practices

1. Always use the deployment script for consistent deployments
2. Monitor resource usage and adjust quotas as needed
3. Regularly update images and configurations
4. Use kubectl wait for deployment readiness
5. Implement proper logging and monitoring
6. Regular backups of persistent data
7. Use version control for configurations
8. Implement proper error handling
9. Regular security audits
10. Document all changes and updates

## Backup and Recovery

### Backup
```bash
# Backup PostgreSQL data
kubectl exec -n ultimate-twitch-bot <postgres-pod> -- pg_dump -U postgres > backup.sql

# Backup Redis data
kubectl exec -n ultimate-twitch-bot <redis-pod> -- redis-cli SAVE
```

### Recovery
```bash
# Restore PostgreSQL data
kubectl exec -i -n ultimate-twitch-bot <postgres-pod> -- psql -U postgres < backup.sql

# Restore Redis data
kubectl cp backup.rdb -n ultimate-twitch-bot <redis-pod>:/data/dump.rdb
```

## Support

For Kubernetes-related issues:
1. Check the [Kubernetes documentation](https://kubernetes.io/docs/)
2. Review the [troubleshooting guide](docs/troubleshooting.md)
3. Open an issue on GitHub
4. Contact the maintainers 