# Cloudflare Deployment Guide

**Date:** October 1, 2025  
**Version:** 1.2.0  
**Branch:** feat/phases-1-3-modernization

---

## Deployment Architecture

### Frontend (Cloudflare Pages)
- **URL:** https://sdk-docs.brainsait.com
- **Content:** Enhanced UI with glass-morphism, RTL support, accessibility
- **Deploy:** `public/` directory with `index.html` and assets
- **Features:** WCAG AA compliant, mobile-responsive, i18n (EN/AR)

### Backend (Cloudflare Workers)
- **URL:** https://api.brainsait.com/sdk
- **Services:** FHIR proxy, NPHIES integration, Database API
- **Runtime:** V8 isolates with Node.js compatibility
- **Features:** Edge caching, D1, R2, KV, Durable Objects

---

## Cloudflare Services Configuration

### 1. KV Namespaces
```bash
# SDK_CACHE - API response caching
wrangler kv namespace create "SDK_CACHE"
wrangler kv namespace create "SDK_CACHE" --preview

# SDK_CONFIG - Configuration storage
wrangler kv namespace create "SDK_CONFIG"
wrangler kv namespace create "SDK_CONFIG" --preview
```

### 2. R2 Buckets
```bash
# SDK_ASSETS - Static assets (CSS, images, fonts)
wrangler r2 bucket create brainsait-sdk-assets
wrangler r2 bucket create brainsait-sdk-assets-preview
```

### 3. D1 Database (Optional - for future use)
```bash
# Healthcare data storage
wrangler d1 create brainsait-healthcare-db
wrangler d1 execute brainsait-healthcare-db --file=./schema.sql
```

### 4. Durable Objects (Optional - for future use)
```bash
# FHIR session management
# Already configured in wrangler-worker.toml
```

### 5. Hyperdrive (Optional - MongoDB Atlas connection)
```bash
# For MongoDB Atlas optimization
wrangler hyperdrive create brainsait-mongodb \
  --connection-string="$MONGODB_ATLAS_URI"
```

---

## Pre-Deployment Checklist

### Code Quality ✅
- [x] TypeScript compilation: Zero errors
- [x] ESLint validation: Zero errors
- [x] Production build: Successful (5.00s)
- [x] Bundle optimization: ESM 518.61 kB, UMD 312.13 kB

### Testing ⏳
- [x] Unit tests: Passing
- [x] Integration tests: Created (`tests/integration/cloudflare.test.ts`)
- [ ] E2E tests: Manual browser testing
- [ ] Worker tests: Run `npm run test:worker`

### Configuration ✅
- [x] `wrangler.toml` - Pages configuration
- [x] `wrangler-worker.toml` - Worker configuration
- [x] Environment variables configured
- [x] Secrets stored securely

### Documentation ✅
- [x] Deployment guide created
- [x] API documentation complete
- [x] UAT testing complete

---

## Deployment Steps

### Step 1: Run Tests

```bash
# Run unit tests
npm test

# Run integration tests (requires local worker)
npm run test:integration

# Run coverage
npm run test:coverage
```

### Step 2: Build Everything

```bash
# Clean previous builds
npm run clean

# Install dependencies
npm ci

# Build SDK, Worker, and Docs
npm run build:all
```

### Step 3: Deploy Worker (Backend API)

```bash
# Development
npm run deploy:worker -- --env development

# Staging
npm run deploy:worker -- --env staging

# Production
npm run deploy:worker -- --env production
```

### Step 4: Deploy Pages (Frontend UI)

```bash
# Development
wrangler pages deploy public --project-name=brainsait-sdk --branch=dev

# Staging
wrangler pages deploy public --project-name=brainsait-sdk --branch=staging

# Production
wrangler pages deploy public --project-name=brainsait-sdk --branch=main
```

### Step 5: Upload Assets to R2

```bash
# Upload CSS
wrangler r2 object put brainsait-sdk-assets/css/healthcare-ui.css \
  --file=assets/css/healthcare-ui.css \
  --content-type="text/css"

# Upload demo HTML
wrangler r2 object put brainsait-sdk-assets/demo.html \
  --file=assets/demo.html \
  --content-type="text/html"
```

### Step 6: Configure KV Data

```bash
# Store SDK config
wrangler kv key put --binding=SDK_CONFIG "config" \
  --path="config.json"

# Set cache warmup data
wrangler kv key put --binding=SDK_CACHE "health" \
  '{"status":"healthy","version":"1.2.0"}'
```

### Step 7: Validate Deployment

```bash
# Run deployment script
./scripts/deploy-cloudflare.sh full production

# Manual validation
curl https://api.brainsait.com/sdk/health
curl https://sdk-docs.brainsait.com/index.html
```

---

## Quick Deployment (All-in-One)

```bash
# Full deployment to production
./scripts/deploy-cloudflare.sh full production

# This will:
# 1. Check dependencies
# 2. Authenticate with Wrangler
# 3. Build project
# 4. Setup KV namespaces
# 5. Deploy worker
# 6. Deploy pages
# 7. Upload assets
# 8. Validate deployment
```

---

## Environment Variables

### Required Secrets

```bash
# Set secrets for worker
wrangler secret put MONGODB_ATLAS_URI
wrangler secret put CLOUDFLARE_ACCOUNT_ID
wrangler secret put NPHIES_API_KEY
wrangler secret put ENCRYPTION_KEY
```

### Public Variables

