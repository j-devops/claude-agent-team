/**
 * Monitoring and Observability Setup
 * This file configures monitoring, metrics, and alerting for the application
 */

import { Request, Response, NextFunction } from 'express';

// Metrics interface for tracking application performance
export interface Metrics {
  requests: {
    total: number;
    success: number;
    errors: number;
    byStatus: Record<number, number>;
  };
  responseTime: {
    total: number;
    count: number;
    average: number;
  };
  database: {
    queries: number;
    errors: number;
    avgResponseTime: number;
  };
}

// In-memory metrics store (for demo - use Prometheus/CloudWatch in production)
const metrics: Metrics = {
  requests: {
    total: 0,
    success: 0,
    errors: 0,
    byStatus: {}
  },
  responseTime: {
    total: 0,
    count: 0,
    average: 0
  },
  database: {
    queries: 0,
    errors: 0,
    avgResponseTime: 0
  }
};

/**
 * Middleware to track request metrics
 */
export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  // Track request
  metrics.requests.total++;

  // Capture response
  res.on('finish', () => {
    const duration = Date.now() - startTime;

    // Update response time metrics
    metrics.responseTime.total += duration;
    metrics.responseTime.count++;
    metrics.responseTime.average = metrics.responseTime.total / metrics.responseTime.count;

    // Update status code metrics
    const statusCode = res.statusCode;
    metrics.requests.byStatus[statusCode] = (metrics.requests.byStatus[statusCode] || 0) + 1;

    // Track success vs errors
    if (statusCode >= 200 && statusCode < 400) {
      metrics.requests.success++;
    } else if (statusCode >= 400) {
      metrics.requests.errors++;
    }

    // Log slow requests (>1s)
    if (duration > 1000) {
      console.warn(`Slow request detected: ${req.method} ${req.path} took ${duration}ms`);
    }
  });

  next();
};

/**
 * Endpoint to expose metrics (for Prometheus scraping or monitoring dashboards)
 */
export const getMetrics = (req: Request, res: Response) => {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();

  res.json({
    metrics,
    system: {
      uptime: Math.floor(uptime),
      memory: {
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        rss: Math.round(memoryUsage.rss / 1024 / 1024),
        external: Math.round(memoryUsage.external / 1024 / 1024)
      },
      nodeVersion: process.version,
      platform: process.platform
    },
    timestamp: new Date().toISOString()
  });
};

/**
 * Error tracking configuration
 * Integrate with Sentry, Rollbar, or similar service
 */
export const initErrorTracking = () => {
  if (process.env.SENTRY_DSN) {
    // TODO: @backend-architect - Initialize Sentry
    // import * as Sentry from '@sentry/node';
    // Sentry.init({
    //   dsn: process.env.SENTRY_DSN,
    //   environment: process.env.NODE_ENV,
    //   tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    // });
    console.log('Error tracking initialized');
  }
};

/**
 * APM (Application Performance Monitoring) configuration
 * Integrate with New Relic, DataDog, or similar service
 */
export const initAPM = () => {
  if (process.env.NEW_RELIC_LICENSE_KEY) {
    // TODO: @backend-architect - Initialize New Relic
    // require('newrelic');
    console.log('APM initialized');
  }
};

/**
 * Custom logging with structured format
 */
export interface LogEntry {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export const logger = {
  info: (message: string, metadata?: Record<string, unknown>) => {
    const entry: LogEntry = {
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      metadata
    };
    console.log(JSON.stringify(entry));
  },

  warn: (message: string, metadata?: Record<string, unknown>) => {
    const entry: LogEntry = {
      level: 'warn',
      message,
      timestamp: new Date().toISOString(),
      metadata
    };
    console.warn(JSON.stringify(entry));
  },

  error: (message: string, error?: Error, metadata?: Record<string, unknown>) => {
    const entry: LogEntry = {
      level: 'error',
      message,
      timestamp: new Date().toISOString(),
      metadata: {
        ...metadata,
        error: error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : undefined
      }
    };
    console.error(JSON.stringify(entry));
  },

  debug: (message: string, metadata?: Record<string, unknown>) => {
    if (process.env.NODE_ENV !== 'production' || process.env.LOG_LEVEL === 'debug') {
      const entry: LogEntry = {
        level: 'debug',
        message,
        timestamp: new Date().toISOString(),
        metadata
      };
      console.debug(JSON.stringify(entry));
    }
  }
};

/**
 * Alert configuration
 * Define thresholds for automatic alerts
 */
export const checkAlerts = () => {
  const errorRate = metrics.requests.total > 0
    ? (metrics.requests.errors / metrics.requests.total) * 100
    : 0;

  // Alert if error rate exceeds 5%
  if (errorRate > 5) {
    logger.error('High error rate detected', undefined, {
      errorRate,
      totalRequests: metrics.requests.total,
      errors: metrics.requests.errors
    });
    // TODO: Send alert to Slack, PagerDuty, etc.
  }

  // Alert if average response time exceeds 500ms
  if (metrics.responseTime.average > 500) {
    logger.warn('High response time detected', {
      averageResponseTime: metrics.responseTime.average
    });
  }

  // Alert if memory usage exceeds 80%
  const memUsage = process.memoryUsage();
  const memPercentage = (memUsage.heapUsed / memUsage.heapTotal) * 100;
  if (memPercentage > 80) {
    logger.warn('High memory usage detected', {
      percentage: memPercentage,
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024)
    });
  }
};

// Run alert checks every 60 seconds
if (process.env.ENABLE_METRICS === 'true') {
  setInterval(checkAlerts, 60000);
}
