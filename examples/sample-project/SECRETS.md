# Secrets Management Guide

This document outlines how to manage secrets and sensitive configuration for TaskFlow SaaS.

## Overview

**NEVER commit secrets to version control.** All sensitive data should be managed through environment variables or a dedicated secrets management system.

## Local Development

For local development, create a `.env` file in the project root:

```bash
cp .env.example .env
```

Then customize the values. This file is gitignored and will not be committed.

## GitHub Secrets

The following secrets must be configured in GitHub Settings > Secrets and variables > Actions:

### Required Secrets

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `POSTGRES_PASSWORD` | Production database password | Strong random password |
| `JWT_SECRET` | JWT signing secret | Strong random string (32+ chars) |
| `VITE_API_URL` | Production API URL | `https://api.taskflow.example.com` |
| `CORS_ORIGIN` | Allowed CORS origin | `https://taskflow.example.com` |

### Optional Secrets (for monitoring)

| Secret Name | Description |
|-------------|-------------|
| `SENTRY_DSN` | Sentry error tracking DSN |
| `NEW_RELIC_LICENSE_KEY` | New Relic APM license key |

### Setting GitHub Secrets

1. Go to your repository on GitHub
2. Navigate to Settings > Secrets and variables > Actions
3. Click "New repository secret"
4. Add each secret from the table above

## Secrets Management Systems

For production deployments, consider using a dedicated secrets management system:

### Option 1: AWS Secrets Manager

```bash
# Store secret
aws secretsmanager create-secret \
  --name taskflow/production/jwt-secret \
  --secret-string "your-secret-value"

# Retrieve secret in application
AWS_SECRET=$(aws secretsmanager get-secret-value \
  --secret-id taskflow/production/jwt-secret \
  --query SecretString \
  --output text)
```

### Option 2: HashiCorp Vault

```bash
# Store secret
vault kv put secret/taskflow/production jwt_secret="your-secret-value"

# Retrieve secret
vault kv get -field=jwt_secret secret/taskflow/production
```

### Option 3: Kubernetes Secrets

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: taskflow-secrets
type: Opaque
data:
  jwt-secret: <base64-encoded-secret>
  postgres-password: <base64-encoded-password>
```

## Generating Strong Secrets

Use these commands to generate cryptographically secure secrets:

```bash
# Generate JWT secret (32 bytes, base64 encoded)
openssl rand -base64 32

# Generate database password (24 characters)
openssl rand -base64 24

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Using Python
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

## Environment-Specific Configuration

### Development
- Uses `.env.development` with safe defaults
- Secrets can be weak for local testing
- Database runs in Docker container

### Staging
- Uses `.env.staging`
- Secrets should be production-strength
- Mirrors production setup

### Production
- Uses `.env.production`
- All secrets MUST be strong and unique
- Use secrets management system
- Enable all security features

## Security Best Practices

1. **Rotate secrets regularly** - Change JWT secrets and passwords periodically
2. **Use different secrets per environment** - Never reuse production secrets in staging/dev
3. **Limit access** - Only grant access to secrets to those who need it
4. **Audit access** - Monitor who accesses secrets and when
5. **Encrypt at rest** - Use encryption for stored secrets
6. **Use short-lived tokens** - Keep JWT expiration times reasonable
7. **Implement secret scanning** - Use tools to detect accidentally committed secrets

## Secret Rotation

To rotate the JWT secret without downtime:

1. Generate a new secret
2. Add both old and new secrets to the application (support both)
3. Deploy the change
4. Update the primary secret to the new one
5. Wait for all existing tokens to expire
6. Remove the old secret

## Emergency Response

If a secret is compromised:

1. **Immediately rotate the secret** in all environments
2. **Revoke all active sessions** if JWT secret was compromised
3. **Review access logs** to determine scope of compromise
4. **Notify stakeholders** as required by your incident response policy
5. **Update documentation** with lessons learned

## Tools

### Git Secrets Prevention

Install `git-secrets` to prevent committing secrets:

```bash
# Install
brew install git-secrets  # macOS
# or
apt-get install git-secrets  # Linux

# Initialize in repository
cd /path/to/taskflow-saas
git secrets --install
git secrets --register-aws
```

### Pre-commit Hooks

Add to `.pre-commit-config.yaml`:

```yaml
repos:
  - repo: https://github.com/Yelp/detect-secrets
    rev: v1.4.0
    hooks:
      - id: detect-secrets
        args: ['--baseline', '.secrets.baseline']
```

## Support

For questions about secrets management, contact the DevOps team or refer to your organization's security policies.
