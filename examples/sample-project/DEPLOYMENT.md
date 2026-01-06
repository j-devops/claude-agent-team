# Deployment Guide

Complete guide for deploying TaskFlow SaaS to various environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [Staging Deployment](#staging-deployment)
- [Production Deployment](#production-deployment)
- [Deployment Platforms](#deployment-platforms)
- [Rollback Procedures](#rollback-procedures)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Tools

- Docker (>= 20.10)
- Docker Compose (>= 2.0)
- Node.js (>= 18.0)
- Git
- GitHub CLI (optional, for automated deployments)

### Access Requirements

- GitHub repository access
- Docker registry access (GitHub Container Registry)
- Production environment credentials
- Database connection details

## Local Development

### First Time Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/taskflow-saas.git
   cd taskflow-saas
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   ```

3. **Start services with Docker Compose**
   ```bash
   docker-compose up -d
   ```

4. **Verify services are running**
   ```bash
   docker-compose ps
   ```

   Expected output:
   ```
   NAME                    STATUS          PORTS
   taskflow-backend        Up              0.0.0.0:3000->3000/tcp
   taskflow-frontend       Up              0.0.0.0:5173->5173/tcp
   taskflow-postgres       Up              0.0.0.0:5432->5432/tcp
   taskflow-redis          Up              0.0.0.0:6379->6379/tcp
   ```

5. **Run database migrations**
   ```bash
   docker-compose exec backend npx prisma migrate deploy
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - Health check: http://localhost:3000/health

### Development Workflow

```bash
# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart a service
docker-compose restart backend

# Rebuild after dependency changes
docker-compose up -d --build

# Stop all services
docker-compose down

# Stop and remove volumes (CAUTION: deletes database)
docker-compose down -v
```

### Running Tests Locally

```bash
# Backend tests
cd backend
npm test
npm run test:coverage

# Frontend tests
cd frontend
npm test
npm run test:e2e

# Linting
npm run lint

# Type checking
npm run type-check
```

## Staging Deployment

### Automatic Deployment (Recommended)

Pushing to the `develop` branch triggers automatic deployment to staging:

```bash
git checkout develop
git pull origin develop
git merge feature/your-feature
git push origin develop
```

GitHub Actions will:
1. Run all tests
2. Build Docker images
3. Push to container registry
4. Deploy to staging environment
5. Run smoke tests

### Manual Deployment

If automatic deployment fails:

```bash
# 1. Build images locally
docker-compose build

# 2. Tag for staging
docker tag taskflow-backend:latest ghcr.io/your-org/taskflow-backend:staging
docker tag taskflow-frontend:latest ghcr.io/your-org/taskflow-frontend:staging

# 3. Push to registry
docker push ghcr.io/your-org/taskflow-backend:staging
docker push ghcr.io/your-org/taskflow-frontend:staging

# 4. Deploy to staging server
ssh staging-server
cd /opt/taskflow
docker-compose pull
docker-compose up -d
docker-compose exec backend npx prisma migrate deploy
```

### Staging Environment

- URL: https://staging.taskflow.example.com
- Database: Separate staging database
- Secrets: Staging-specific secrets
- Monitoring: Same monitoring as production

## Production Deployment

### Pre-Deployment Checklist

- [ ] All tests passing in CI/CD
- [ ] Staging deployment successful
- [ ] Database migrations tested
- [ ] Secrets configured
- [ ] Monitoring dashboards ready
- [ ] Rollback plan prepared
- [ ] Stakeholders notified

### Deployment Methods

#### Method 1: Git Tag (Recommended)

Create a version tag to trigger production deployment:

```bash
# Create and push a version tag
git checkout main
git pull origin main
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

GitHub Actions will automatically:
1. Build production images
2. Run full test suite
3. Deploy to production
4. Run smoke tests
5. Send deployment notification

#### Method 2: Manual Deployment

```bash
# 1. Build production images
docker build -t taskflow-backend:v1.0.0 ./backend
docker build -t taskflow-frontend:v1.0.0 ./frontend

# 2. Tag for production
docker tag taskflow-backend:v1.0.0 ghcr.io/your-org/taskflow-backend:v1.0.0
docker tag taskflow-frontend:v1.0.0 ghcr.io/your-org/taskflow-frontend:v1.0.0
docker tag taskflow-backend:v1.0.0 ghcr.io/your-org/taskflow-backend:latest
docker tag taskflow-frontend:v1.0.0 ghcr.io/your-org/taskflow-frontend:latest

# 3. Push to registry
docker push ghcr.io/your-org/taskflow-backend:v1.0.0
docker push ghcr.io/your-org/taskflow-frontend:v1.0.0
docker push ghcr.io/your-org/taskflow-backend:latest
docker push ghcr.io/your-org/taskflow-frontend:latest

# 4. Deploy to production
ssh production-server
cd /opt/taskflow
docker-compose pull
docker-compose up -d
docker-compose exec backend npx prisma migrate deploy
```

### Database Migrations

**IMPORTANT**: Always backup the database before running migrations in production.

```bash
# 1. Backup database
pg_dump -h localhost -U taskflow taskflow > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Run migrations
docker-compose exec backend npx prisma migrate deploy

# 3. Verify migration
docker-compose exec backend npx prisma db pull
```

### Post-Deployment Verification

```bash
# 1. Check health endpoints
curl https://taskflow.example.com/health
curl https://api.taskflow.example.com/health

# 2. Check logs
docker-compose logs -f --tail=100

# 3. Monitor error rates
# Check Sentry dashboard
# Check Grafana dashboards

# 4. Run smoke tests
npm run test:smoke

# 5. Verify key features
# - User login
# - Task creation
# - API endpoints
```

## Deployment Platforms

### Docker Compose (Simple Setup)

Best for: Small teams, low traffic

```yaml
# Production docker-compose.yml
version: '3.8'
services:
  backend:
    image: ghcr.io/your-org/taskflow-backend:latest
    restart: always
    env_file: .env.production

  frontend:
    image: ghcr.io/your-org/taskflow-frontend:latest
    restart: always

  postgres:
    image: postgres:15-alpine
    restart: always
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

### Kubernetes (Scalable)

Best for: Large deployments, high availability

```yaml
# kubernetes/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: taskflow-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: taskflow-backend
  template:
    metadata:
      labels:
        app: taskflow-backend
    spec:
      containers:
      - name: backend
        image: ghcr.io/your-org/taskflow-backend:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: taskflow-secrets
              key: database-url
        livenessProbe:
          httpGet:
            path: /health/live
            port: 3000
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 3000
```

Deploy with:
```bash
kubectl apply -f kubernetes/
kubectl rollout status deployment/taskflow-backend
```

### AWS ECS (Managed Containers)

Best for: AWS-native deployments

```json
{
  "family": "taskflow-backend",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "ghcr.io/your-org/taskflow-backend:latest",
      "memory": 512,
      "cpu": 256,
      "essential": true,
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:3000/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3
      }
    }
  ]
}
```

### Vercel (Frontend) + Railway (Backend)

Best for: Quick deployments, serverless

**Frontend (Vercel):**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod
```

**Backend (Railway):**
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### DigitalOcean App Platform

Best for: Managed PaaS, simple setup

1. Connect GitHub repository
2. Configure build settings:
   - Build Command: `npm run build`
   - Run Command: `npm start`
3. Set environment variables
4. Deploy

## Rollback Procedures

### Quick Rollback (Docker)

```bash
# 1. SSH to production server
ssh production-server

# 2. Pull previous version
docker pull ghcr.io/your-org/taskflow-backend:v0.9.0
docker pull ghcr.io/your-org/taskflow-frontend:v0.9.0

# 3. Update tags
docker tag ghcr.io/your-org/taskflow-backend:v0.9.0 taskflow-backend:latest
docker tag ghcr.io/your-org/taskflow-frontend:v0.9.0 taskflow-frontend:latest

# 4. Restart services
docker-compose up -d

# 5. Verify
curl http://localhost:3000/health
```

### Kubernetes Rollback

```bash
# Rollback to previous version
kubectl rollout undo deployment/taskflow-backend

# Rollback to specific revision
kubectl rollout history deployment/taskflow-backend
kubectl rollout undo deployment/taskflow-backend --to-revision=2

# Check status
kubectl rollout status deployment/taskflow-backend
```

### Database Rollback

```bash
# 1. Stop application
docker-compose down

# 2. Restore database backup
psql -h localhost -U taskflow taskflow < backup_20260106_120000.sql

# 3. Revert migrations
cd backend
npx prisma migrate resolve --rolled-back <migration_name>

# 4. Restart application
docker-compose up -d
```

## Troubleshooting

### Common Issues

#### 1. Service Won't Start

```bash
# Check logs
docker-compose logs backend

# Common causes:
# - Missing environment variables
# - Database connection failed
# - Port already in use

# Solutions:
docker-compose down
docker-compose up -d
```

#### 2. Database Connection Failed

```bash
# Check database status
docker-compose ps postgres

# Check connection
docker-compose exec backend npx prisma db pull

# Reset connection pool
docker-compose restart backend
```

#### 3. High Memory Usage

```bash
# Check resource usage
docker stats

# Restart services
docker-compose restart

# Scale down if needed (Kubernetes)
kubectl scale deployment/taskflow-backend --replicas=2
```

#### 4. Slow Response Times

```bash
# Check logs for slow queries
docker-compose logs backend | grep "Slow request"

# Check database performance
docker-compose exec postgres pg_stat_statements

# Review metrics
curl http://localhost:3000/metrics
```

### Health Check Failures

```bash
# Manual health check
curl -v http://localhost:3000/health

# Check individual components
curl http://localhost:3000/health/live
curl http://localhost:3000/health/ready

# View detailed health status
docker-compose exec backend node -e "console.log(require('./dist/health').healthCheck)"
```

### CI/CD Pipeline Failures

```bash
# Re-run failed workflow
gh workflow run deploy.yml

# View logs
gh run list
gh run view <run-id>

# Common fixes:
# - Update secrets in GitHub
# - Fix failing tests
# - Rebuild Docker images
```

## Monitoring After Deployment

```bash
# Watch logs in real-time
docker-compose logs -f

# Check error rate
curl http://localhost:3000/metrics | grep error

# Monitor resource usage
docker stats

# Check database connections
docker-compose exec postgres \
  psql -U taskflow -c "SELECT count(*) FROM pg_stat_activity;"
```

## Emergency Contacts

- **DevOps Lead**: devops@example.com
- **On-Call Engineer**: oncall@example.com
- **PagerDuty**: https://yourorg.pagerduty.com
- **Status Page**: https://status.taskflow.example.com

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [PostgreSQL Backup Guide](https://www.postgresql.org/docs/current/backup.html)
- [Monitoring Guide](./MONITORING.md)
- [Secrets Management Guide](./SECRETS.md)
