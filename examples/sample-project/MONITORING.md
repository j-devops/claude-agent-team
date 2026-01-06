# Monitoring and Alerting Guide

This document outlines the monitoring, logging, and alerting strategy for TaskFlow SaaS.

## Overview

Effective monitoring is crucial for maintaining system health and quickly identifying issues. This guide covers:
- Application metrics
- Error tracking
- Performance monitoring
- Log aggregation
- Alerting strategies

## Monitoring Stack

### Recommended Tools

| Tool | Purpose | Implementation Status |
|------|---------|----------------------|
| **Prometheus** | Metrics collection | TODO |
| **Grafana** | Metrics visualization | TODO |
| **Sentry** | Error tracking | Configured (needs activation) |
| **New Relic** | APM (Application Performance Monitoring) | Configured (needs activation) |
| **ELK Stack** | Log aggregation (Elasticsearch, Logstash, Kibana) | TODO |
| **CloudWatch** | AWS-specific monitoring | TODO |

## Metrics Collection

### Application Metrics

The backend exposes metrics at `/metrics` endpoint:

```bash
curl http://localhost:3000/metrics
```

**Available Metrics:**
- Request count (total, success, errors)
- Response times (average, percentiles)
- Status code distribution
- Database query performance
- System resources (CPU, memory, uptime)

### Custom Metrics

To add custom metrics in your code:

```typescript
import { logger } from './monitoring';

// Log an event
logger.info('User created', { userId: user.id, email: user.email });

// Track an error
logger.error('Payment processing failed', error, {
  userId: user.id,
  amount: payment.amount
});
```

## Error Tracking with Sentry

### Setup

1. Sign up for Sentry at https://sentry.io
2. Create a new project for TaskFlow
3. Get your DSN from Project Settings
4. Add to environment variables:

```bash
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

### Integration

The backend is pre-configured to initialize Sentry. Enable it by:

1. Installing Sentry SDK:
   ```bash
   cd backend
   npm install @sentry/node
   ```

2. Uncomment Sentry initialization in `backend/src/monitoring.ts`

3. All errors will automatically be sent to Sentry

### Error Context

Sentry captures:
- Error messages and stack traces
- User context (user ID, email)
- Request context (URL, headers, body)
- Environment information
- Breadcrumbs (events leading to error)

## Performance Monitoring

### New Relic APM

1. Sign up for New Relic
2. Get your license key
3. Add to environment variables:

```bash
NEW_RELIC_LICENSE_KEY=your_license_key
```

4. Install New Relic agent:
   ```bash
   cd backend
   npm install newrelic
   ```

5. Create `newrelic.js` configuration file

New Relic provides:
- Transaction tracing
- Database query analysis
- External service monitoring
- Real user monitoring (RUM)
- Custom instrumentation

### Performance Budgets

Set performance targets:
- API response time: < 200ms (p95)
- Database queries: < 50ms (p95)
- Page load time: < 2s
- Time to interactive: < 3s

## Log Aggregation

### Structured Logging

All logs use JSON format for easy parsing:

```json
{
  "level": "info",
  "message": "User logged in",
  "timestamp": "2026-01-06T12:00:00.000Z",
  "metadata": {
    "userId": "123",
    "ip": "192.168.1.1"
  }
}
```

### Log Levels

- **debug**: Detailed diagnostic information (development only)
- **info**: General informational messages
- **warn**: Warning messages (not critical)
- **error**: Error messages requiring attention

### ELK Stack Setup (Optional)

For large-scale deployments:

1. **Elasticsearch**: Store and index logs
2. **Logstash**: Parse and transform logs
3. **Kibana**: Visualize and search logs

Docker Compose example:

```yaml
elasticsearch:
  image: elasticsearch:8.11.0
  environment:
    - discovery.type=single-node
  ports:
    - 9200:9200

logstash:
  image: logstash:8.11.0
  volumes:
    - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf

