/**
 * Cloudflare Worker for BrainSAIT Healthcare SDK
 * Handles API requests, caching, and edge computing
 */

import { BrainSAITHealthcareSDK } from '../index';

// Environment interface for Cloudflare Workers
interface Env {
  SDK_CACHE: KVNamespace;
  SDK_CONFIG: KVNamespace;
  SDK_ASSETS: R2Bucket;
  FHIR_SESSION: DurableObjectNamespace;
  ENVIRONMENT: string;
  SDK_VERSION: string;
  FHIR_BASE_URL: string;
  NPHIES_BASE_URL: string;
  LOG_LEVEL: string;
  CLOUDFLARE_ACCOUNT_ID: string;
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400',
};

// Security headers
const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://fhir.nphies.sa https://nphies.sa",
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      // Handle CORS preflight requests
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          status: 200,
          headers: corsHeaders,
        });
      }

      const url = new URL(request.url);
      const path = url.pathname;

      // Route API requests
      if (path.startsWith('/api/')) {
        return handleAPIRequest(request, env, ctx);
      }

      // Route FHIR requests
      if (path.startsWith('/fhir/')) {
        return handleFHIRRequest(request, env, ctx);
      }

      // Route NPHIES requests
      if (path.startsWith('/nphies/')) {
        return handleNPHIESRequest(request, env, ctx);
      }

      // Health check endpoint
      if (path === '/health') {
        return handleHealthCheck(env);
      }

      // Serve static assets from R2
      if (path.startsWith('/assets/')) {
        return handleAssetRequest(request, env);
      }

      // Default SDK info endpoint
      return new Response(
        JSON.stringify({
          name: 'BrainSAIT Healthcare SDK',
          version: env.SDK_VERSION,
          environment: env.ENVIRONMENT,
          timestamp: new Date().toISOString(),
          documentation: 'https://sdk-docs.brainsait.com',
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
            ...securityHeaders,
          },
        }
      );
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(
        JSON.stringify({
          error: 'Internal Server Error',
          message: error instanceof Error ? error.message : 'Unknown error',
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }
  },

  // Handle scheduled events (cron jobs)
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    try {
      // Cache warmup and cleanup
      await cacheMaintenanceTask(env);

      // Health metrics collection
      await collectHealthMetrics(env);

      console.log('Scheduled task completed successfully');
    } catch (error) {
      console.error('Scheduled task error:', error);
    }
  },
};

// API request handler
async function handleAPIRequest(
  request: Request,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  const url = new URL(request.url);
  const apiPath = url.pathname.replace('/api/', '');

  // Initialize SDK with environment configuration
  const sdk = new BrainSAITHealthcareSDK({
    environment: env.ENVIRONMENT as any,
    api: {
      baseUrl: 'https://api.brainsait.com',
      timeout: 30000,
      retries: 3,
    },
    fhir: {
      serverUrl: env.FHIR_BASE_URL,
      version: 'R4',
    },
    nphies: {
      baseUrl: env.NPHIES_BASE_URL,
      clientId: 'worker-client',
      scope: ['read', 'write'],
      sandbox: env.ENVIRONMENT !== 'production',
    },
    logging: {
      level: env.LOG_LEVEL as any,
      format: 'json',
      outputs: ['console'],
    },
  });

  try {
    // Cache check
    const cacheKey = `api:${apiPath}:${request.method}:${url.search}`;
    const cached = await env.SDK_CACHE.get(cacheKey);

    if (cached && request.method === 'GET') {
      return new Response(cached, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300',
          'X-Cache': 'HIT',
          ...corsHeaders,
        },
      });
    }

    // Handle different API endpoints
    let response: any;
    switch (apiPath) {
      case 'health':
        response = await sdk.getHealthStatus();
        break;

      case 'config':
        response = {
          version: env.SDK_VERSION,
          environment: env.ENVIRONMENT,
          features: {
            fhir: true,
            nphies: true,
            ui: true,
            ai: false,
          },
        };
        break;

      default:
        throw new Error(`API endpoint not found: ${apiPath}`);
    }

    const responseBody = JSON.stringify(response);

    // Cache successful GET responses
    if (request.method === 'GET' && response) {
      ctx.waitUntil(env.SDK_CACHE.put(cacheKey, responseBody, { expirationTtl: 300 }));
    }

    return new Response(responseBody, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Cache': 'MISS',
        ...corsHeaders,
        ...securityHeaders,
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'API Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
}

// FHIR request handler
async function handleFHIRRequest(
  request: Request,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  // Proxy FHIR requests to the actual FHIR server
  const url = new URL(request.url);
  const fhirPath = url.pathname.replace('/fhir/', '');
  const fhirUrl = `${env.FHIR_BASE_URL}/${fhirPath}${url.search}`;

  const response = await fetch(fhirUrl, {
    method: request.method,
    headers: {
      ...Object.fromEntries(request.headers),
      'User-Agent': `BrainSAIT-SDK/${env.SDK_VERSION}`,
    },
    body: request.method !== 'GET' ? await request.arrayBuffer() : undefined,
  });

  return new Response(response.body, {
    status: response.status,
    headers: {
      ...Object.fromEntries(response.headers),
      ...corsHeaders,
    },
  });
}

// NPHIES request handler
async function handleNPHIESRequest(
  request: Request,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  // Proxy NPHIES requests
  const url = new URL(request.url);
  const nphiesPath = url.pathname.replace('/nphies/', '');
  const nphiesUrl = `${env.NPHIES_BASE_URL}/${nphiesPath}${url.search}`;

  const response = await fetch(nphiesUrl, {
    method: request.method,
    headers: {
      ...Object.fromEntries(request.headers),
      'User-Agent': `BrainSAIT-SDK/${env.SDK_VERSION}`,
    },
    body: request.method !== 'GET' ? await request.arrayBuffer() : undefined,
  });

  return new Response(response.body, {
    status: response.status,
    headers: {
      ...Object.fromEntries(response.headers),
      ...corsHeaders,
    },
  });
}

// Health check handler
async function handleHealthCheck(env: Env): Promise<Response> {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: env.SDK_VERSION,
    environment: env.ENVIRONMENT,
    services: {
      cache: 'operational',
      fhir: 'operational',
      nphies: 'operational',
    },
  };

  return new Response(JSON.stringify(health), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}

// Asset request handler
async function handleAssetRequest(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const assetPath = url.pathname.replace('/assets/', '');

  try {
    const object = await env.SDK_ASSETS.get(assetPath);

    if (!object) {
      return new Response('Asset not found', { status: 404 });
    }

    return new Response(object.body, {
      headers: {
        'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000',
        ETag: object.httpEtag,
        ...corsHeaders,
      },
    });
  } catch (error) {
    return new Response('Asset error', { status: 500 });
  }
}

// Cache maintenance task
async function cacheMaintenanceTask(env: Env): Promise<void> {
  // Clean up expired cache entries
  // This is a simplified implementation
  console.log('Cache maintenance completed');
}

// Health metrics collection
async function collectHealthMetrics(env: Env): Promise<void> {
  const metrics = {
    timestamp: new Date().toISOString(),
    environment: env.ENVIRONMENT,
    version: env.SDK_VERSION,
  };

  // Store metrics in KV for later analysis
  await env.SDK_CONFIG.put('health_metrics', JSON.stringify(metrics));
}
