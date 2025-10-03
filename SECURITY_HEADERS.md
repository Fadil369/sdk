# Security Headers Configuration

## Overview

This document describes the security headers implemented in the BrainSAIT Healthcare SDK to protect against common web vulnerabilities and comply with healthcare security standards (HIPAA, NPHIES).

---

## 🛡️ Implemented Security Headers

### 1. Content Security Policy (CSP)

**Header**: `Content-Security-Policy`

**Configuration**:
```
default-src 'self'; 
script-src 'self' 'unsafe-inline'; 
style-src 'self' 'unsafe-inline'; 
img-src 'self' data: https:; 
font-src 'self' https://fonts.gstatic.com; 
connect-src 'self' https://fhir.nphies.sa https://nphies.sa
```

**Purpose**: 
- Prevents XSS (Cross-Site Scripting) attacks
- Controls which resources can be loaded
- Restricts script execution to trusted sources

**Why These Settings**:
- `default-src 'self'`: Only allow resources from same origin
- `script-src 'self' 'unsafe-inline'`: Allow inline scripts for demo functionality (should be removed in production with nonce-based CSP)
- `style-src 'self' 'unsafe-inline'`: Allow inline styles for UI framework
- `img-src 'self' data: https:`: Allow images from same origin, data URIs, and HTTPS
- `font-src`: Allow Google Fonts
- `connect-src`: Allow API calls to FHIR and NPHIES servers

**Recommendations**:
- Replace `'unsafe-inline'` with nonce-based CSP in production
- Add specific domain whitelisting instead of broad HTTPS allowance
- Consider using `report-uri` or `report-to` for CSP violation monitoring

---

### 2. X-Frame-Options

**Header**: `X-Frame-Options: DENY`

**Purpose**: 
- Prevents clickjacking attacks
- Ensures the page cannot be embedded in frames/iframes

**Why This Setting**:
- Healthcare applications should not be embedded in third-party sites
- Protects against UI redress attacks
- DENY is more restrictive than SAMEORIGIN for maximum security

**Alternatives**:
- `SAMEORIGIN`: Allow framing only on same domain (if iframe needed)
- Consider using CSP `frame-ancestors` directive instead (modern approach)

---

### 3. X-Content-Type-Options

**Header**: `X-Content-Type-Options: nosniff`

**Purpose**: 
- Prevents MIME type sniffing
- Forces browser to respect declared Content-Type

**Why This Setting**:
- Prevents execution of uploaded files with incorrect MIME types
- Protects against MIME confusion attacks
- Required for healthcare compliance

---

### 4. X-XSS-Protection

**Header**: `X-XSS-Protection: 1; mode=block`

**Purpose**: 
- Enables browser's built-in XSS filter
- Blocks page if XSS attack detected

**Why This Setting**:
- Defense-in-depth approach (backup for CSP)
- Supported by older browsers
- `mode=block` stops rendering entirely (safer than sanitizing)

**Note**: 
- Modern browsers rely on CSP instead
- This header is deprecated but still provides protection for older browsers
- Consider removing once all users are on modern browsers

---

### 5. Strict-Transport-Security (HSTS)

**Header**: `Strict-Transport-Security: max-age=31536000; includeSubDomains`

**Purpose**: 
- Forces HTTPS connections
- Prevents protocol downgrade attacks
- Required for healthcare applications

**Why These Settings**:
- `max-age=31536000`: 1 year (recommended minimum)
- `includeSubDomains`: Applies to all subdomains
- Prevents man-in-the-middle attacks on PHI/PII transmission

**Recommendations**:
- Consider adding `preload` directive and submitting to HSTS preload list
- Ensure all subdomains support HTTPS before using includeSubDomains
- Monitor for mixed content warnings

---

### 6. Referrer-Policy

**Header**: `Referrer-Policy: strict-origin-when-cross-origin`

**Purpose**: 
- Controls what referrer information is sent with requests
- Prevents information leakage through referer header

**Why This Setting**:
- `strict-origin-when-cross-origin`: Sends full URL for same-origin, only origin for cross-origin
- Balances functionality with privacy
- Prevents exposing sensitive URL parameters to third parties

**Alternatives**:
- `no-referrer`: Maximum privacy (but may break analytics)
- `same-origin`: Only send referrer for same-origin requests
- `strict-origin`: Only send origin, never full URL

---

## 🔒 CORS Configuration

### Headers

```javascript
'Access-Control-Allow-Origin': '*'
'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
'Access-Control-Max-Age': '86400'
```

### Current Configuration

**⚠️ Security Note**: The current configuration uses `*` (wildcard) for allowed origins.

**Development**: Acceptable for testing and development
**Production**: Should be restricted to specific domains

### Production Recommendations

```javascript
// Recommended production CORS configuration
const allowedOrigins = [
  'https://sdk.brainsait.com',
  'https://portal.brainsait.com',
  'https://app.brainsait.com',
];

// Dynamic origin checking
const origin = request.headers.get('origin');
const corsHeaders = {
  'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : allowedOrigins[0],
  'Access-Control-Allow-Credentials': 'true', // Only if needed with cookies
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400',
};
```

