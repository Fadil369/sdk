/**
 * HTTP API client with performance optimizations
 */
import axios from 'axios';
export class ApiClient {
    client;
    logger;
    requestCount = 0;
    rateLimitWindow = new Map();
    constructor(config, logger) {
        this.logger = logger.child({ component: 'ApiClient' });
        const apiConfig = config.get('api');
        this.client = axios.create({
            baseURL: apiConfig.baseUrl,
            timeout: apiConfig.timeout,
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'User-Agent': 'BrainSAIT-Healthcare-SDK/1.0.0',
            },
        });
        this.setupInterceptors(apiConfig);
    }
    async get(url, config) {
        return this.request('GET', url, undefined, config);
    }
    async post(url, data, config) {
        return this.request('POST', url, data, config);
    }
    async put(url, data, config) {
        return this.request('PUT', url, data, config);
    }
    async delete(url, config) {
        return this.request('DELETE', url, undefined, config);
    }
    async patch(url, data, config) {
        return this.request('PATCH', url, data, config);
    }
    async request(method, url, data, config) {
        const startTime = Date.now();
        const requestId = this.generateRequestId();
        try {
            this.logger.debug(`${method} ${url}`, { requestId, data });
            const response = await this.client.request({
                method,
                url,
                data,
                ...config,
                headers: {
                    'X-Request-ID': requestId,
                    ...config?.headers,
                },
            });
            const responseTime = Date.now() - startTime;
            this.logger.info(`${method} ${url} - ${response.status}`, {
                requestId,
                responseTime,
                status: response.status,
            });
            return {
                success: true,
                data: response.data,
                metadata: {
                    timestamp: new Date().toISOString(),
                    requestId,
                    responseTime,
                },
            };
        }
        catch (error) {
            const responseTime = Date.now() - startTime;
            if (axios.isAxiosError(error)) {
                this.logger.error(`${method} ${url} failed`, error, {
                    requestId,
                    responseTime,
                    status: error.response?.status,
                    statusText: error.response?.statusText,
                });
                const errorMessage = error.response?.data?.message ?? error.message;
                return {
                    success: false,
                    error: errorMessage,
                    metadata: {
                        timestamp: new Date().toISOString(),
                        requestId,
                        responseTime,
                    },
                };
            }
            this.logger.error(`${method} ${url} failed with unknown error`, error instanceof Error ? error : new Error(String(error)), {
                requestId,
                responseTime,
            });
            return {
                success: false,
                error: 'An unexpected error occurred',
                metadata: {
                    timestamp: new Date().toISOString(),
                    requestId,
                    responseTime,
                },
            };
        }
    }
    setupInterceptors(apiConfig) {
        // Request interceptor for rate limiting and logging
        this.client.interceptors.request.use((config) => {
            // Rate limiting check
            if (apiConfig.rateLimit) {
                this.checkRateLimit(apiConfig.rateLimit);
            }
            // Add request timestamp
            const configWithMetadata = config;
            configWithMetadata.metadata = { startTime: Date.now() };
            this.requestCount++;
            return config;
        }, error => {
            this.logger.error('Request interceptor error', error instanceof Error ? error : new Error(String(error)));
            return Promise.reject(error);
        });
        // Response interceptor for performance monitoring
        this.client.interceptors.response.use((response) => {
            const configWithMetadata = response.config;
            const responseTime = Date.now() - (configWithMetadata.metadata?.startTime ?? 0);
            // Log slow responses (>2.5s target)
            if (responseTime > 2500) {
                this.logger.warn('Slow API response detected', {
                    url: response.config.url,
                    method: response.config.method,
                    responseTime,
                });
            }
            return response;
        }, error => {
            if (axios.isAxiosError(error) && error.config) {
                const configWithMetadata = error.config;
                const responseTime = Date.now() - (configWithMetadata.metadata?.startTime ?? 0);
                this.logger.error('API request failed', undefined, {
                    url: error.config.url,
                    method: error.config.method,
                    status: error.response?.status,
                    responseTime,
                });
            }
            return Promise.reject(error);
        });
    }
    checkRateLimit(rateLimit) {
        const now = Date.now();
        const windowKey = Math.floor(now / (rateLimit.window * 1000));
        const windowRequests = this.rateLimitWindow.get(String(windowKey)) ?? [];
        if (windowRequests.length >= rateLimit.requests) {
            throw new Error('Rate limit exceeded');
        }
        windowRequests.push(now);
        this.rateLimitWindow.set(String(windowKey), windowRequests);
        // Clean up old windows
        const cutoff = windowKey - 5; // Keep last 5 windows
        for (const [key] of this.rateLimitWindow) {
            if (parseInt(key) < cutoff) {
                this.rateLimitWindow.delete(key);
            }
        }
    }
    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    getStats() {
        return {
            requestCount: this.requestCount,
            activeWindows: this.rateLimitWindow.size,
        };
    }
}
//# sourceMappingURL=client.js.map