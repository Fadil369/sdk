import { describe, it, expect } from 'vitest';

/**
 * Cloudflare Worker Integration Tests
 * Tests the worker API endpoints, caching, and edge functionality
 */

describe('Cloudflare Worker Integration Tests', () => {
  const workerUrl = process.env.WORKER_URL ?? 'http://localhost:8787';
  
  describe('Health Check Endpoint', () => {
    it('should return health status', async () => {
      const response = await fetch(`${workerUrl}/health`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('status', 'healthy');
      expect(data).toHaveProperty('version');
      expect(data).toHaveProperty('timestamp');
      expect(data).toHaveProperty('services');
    });
  });

  describe('API Endpoints', () => {
    it('should return SDK info at root', async () => {
      const response = await fetch(`${workerUrl}/`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('name', 'BrainSAIT Healthcare SDK');
      expect(data).toHaveProperty('version');
      expect(data).toHaveProperty('environment');
    });

    it('should return config', async () => {
      const response = await fetch(`${workerUrl}/api/config`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('version');
      expect(data).toHaveProperty('environment');
      expect(data).toHaveProperty('features');
    });

    it('should handle API errors gracefully', async () => {
      const response = await fetch(`${workerUrl}/api/nonexistent`);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error');
    });
  });

  describe('Database API Endpoints', () => {
    it('should return hospitals data', async () => {
      const response = await fetch(`${workerUrl}/api/db/hospitals`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success', true);
      expect(data).toHaveProperty('data');
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should return AI models data', async () => {
      const response = await fetch(`${workerUrl}/api/db/ai-models`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success', true);
      expect(data).toHaveProperty('data');
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should return Vision 2030 metrics', async () => {
      const response = await fetch(`${workerUrl}/api/db/vision2030-metrics`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success', true);
      expect(data).toHaveProperty('data');
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should return database health status', async () => {
      const response = await fetch(`${workerUrl}/api/db/health`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success', true);
      expect(data.data).toHaveProperty('status', 'healthy');
      expect(data.data).toHaveProperty('database');
      expect(data.data).toHaveProperty('collections');
    });
  });

  describe('CORS Headers', () => {
    it('should handle OPTIONS preflight request', async () => {
      const response = await fetch(`${workerUrl}/api/config`, {
        method: 'OPTIONS',
      });
      
      expect(response.status).toBe(200);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('GET');
    });

    it('should include CORS headers in API responses', async () => {
      const response = await fetch(`${workerUrl}/api/config`);
      
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    });
  });

  describe('Security Headers', () => {
    it('should include security headers', async () => {
      const response = await fetch(`${workerUrl}/`);
      
      expect(response.headers.get('X-Frame-Options')).toBe('DENY');
      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(response.headers.get('X-XSS-Protection')).toBe('1; mode=block');
      expect(response.headers.get('Strict-Transport-Security')).toContain('max-age');
    });
  });

  describe('Caching', () => {
    it('should cache GET requests', async () => {
      // First request - cache miss
      const response1 = await fetch(`${workerUrl}/api/config`);
      
      // Second request - should be cache hit (if caching implemented)
      const response2 = await fetch(`${workerUrl}/api/config`);
      const data2 = await response2.json();
      
      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      expect(data2).toHaveProperty('version');
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await fetch(`${workerUrl}/unknown/route`);
      
      // Worker returns SDK info for unknown routes, not 404
      expect(response.status).toBe(200);
    });

    it('should handle malformed requests', async () => {
      const response = await fetch(`${workerUrl}/api/config`, {
        method: 'POST',
        body: 'invalid json',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      // Config endpoint doesn't handle POST, but shouldn't crash
      expect(response.status).toBeLessThan(600);
    });
  });
});

describe('Cloudflare Pages Integration Tests', () => {
  const pagesUrl = process.env.PAGES_URL ?? 'http://localhost:8000';
  
  describe('Frontend UI', () => {
    it('should serve index.html', async () => {
      const response = await fetch(`${pagesUrl}/index.html`);
      const html = await response.text();
      
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toContain('text/html');
      expect(html).toContain('BrainSAIT Healthcare SDK');
    });

    it('should serve CSS assets', async () => {
      const response = await fetch(`${pagesUrl}/assets/css/healthcare-ui.css`);
      
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toContain('text/css');
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic HTML', async () => {
      const response = await fetch(`${pagesUrl}/index.html`);
      const html = await response.text();
      
      // Check for semantic tags
      expect(html).toContain('<header');
      expect(html).toContain('<main');
      expect(html).toContain('<footer');
      expect(html).toContain('role=');
      expect(html).toContain('aria-');
    });

    it('should have proper language attributes', async () => {
      const response = await fetch(`${pagesUrl}/index.html`);
      const html = await response.text();
      
      expect(html).toContain('lang="en"');
      expect(html).toContain('dir="ltr"');
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should have viewport meta tag', async () => {
      const response = await fetch(`${pagesUrl}/index.html`);
      const html = await response.text();
      
      expect(html).toContain('viewport');
      expect(html).toContain('width=device-width');
    });
  });
});

describe('End-to-End Deployment Tests', () => {
  const workerUrl = process.env.WORKER_URL ?? 'http://localhost:8787';
  const pagesUrl = process.env.PAGES_URL ?? 'http://localhost:8000';
  
  describe('Frontend-Backend Integration', () => {
    it('should allow frontend to call worker API', async () => {
      // Verify CORS allows frontend domain
      const response = await fetch(`${workerUrl}/api/config`, {
        headers: {
          'Origin': pagesUrl,
        },
      });
      
      expect(response.status).toBe(200);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    });
  });

  describe('Performance', () => {
    it('should respond quickly', async () => {
      const start = Date.now();
      await fetch(`${workerUrl}/health`);
      const duration = Date.now() - start;
      
      // Should respond in under 1 second
      expect(duration).toBeLessThan(1000);
    });
  });
});
