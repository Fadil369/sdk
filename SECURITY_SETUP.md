# Security Setup Guide

## 🔐 Critical: First-Time Setup

This guide ensures your BrainSAIT Healthcare SDK deployment is secure and compliant with HIPAA, NPHIES, and Saudi data protection standards.

---

## 🚨 Immediate Actions Required

### 1. Rotate Exposed Credentials

**⚠️ CRITICAL**: If you cloned this repository before the security fix, database credentials were exposed in `wrangler-worker.toml`. You must:

1. **Rotate MongoDB credentials immediately**:
   ```bash
   # Login to MongoDB Atlas
   # Navigate to Database Access → Edit User → Reset Password
   # Update your secrets (see step 3 below)
   ```

2. **Review MongoDB access logs** for any unauthorized access:
   ```bash
   # In MongoDB Atlas Console:
   # Security → Database Access Logs
   # Look for unexpected IP addresses or access patterns
   ```

3. **Update Cloudflare Workers secrets**:
   ```bash
   wrangler secret put MONGODB_ATLAS_URI
   # Paste your NEW MongoDB connection string when prompted
   ```

---

## 🔑 Secret Management

### For Cloudflare Workers (Production)

Never store secrets in code or configuration files. Use Cloudflare Workers Secrets:

```bash
# Set production secrets
wrangler secret put MONGODB_ATLAS_URI
wrangler secret put NPHIES_CLIENT_SECRET
wrangler secret put ENCRYPTION_KEY
wrangler secret put JWT_SECRET
wrangler secret put SESSION_SECRET

# Verify secrets are set
wrangler secret list
```

### For Local Development

1. **Copy the example environment file**:
   ```bash
   cp .env.example .env
   ```

2. **Fill in actual values** (never commit this file):
   ```bash
   # Edit .env with your development credentials
   nano .env
   ```

3. **Generate secure keys**:
   ```bash
   # Generate encryption key
   openssl rand -base64 32
   
   # Generate JWT secret
   openssl rand -base64 32
   
   # Generate session secret
   openssl rand -base64 32
   ```

---

## 🛡️ Environment-Specific Configuration

### Production Environment

```toml
# wrangler-worker.toml [vars] section
ENVIRONMENT = "production"
LOG_LEVEL = "info"
FHIR_BASE_URL = "https://fhir.nphies.sa"
NPHIES_BASE_URL = "https://nphies.sa"
```

**Required Secrets** (via `wrangler secret put`):
- `MONGODB_ATLAS_URI`
- `NPHIES_CLIENT_SECRET`
- `ENCRYPTION_KEY`
- `JWT_SECRET`

### Development Environment

```bash
# .env file for local development
ENVIRONMENT=development
LOG_LEVEL=debug
FHIR_BASE_URL=https://fhir-sandbox.nphies.sa
NPHIES_BASE_URL=https://nphies-sandbox.sa
```

---

## 🔒 Database Security

### MongoDB Atlas Security Checklist

- [ ] **Network Access**: Restrict IP addresses (no 0.0.0.0/0)
- [ ] **Database Users**: Use strong, unique passwords (min 32 characters)
- [ ] **Authentication**: Enable MongoDB authentication
- [ ] **Encryption**: Enable encryption at rest
- [ ] **Backup**: Configure automated backups (7-day retention minimum)
- [ ] **Audit Logs**: Enable database audit logging
- [ ] **Monitoring**: Set up alerts for unusual access patterns

### Recommended MongoDB Atlas Settings

```javascript
// Connection String Format (use environment variables)
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority&appName=<app>

// Security Options
{
  ssl: true,
  authSource: 'admin',
  retryWrites: true,
  w: 'majority',
  readPreference: 'primaryPreferred'
}
```

---

## 🔐 Encryption Standards

### Data at Rest
- **Algorithm**: AES-256-GCM
- **Key Rotation**: Every 90 days
- **Key Storage**: Cloudflare Workers Secrets or AWS KMS

