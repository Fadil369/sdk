# Quick Security Reference

## 🚀 Quick Start Security Guide

For developers who need to get started quickly while maintaining security best practices.

---

## ⚡ 5-Minute Security Setup

### 1. Clone & Install (1 min)

```bash
git clone https://github.com/Fadil369/sdk.git
cd sdk
npm ci
```

### 2. Set Up Environment (2 min)

```bash
# Copy environment template
cp .env.example .env

# Generate secure keys
openssl rand -base64 32  # Use for ENCRYPTION_KEY
openssl rand -base64 32  # Use for JWT_SECRET
openssl rand -base64 32  # Use for SESSION_SECRET

# Edit .env with your values
nano .env
```

### 3. Development Server (1 min)

```bash
# Start development server
npm run dev

# Or test Cloudflare Worker locally
npm run cf:dev
```

### 4. Pre-commit Validation (1 min)

```bash
# Husky will run automatically on commit
# Or run manually:
npm run validate
```

---

## 🔑 Essential Security Rules

### ❌ NEVER Do This

```typescript
// ❌ NEVER hardcode credentials
const mongoUri = "mongodb+srv://user:password@...";

// ❌ NEVER commit secrets
git add .env

// ❌ NEVER expose errors in production
return { error: error.stack };

// ❌ NEVER use eval
eval(userInput);

// ❌ NEVER log PHI/PII
console.log("Patient SSN:", patient.ssn);
```

### ✅ ALWAYS Do This

```typescript
// ✅ ALWAYS use environment variables
const mongoUri = process.env.MONGODB_ATLAS_URI;

// ✅ ALWAYS use .env.example
// Keep .env in .gitignore

// ✅ ALWAYS sanitize errors in production
const isDev = process.env.ENVIRONMENT === 'development';
return { 
  error: isDev ? error.message : 'An error occurred' 
};

// ✅ ALWAYS validate and sanitize input
const sanitized = validateInput(userInput);

// ✅ ALWAYS mask PHI/PII in logs
console.log("Patient:", maskPHI(patient));
```

---

## 🔒 Security Checklist for PRs

Before submitting a pull request:

- [ ] No credentials in code or config files
- [ ] `.env` is in `.gitignore`
- [ ] Error messages don't expose sensitive info
- [ ] PHI/PII is masked in logs
- [ ] Input is validated and sanitized
- [ ] Tests pass (`npm run test:ci`)
- [ ] Linting passes (`npm run lint:check`)
- [ ] Type checking passes (`npm run typecheck`)

---

## 🛡️ Common Security Patterns

### 1. Environment Variables

```typescript
// ✅ Good - with validation
function getEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

const mongoUri = getEnvVar('MONGODB_ATLAS_URI');
```

### 2. Error Handling

```typescript
// ✅ Good - sanitized errors
try {
  await riskyOperation();
} catch (error) {
  logger.error('Operation failed', error); // Full details in logs
  
  const isDev = env.ENVIRONMENT === 'development';
  return new Response(
    JSON.stringify({
      error: 'Operation Failed',
      message: isDev && error instanceof Error
        ? error.message
        : 'Please try again later',
    }),
    { status: 500 }
  );
}
```

### 3. PHI Data Handling

```typescript
// ✅ Good - masked PHI
import { PHIDataMasker } from '@/security';

const masker = new PHIDataMasker(config, logger);

// Mask before logging
logger.info('Patient data', masker.maskData(patientData));

// Encrypt before storage
const encrypted = await encryptionService.encrypt(sensitiveData);
```

### 4. Authentication & Authorization

```typescript
// ✅ Good - RBAC check
import { RBACManager } from '@/security';

const rbac = new RBACManager(logger);
const hasAccess = await rbac.validateAccess(
  userId,
  'Patient:read',
  context
);

if (!hasAccess) {
  return new Response('Forbidden', { status: 403 });
}
```

### 5. Audit Logging

```typescript
// ✅ Good - comprehensive audit log
import { HIPAAAuditLogger } from '@/security';

const auditLogger = new HIPAAAuditLogger(config, logger);
await auditLogger.logEvent({
  eventType: 'access',
  userId: user.id,
  patientId: patient.id,
  action: 'read',
  resource: 'Patient/123',
  outcome: 'success',
  ipAddress: request.headers.get('CF-Connecting-IP'),
  timestamp: new Date().toISOString(),
});
```

---

## 🔍 Security Testing

### Manual Testing

```bash
# Test security headers
curl -I https://your-app.workers.dev/ | grep -i security

# Test CORS
curl -H "Origin: https://malicious.com" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS https://your-app.workers.dev/api/health

# Test authentication
curl -H "Authorization: Bearer invalid-token" \
     https://your-app.workers.dev/api/protected
```

