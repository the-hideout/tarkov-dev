#!/bin/bash

# Exit on error
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Starting UltimateTwitchBot deployment...${NC}"

# Create namespace
echo -e "${GREEN}Creating namespace...${NC}"
kubectl apply -f namespace.yaml

# Create priority classes
echo -e "${GREEN}Creating priority classes...${NC}"
kubectl apply -f priority-classes.yaml

# Create resource quotas and limits
echo -e "${GREEN}Setting up resource quotas and limits...${NC}"
kubectl apply -f resource-quota.yaml
kubectl apply -f limit-range.yaml

# Create configmap and secrets
echo -e "${GREEN}Creating configmap and secrets...${NC}"
kubectl apply -f configmap.yaml
kubectl apply -f secret.yaml

# Create network policies
echo -e "${GREEN}Setting up network policies...${NC}"
kubectl apply -f network-policy-base.yaml
kubectl apply -f network-policy-bot.yaml
kubectl apply -f network-policy-dashboard.yaml
kubectl apply -f network-policy-api.yaml

# Create services
echo -e "${GREEN}Creating services...${NC}"
kubectl apply -f service-bot.yaml
kubectl apply -f service-dashboard.yaml
kubectl apply -f service-api.yaml

# Create deployments
echo -e "${GREEN}Creating deployments...${NC}"
kubectl apply -f deployment-bot.yaml
kubectl apply -f deployment-dashboard.yaml
kubectl apply -f deployment-api.yaml

# Create horizontal pod autoscalers
echo -e "${GREEN}Setting up autoscaling...${NC}"
kubectl apply -f hpa-bot.yaml
kubectl apply -f hpa-dashboard.yaml
kubectl apply -f hpa-api.yaml

# Create pod disruption budgets
echo -e "${GREEN}Creating pod disruption budgets...${NC}"
kubectl apply -f pdb-bot.yaml
kubectl apply -f pdb-dashboard.yaml
kubectl apply -f pdb-api.yaml

# Create ingress
echo -e "${GREEN}Setting up ingress...${NC}"
kubectl apply -f ingress.yaml

# Wait for deployments to be ready
echo -e "${YELLOW}Waiting for deployments to be ready...${NC}"
kubectl wait --for=condition=available --timeout=300s deployment/ultimate-twitch-bot
kubectl wait --for=condition=available --timeout=300s deployment/ultimate-twitch-bot-dashboard
kubectl wait --for=condition=available --timeout=300s deployment/ultimate-twitch-bot-api

# Show deployment status
echo -e "${GREEN}Deployment status:${NC}"
kubectl get all -n ultimate-twitch-bot

echo -e "${GREEN}UltimateTwitchBot deployment completed successfully!${NC}" 