### Data in Transit
- **TLS Version**: 1.3+ only
- **Cipher Suites**: Strong ciphers only (no RC4, DES, 3DES)
- **Certificate**: Valid SSL/TLS certificate from trusted CA

### PHI/PII Encryption

```typescript
// Example: Encrypting PHI before storage
import { EncryptionService } from './src/security';

const encryptionService = new EncryptionService(config);
const encryptedData = await encryptionService.encrypt(sensitiveData);
```

---

## 👥 Access Control

### Role-Based Access Control (RBAC)

Minimum roles required:

1. **System Administrator**: Full access
2. **Healthcare Provider**: Patient data access
3. **Billing Staff**: Financial data access
4. **Audit Reviewer**: Read-only audit logs
5. **API Consumer**: Limited API access

### Implementation

```typescript
// Example: Validating user permissions
import { RBACManager } from './src/security';

const rbacManager = new RBACManager(logger);
const hasAccess = await rbacManager.validateAccess(userId, 'Patient:read', context);
```

---

## 📊 Audit Logging

### HIPAA Compliance Requirements

All PHI access must be logged with:
- User ID and role
- Timestamp (ISO 8601)
- Action performed (read/write/delete)
- Resource accessed
- IP address
- Result (success/failure)

### Configuration

```typescript
// Example: Audit logging
import { HIPAAAuditLogger } from './src/security';

const auditLogger = new HIPAAAuditLogger(config, logger);
await auditLogger.logEvent({
  eventType: 'access',
  userId: 'user123',
  patientId: 'patient456',
  action: 'read',
  resource: 'Patient/patient456',
  outcome: 'success'
});
```

---

## 🚀 Deployment Security Checklist

### Pre-Deployment

- [ ] All secrets stored in Cloudflare Workers Secrets
- [ ] No credentials in code or configuration files
- [ ] Dependencies updated (no critical vulnerabilities)
- [ ] Security headers configured
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Error messages don't expose sensitive info

### Post-Deployment

- [ ] Verify secrets are accessible
- [ ] Test authentication flows
- [ ] Validate RBAC permissions
- [ ] Check audit logs are being generated
- [ ] Monitor error rates
- [ ] Test backup and recovery procedures

### Cloudflare Workers Security

```bash
# Deploy with security checks
npm run validate:prod
wrangler deploy --config wrangler-worker.toml

# Verify deployment
curl -I https://your-worker.workers.dev/health
```

---

## 🔍 Monitoring & Incident Response

### Security Monitoring

1. **Real-time Alerts**:
   - Failed authentication attempts (>5 in 5 minutes)
   - Unusual API access patterns
   - Database connection errors
   - Encryption/decryption failures

2. **Daily Reviews**:
   - Audit log analysis
   - Access pattern review
   - Error rate trends
   - Performance metrics

3. **Weekly Reviews**:
   - Dependency vulnerability scans
   - Security patch status
   - Backup integrity tests

### Incident Response

If you suspect a security breach:

1. **Immediately**:
   - Rotate all credentials
   - Review access logs
   - Isolate affected systems

2. **Within 24 hours**:
   - Contact: security@brainsait.com
   - Document timeline
   - Assess impact

3. **Follow-up**:
   - Implement fixes
   - Update security policies
   - Conduct post-mortem

---

## 📚 Additional Resources

- [HIPAA Security Rule](https://www.hhs.gov/hipaa/for-professionals/security/index.html)
- [NPHIES Compliance Guide](https://nphies.gov.sa/)
- [Cloudflare Workers Security](https://developers.cloudflare.com/workers/platform/security/)
- [MongoDB Atlas Security](https://www.mongodb.com/docs/atlas/security/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

---

## 🧠 Support

For security-related questions:
- **Email**: security@brainsait.com
- **Emergency**: Contact immediately for suspected breaches
- **Documentation**: See [SECURITY.md](./SECURITY.md)

---

> **Remember**: Security is not a one-time setup. Regularly review and update your security posture.