### Automated Testing

```typescript
// Add to your test suite
describe('Security', () => {
  it('should not expose stack traces in production', async () => {
    process.env.ENVIRONMENT = 'production';
    const response = await handleError(new Error('Test'));
    expect(response.body).not.toContain('stack');
  });

  it('should validate environment variables', () => {
    delete process.env.MONGODB_ATLAS_URI;
    expect(() => validateEnvironment()).toThrow();
  });

  it('should mask PHI in logs', () => {
    const masked = maskPHI({ ssn: '123-45-6789' });
    expect(masked.ssn).toBe('XXX-XX-6789');
  });
});
```

---

## 🚨 Security Incidents

### If You Discover a Vulnerability

1. **DO NOT** open a public GitHub issue
2. **DO** email security@brainsait.com immediately
3. **DO** include:
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### If Credentials Are Exposed

```bash
# 1. Immediately rotate all credentials
# MongoDB Atlas: Reset password
# Cloudflare: Update secrets
wrangler secret put MONGODB_ATLAS_URI

# 2. Review access logs
# Check MongoDB Atlas logs for unauthorized access

# 3. Document incident
# Follow incident response procedures

# 4. Notify security team
# Email: security@brainsait.com
```

---

## 📚 Quick Links

### Essential Docs
- [SECURITY.md](SECURITY.md) - Security policy
- [SECURITY_SETUP.md](SECURITY_SETUP.md) - Detailed setup
- [.env.example](.env.example) - Environment template

### Deployment
- [DEPLOYMENT_SECURITY_CHECKLIST.md](DEPLOYMENT_SECURITY_CHECKLIST.md)
- [SECURITY_HEADERS.md](SECURITY_HEADERS.md)

### Monitoring
- [DEPENDENCY_SECURITY.md](DEPENDENCY_SECURITY.md)
- [IMPROVEMENTS_SUMMARY.md](IMPROVEMENTS_SUMMARY.md)

---

## 🎓 Security Training

### Required Reading (30 min)
1. OWASP Top 10 - https://owasp.org/Top10/
2. HIPAA Security Rule - https://www.hhs.gov/hipaa/for-professionals/security/
3. SECURITY.md - This repository

### Recommended Tools
- **Password Manager**: 1Password, Bitwarden
- **Secret Scanning**: GitGuardian, TruffleHog
- **Security Testing**: OWASP ZAP, Burp Suite

### Security Mindset
- 🤔 **Think adversarially** - How could this be exploited?
- 🔒 **Defense in depth** - Multiple layers of security
- 📊 **Least privilege** - Minimum necessary permissions
- 🔍 **Verify everything** - Never trust, always verify

---

## 💡 Pro Tips

### Development
```bash
# Use strong random values
openssl rand -base64 32

# Check for secrets before commit
git diff --staged | grep -i "password\|secret\|key"

# Validate before pushing
npm run validate
```

### Production
```bash
# Set secrets (not environment variables)
wrangler secret put SECRET_NAME

# Test deployment
wrangler dev
curl https://localhost:8787/health

# Monitor logs
wrangler tail
```

### Security Hygiene
- 🔄 Rotate credentials quarterly
- 📝 Review security logs weekly
- 🔍 Audit dependencies monthly
- 🛡️ Update security docs as needed

---

## ⚡ Command Cheatsheet

```bash
# Development
npm run dev              # Start dev server
npm run cf:dev          # Start Cloudflare Worker locally
npm run test            # Run tests
npm run validate        # Run all checks

# Security
npm audit               # Check dependencies
npm run lint:check      # Check code style
npm run typecheck       # Check types
git secrets --scan      # Scan for secrets (if installed)

# Deployment
wrangler secret put NAME       # Set production secret
wrangler secret list          # List all secrets
wrangler deploy               # Deploy to production
wrangler tail                 # View live logs

# Monitoring
wrangler tail --format pretty  # Pretty logs
curl -I https://app.workers.dev/  # Check headers
npm audit fix                  # Fix dependencies
```

---

## 🎯 Key Takeaways

1. **Never commit secrets** - Use environment variables and secrets management
2. **Validate everything** - Input, environment, permissions
3. **Sanitize errors** - Don't expose internal details in production
4. **Mask PHI/PII** - Always protect sensitive healthcare data
5. **Log security events** - Comprehensive audit trail for HIPAA
6. **Test security** - Include security tests in your test suite
7. **Monitor continuously** - Security is ongoing, not one-time

---

## 🆘 Need Help?

- **Documentation**: Check the docs/ directory
- **Security Questions**: security@brainsait.com
- **General Support**: support@brainsait.com
- **Emergency**: Follow incident response procedures

---

**Remember**: Security is everyone's responsibility! 🛡️