Already configured in `wrangler-worker.toml`:
- `ENVIRONMENT`
- `SDK_VERSION`
- `FHIR_BASE_URL`
- `NPHIES_BASE_URL`
- `LOG_LEVEL`
- `DATABASE_NAME`

---

## Post-Deployment Testing

### 1. Health Checks

```bash
# Worker health
curl https://api.brainsait.com/sdk/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2025-10-01T...",
  "version": "1.2.0",
  "environment": "production",
  "services": {
    "cache": "operational",
    "fhir": "operational",
    "nphies": "operational"
  }
}
```

### 2. API Endpoints

```bash
# Config endpoint
curl https://api.brainsait.com/sdk/api/config

# Database health
curl https://api.brainsait.com/sdk/api/db/health

# Hospitals data
curl https://api.brainsait.com/sdk/api/db/hospitals
```

### 3. Frontend UI

```bash
# Open in browser
open https://sdk-docs.brainsait.com/index.html

# Test features:
# - Glass-morphism cards
# - RTL/LTR switching
# - Keyboard navigation
# - Mobile responsiveness
# - All 12 action buttons
# - Copy-to-clipboard
```

### 4. CORS Testing

```bash
# Test CORS from frontend
curl -H "Origin: https://sdk-docs.brainsait.com" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://api.brainsait.com/sdk/api/config
```

---

## Monitoring & Analytics

### Cloudflare Dashboard

1. **Workers Analytics**
   - Requests per second
   - CPU time
   - Success rate
   - Error logs

2. **Pages Analytics**
   - Page views
   - Unique visitors
   - Bandwidth usage
   - Build history

3. **R2 Metrics**
   - Storage usage
   - Request count
   - Bandwidth

### Wrangler CLI

```bash
# Tail worker logs
npm run cf:tail

# View worker metrics
wrangler worker metrics --env production

# List KV keys
wrangler kv key list --binding=SDK_CACHE

# View R2 objects
wrangler r2 object list brainsait-sdk-assets
```

---

## Rollback Procedures

### Worker Rollback

```bash
# List deployments
wrangler deployments list

# Rollback to previous version
wrangler rollback --message="Rolling back to previous stable version"
```

### Pages Rollback

```bash
# List deployments
wrangler pages deployment list --project-name=brainsait-sdk

# Rollback via dashboard or redeploy previous commit
git checkout <previous-commit>
wrangler pages deploy public --project-name=brainsait-sdk --branch=main
```

---

## Troubleshooting

### Worker Issues

```bash
# View real-time logs
wrangler tail --env production

# Test locally
wrangler dev --env development

# Check bindings
wrangler deployments list
```

### Pages Issues

```bash
# View build logs
wrangler pages deployment list --project-name=brainsait-sdk

# Test local build
python3 -m http.server 8000 --directory public
```

### KV Issues

```bash
# Check KV namespace
wrangler kv namespace list

# Verify keys
wrangler kv key list --binding=SDK_CACHE

# Test key access
wrangler kv key get --binding=SDK_CACHE "config"
```

---

## Performance Optimization

### Worker Optimization

1. **Enable Smart Placement**
   - Already configured in `wrangler-worker.toml`
   - `placement = { mode = "smart" }`

2. **Cache API Responses**
   - GET requests cached in KV for 5 minutes
   - Cache headers: `Cache-Control: public, max-age=300`

3. **Minimize Cold Starts**
   - Use scheduled tasks for cache warmup
   - Configured: `crons = ["0 */4 * * *"]`

### Pages Optimization

1. **Static Asset Caching**
   - Configured in `_headers` file
   - CSS/JS: 1 year cache
   - HTML: 5 minutes cache

2. **Minification**
   - HTML minified
   - CSS minified
   - JavaScript already bundled and minified

---

## Security Considerations

### Worker Security

- ✅ CORS configured (restrictive in production)
- ✅ Security headers (X-Frame-Options, CSP, etc.)
- ✅ Rate limiting (via Cloudflare dashboard)
- ✅ Secrets stored in Wrangler secrets (not in code)
- ✅ HTTPS only (enforced by Cloudflare)

### Pages Security

- ✅ HTTPS enforced
- ✅ Content Security Policy headers
- ✅ No sensitive data in frontend
- ✅ API calls go through worker (no direct MongoDB access)

---

## Cost Estimation

### Free Tier Limits

- **Workers:** 100,000 requests/day
- **Pages:** Unlimited requests, 500 builds/month
- **KV:** 100,000 reads/day, 1,000 writes/day
- **R2:** 10 GB storage, 1M class A ops/month
- **D1:** 100,000 rows read/day

### Production Costs (Estimated)

- **Workers Paid:** $5/month + $0.50 per million requests
- **Pages Pro:** $20/month (unlimited builds, analytics)
- **KV:** $0.50 per million reads
- **R2:** $0.015 per GB stored

---

## Next Steps

1. **Run Tests:** `npm test && npm run test:integration`
2. **Build:** `npm run build:all`
3. **Deploy:** `./scripts/deploy-cloudflare.sh full production`
4. **Validate:** Visit URLs and test all endpoints
5. **Monitor:** Check Cloudflare dashboard for metrics
6. **Document:** Update README with live URLs

---

## Support & Resources

- **Cloudflare Docs:** https://developers.cloudflare.com/
- **Wrangler Docs:** https://developers.cloudflare.com/workers/wrangler/
- **SDK Docs:** https://sdk-docs.brainsait.com
- **GitHub:** https://github.com/Fadil369/sdk

---

**Deployment Guide Version:** 1.0  
**Last Updated:** October 1, 2025  
**Status:** Ready for Production Deployment