kibana:
  image: kibana:8.11.0
  ports:
    - 5601:5601
  depends_on:
    - elasticsearch
```

## Health Checks

### Endpoints

| Endpoint | Purpose | Response |
|----------|---------|----------|
| `/health` | Overall health status | 200 if healthy, 503 if not |
| `/health/ready` | Readiness check | 200 if ready for traffic |
| `/health/live` | Liveness check | 200 if process is alive |

### Docker Health Checks

Configured in Dockerfiles:
- Runs every 30 seconds
- 3 retries before marking unhealthy
- 5 second timeout

### Kubernetes Health Checks

Example configuration:

```yaml
livenessProbe:
  httpGet:
    path: /health/live
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /health/ready
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 5
```

## Alerting

### Alert Channels

Configure alerts to notify:
- Slack: #alerts channel
- PagerDuty: For critical production issues
- Email: For non-critical warnings

### Alert Rules

#### Critical Alerts (Immediate Response)

- Service is down (health check fails)
- Error rate > 10%
- Database connection lost
- Disk space > 90% full
- Memory usage > 95%

#### Warning Alerts (Monitor)

- Error rate > 5%
- Response time > 500ms (p95)
- Memory usage > 80%
- Disk space > 80% full
- Unusual traffic patterns

#### Info Alerts (FYI)

- Deployments completed
- Scheduled jobs completed
- New user signups

### Alert Configuration

**Prometheus Alertmanager Example:**

```yaml
groups:
  - name: taskflow_alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} for the last 5 minutes"

      - alert: SlowResponseTime
        expr: http_request_duration_seconds{quantile="0.95"} > 0.5
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Slow response time detected"
          description: "95th percentile response time is {{ $value }}s"
```

### Slack Integration

```bash
# Webhook URL
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Send alert
curl -X POST $SLACK_WEBHOOK_URL \
  -H 'Content-Type: application/json' \
  -d '{
    "text": "🚨 High error rate detected!",
    "attachments": [{
      "color": "danger",
      "fields": [{
        "title": "Error Rate",
        "value": "12.3%",
        "short": true
      }]
    }]
  }'
```

## Dashboards

### Grafana Dashboard Setup

Create dashboards for:

1. **System Overview**
   - Request rate
   - Error rate
   - Response time
   - Active users

2. **Infrastructure**
   - CPU usage
   - Memory usage
   - Disk I/O
   - Network traffic

3. **Database**
   - Query performance
   - Connection pool
   - Lock waits
   - Replication lag

4. **Business Metrics**
   - User signups
   - Task creation rate
   - API usage by endpoint
   - Feature adoption

### Example Prometheus Queries

```promql
# Request rate
rate(http_requests_total[5m])

# Error rate
rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m])

# 95th percentile response time
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Memory usage
process_resident_memory_bytes / 1024 / 1024
```

## On-Call Procedures

### Incident Response

1. **Acknowledge**: Acknowledge alert in PagerDuty/Slack
2. **Assess**: Check dashboards and logs
3. **Diagnose**: Identify root cause
4. **Mitigate**: Apply temporary fix if needed
5. **Resolve**: Deploy permanent fix
6. **Document**: Write post-mortem

### Runbooks

Create runbooks for common issues:
- Database connection issues
- High memory usage
- Deployment rollbacks
- Cache invalidation
- Service restarts

## Monitoring Checklist

- [ ] Metrics endpoint exposed
- [ ] Sentry error tracking configured
- [ ] Structured logging implemented
- [ ] Health check endpoints working
- [ ] Alerts configured in Slack/PagerDuty
- [ ] Dashboards created in Grafana
- [ ] On-call rotation scheduled
- [ ] Runbooks documented
- [ ] Incident response process defined

## Additional Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Tutorials](https://grafana.com/tutorials/)
- [Sentry Documentation](https://docs.sentry.io/)
- [Google SRE Book](https://sre.google/books/)
- [The Twelve-Factor App](https://12factor.net/)