---

## 📋 Missing Headers to Consider

### 1. Permissions-Policy (formerly Feature-Policy)

```
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
```

**Purpose**: Disable browser features not needed for healthcare functionality
**Benefits**: Reduces attack surface, improves privacy

### 2. X-Permitted-Cross-Domain-Policies

```
X-Permitted-Cross-Domain-Policies: none
```

**Purpose**: Prevents Adobe Flash and PDF from loading content
**Benefits**: Additional protection against legacy vulnerabilities

### 3. Clear-Site-Data

```
Clear-Site-Data: "cache", "cookies", "storage"
```

**Purpose**: Clear browser data on logout
**Use case**: Include on logout endpoints to ensure complete session termination

---

## 🔧 Implementation

### Cloudflare Workers

Headers are set in `src/worker/index.ts`:

```typescript
const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': '...',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

// Apply to all responses
return new Response(body, {
  headers: {
    ...corsHeaders,
    ...securityHeaders,
  },
});
```

### Cloudflare Pages

For static assets, configure headers in `public/_headers`:

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  Referrer-Policy: strict-origin-when-cross-origin
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'

# API endpoints - stricter CSP
/api/*
  Content-Security-Policy: default-src 'none'; frame-ancestors 'none'

# FHIR resources - healthcare specific
/fhir/*
  Content-Security-Policy: default-src 'self'; connect-src 'self' https://fhir.nphies.sa
```

---

## 🧪 Testing Security Headers

### Online Tools

1. **Mozilla Observatory**
   - URL: https://observatory.mozilla.org/
   - Comprehensive security analysis
   - Provides letter grade and recommendations

2. **Security Headers**
   - URL: https://securityheaders.com/
   - Quick header analysis
   - Shows missing headers

3. **CSP Evaluator**
   - URL: https://csp-evaluator.withgoogle.com/
   - Validates CSP configuration
   - Identifies bypasses

### Manual Testing

```bash
# Check all headers
curl -I https://your-worker.workers.dev/

# Check specific header
curl -I https://your-worker.workers.dev/ | grep -i "strict-transport"

# Test CORS
curl -H "Origin: https://example.com" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     https://your-worker.workers.dev/api/health
```

### Automated Testing

Add to your test suite:

```typescript
describe('Security Headers', () => {
  it('should include security headers', async () => {
    const response = await fetch('https://your-worker.workers.dev/');
    
    expect(response.headers.get('x-frame-options')).toBe('DENY');
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
    expect(response.headers.get('strict-transport-security')).toContain('max-age=31536000');
    expect(response.headers.get('content-security-policy')).toBeTruthy();
  });
});
```

---

## 📊 Security Headers Scorecard

| Header | Status | Priority | Impact |
|--------|--------|----------|--------|
| Content-Security-Policy | ✅ Implemented | Critical | High |
| Strict-Transport-Security | ✅ Implemented | Critical | High |
| X-Frame-Options | ✅ Implemented | High | Medium |
| X-Content-Type-Options | ✅ Implemented | High | Medium |
| X-XSS-Protection | ✅ Implemented | Medium | Low |
| Referrer-Policy | ✅ Implemented | Medium | Medium |
| Permissions-Policy | ❌ Missing | Low | Low |
| X-Permitted-Cross-Domain-Policies | ❌ Missing | Low | Low |

---

## 🔐 HIPAA Compliance Notes

### Required Headers for HIPAA

1. **HSTS**: Required to ensure all PHI transmission is encrypted
2. **CSP**: Helps prevent XSS that could expose PHI
3. **X-Frame-Options**: Prevents unauthorized embedding of PHI
4. **X-Content-Type-Options**: Prevents MIME attacks on PHI data

### Audit Trail

All security header implementations should be:
- Documented in this file
- Tested in CI/CD pipeline
- Monitored in production
- Reviewed quarterly

---

## 📝 Maintenance

### Monthly Tasks

- [ ] Check for new security headers recommendations
- [ ] Review CSP violation reports (if configured)
- [ ] Test headers on all environments
- [ ] Update documentation

### Quarterly Tasks

- [ ] Full security header audit
- [ ] Update headers based on latest best practices
- [ ] Review and tighten CSP policies
- [ ] Validate CORS configuration

### When to Update

- New browser features require permissions control
- Security vulnerabilities discovered in current configuration
- Compliance requirements change
- New API endpoints added

---

## 🔗 References

- [OWASP Secure Headers Project](https://owasp.org/www-project-secure-headers/)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [Cloudflare Security Headers](https://developers.cloudflare.com/workers/examples/security-headers/)
- [Content Security Policy Reference](https://content-security-policy.com/)
- [HIPAA Security Rule](https://www.hhs.gov/hipaa/for-professionals/security/index.html)

---

## 🧠 Support

For questions about security headers:
- **Documentation**: See [SECURITY.md](./SECURITY.md)
- **Setup**: See [SECURITY_SETUP.md](./SECURITY_SETUP.md)
- **Email**: security@brainsait.com
