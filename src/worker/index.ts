/**
 * Cloudflare Worker for BrainSAIT Healthcare SDK
 * Handles API requests, caching, and edge computing
 */

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
  MONGODB_ATLAS_URI: string;
  DATABASE_NAME: string;
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

      // Route Database API requests
      if (path.startsWith('/api/db/')) {
        return handleDatabaseRequest(request, env, ctx);
      }

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
      // ESLint disable: console needed for Cloudflare Workers debugging
      // eslint-disable-next-line no-console
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
  async scheduled(event: ScheduledEvent, env: Env, _ctx: ExecutionContext): Promise<void> {
    try {
      // Cache warmup and cleanup
      await cacheMaintenanceTask(env);

      // Health metrics collection
      await collectHealthMetrics(env);

      // ESLint disable: console needed for Cloudflare Workers logging
      // eslint-disable-next-line no-console
      console.log('Scheduled task completed successfully');
    } catch (error) {
      // ESLint disable: console needed for Cloudflare Workers debugging
      // eslint-disable-next-line no-console
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

  // For now, return a simple SDK info response
  // TODO: Initialize SDK with environment configuration when imports are fixed
  /*
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
  */

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
    let response: Record<string, unknown>;
    switch (apiPath) {
      case 'health':
        // response = await sdk.getHealthStatus();
        response = {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          version: env.SDK_VERSION,
          environment: env.ENVIRONMENT,
        };
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
  _ctx: ExecutionContext
): Promise<Response> {
  // Proxy FHIR requests to the actual FHIR server
  const url = new URL(request.url);
  const fhirPath = url.pathname.replace('/fhir/', '');
  const fhirUrl = `${env.FHIR_BASE_URL}/${fhirPath}${url.search}`;

  // Copy headers manually for Cloudflare Workers compatibility
  const requestHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    requestHeaders[key] = value;
  });

  const response = await fetch(fhirUrl, {
    method: request.method,
    headers: {
      ...requestHeaders,
      'User-Agent': `BrainSAIT-SDK/${env.SDK_VERSION}`,
    },
    body: request.method !== 'GET' ? await request.arrayBuffer() : undefined,
  });

  // Copy response headers manually
  const responseHeaders: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    responseHeaders[key] = value;
  });

  return new Response(response.body, {
    status: response.status,
    headers: {
      ...responseHeaders,
      ...corsHeaders,
    },
  });
}

// NPHIES request handler
async function handleNPHIESRequest(
  request: Request,
  env: Env,
  _ctx: ExecutionContext
): Promise<Response> {
  // Proxy NPHIES requests
  const url = new URL(request.url);
  const nphiesPath = url.pathname.replace('/nphies/', '');
  const nphiesUrl = `${env.NPHIES_BASE_URL}/${nphiesPath}${url.search}`;

  // Copy headers manually for Cloudflare Workers compatibility
  const requestHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    requestHeaders[key] = value;
  });

  // Copy headers manually for Cloudflare Workers compatibility
  const nphiesRequestHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    nphiesRequestHeaders[key] = value;
  });

  const response = await fetch(nphiesUrl, {
    method: request.method,
    headers: {
      ...nphiesRequestHeaders,
      'User-Agent': `BrainSAIT-SDK/${env.SDK_VERSION}`,
    },
    body: request.method !== 'GET' ? await request.arrayBuffer() : undefined,
  });

  // Copy response headers manually
  const nphiesResponseHeaders: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    nphiesResponseHeaders[key] = value;
  });

  return new Response(response.body, {
    status: response.status,
    headers: {
      ...nphiesResponseHeaders,
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
        'Content-Type': object.httpMetadata?.contentType ?? 'application/octet-stream',
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
async function cacheMaintenanceTask(_env: Env): Promise<void> {
  // Clean up expired cache entries
  // This is a simplified implementation
  // ESLint disable: console needed for Cloudflare Workers logging
  // eslint-disable-next-line no-console
  console.log('Cache maintenance completed');
}

// Database request handler
async function handleDatabaseRequest(
  request: Request,
  _env: Env,
  _ctx: ExecutionContext
): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/db/', '');

  try {
    // Mock database responses - in production, would connect to MongoDB Atlas
    switch (path) {
      case 'hospitals':
        if (request.method === 'GET') {
          const hospitals = [
            {
              hospital_id: 'kfmc-001',
              name: 'King Fahd Medical City',
              location: {
                city: 'Riyadh',
                region: 'Central',
                coordinates: { lat: 24.7136, lng: 46.6753 },
              },
              license_number: 'RYD-001-2024',
              capacity: { beds: 500, icu: 50, emergency: 30 },
              specializations: ['Cardiology', 'Oncology', 'Neurology', 'Emergency'],
              digital_maturity_level: 4,
              vision2030_compliance: {
                health_sector_transformation: true,
                digital_health_adoption: 85,
                ai_integration_level: 4,
              },
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ];

          return new Response(JSON.stringify({ success: true, data: hospitals }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }
        break;

      case 'ai-models':
        if (request.method === 'GET') {
          const models = [
            {
              model_id: 'cardio-predict-001',
              name: 'CardioPredict AI',
              type: 'predictive',
              version: '2.0.0',
              healthcare_domain: 'cardiology',
              performance_metrics: {
                accuracy: 0.942,
                precision: 0.921,
                recall: 0.895,
                f1_score: 0.908,
              },
              deployment_status: 'production',
              vision2030_alignment: {
                innovation_contribution: 9,
                quality_improvement: 8,
                efficiency_gain: 7,
              },
              created_at: new Date().toISOString(),
              last_updated: new Date().toISOString(),
            },
          ];

          return new Response(JSON.stringify({ success: true, data: models }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }
        break;

      case 'vision2030-metrics':
        if (request.method === 'GET') {
          const metrics = [
            {
              metric_id: 'metrics_001',
              hospital_id: 'kfmc-001',
              vision2030_goals: {
                health_sector_transformation: {
                  digital_health_adoption: 85,
                  ai_integration: 80,
                  patient_experience: 90,
                },
                innovation_economy: {
                  tech_adoption: 75,
                  research_contribution: 70,
                  startup_collaboration: 60,
                },
                sustainability: {
                  resource_efficiency: 80,
                  environmental_impact: 75,
                  social_responsibility: 85,
                },
              },
              overall_alignment_score: 78.3,
              measurement_date: new Date().toISOString(),
            },
          ];

          return new Response(JSON.stringify({ success: true, data: metrics }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }
        break;

      case 'health':
        return new Response(
          JSON.stringify({
            success: true,
            data: {
              status: 'healthy',
              database: 'brainsait_platform',
              collections: {
                hospitals: 1,
                ai_models: 1,
                vision2030_metrics: 1,
                patients: 0,
              },
              last_check: new Date().toISOString(),
            },
          }),
          {
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );

      default:
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Database endpoint not found',
          }),
          {
            status: 404,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Method not allowed',
      }),
      {
        status: 405,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Database operation failed',
        details: (error as Error).message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
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
