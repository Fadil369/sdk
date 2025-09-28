/**
 * HTTP API client with performance optimizations
 */

import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { ConfigManager } from './config';
import { Logger } from './logger';
import { ApiResponse } from '@/types/common';

interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retries?: number;
  rateLimit?: {
    requests: number;
    window: number;
  };
  metadata?: unknown;
}

export class ApiClient {
  private client: AxiosInstance;
  private logger: Logger;
  private requestCount = 0;
  private rateLimitWindow = new Map<string, number[]>();

  constructor(config: ConfigManager, logger: Logger) {
    this.logger = logger.child({ component: 'ApiClient' });

    const apiConfig = config.get<ApiConfig>('api');

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

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('GET', url, undefined, config);
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('POST', url, data, config);
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', url, data, config);
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', url, undefined, config);
  }

  async patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', url, data, config);
  }

  private async request<T>(
    method: string,
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
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
        data: response.data as T,
        metadata: {
          timestamp: new Date().toISOString(),
          requestId,
          responseTime,
        },
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;

      if (axios.isAxiosError(error)) {
        this.logger.error(`${method} ${url} failed`, error, {
          requestId,
          responseTime,
          status: error.response?.status,
          statusText: error.response?.statusText,
        });

        const errorMessage =
          (error.response?.data as { message?: string })?.message ?? error.message;

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

      this.logger.error(
        `${method} ${url} failed with unknown error`,
        error instanceof Error ? error : new Error(String(error)),
        {
          requestId,
          responseTime,
        }
      );

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

  private setupInterceptors(apiConfig: ApiConfig): void {
    // Request interceptor for rate limiting and logging
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Rate limiting check
        if (apiConfig.rateLimit) {
          this.checkRateLimit(apiConfig.rateLimit);
        }

        // Add request timestamp
        const configWithMetadata = config as InternalAxiosRequestConfig & {
          metadata?: { startTime: number };
        };
        configWithMetadata.metadata = { startTime: Date.now() };
        this.requestCount++;

        return config;
      },
      error => {
        this.logger.error(
          'Request interceptor error',
          error instanceof Error ? error : new Error(String(error))
        );
        return Promise.reject(error);
      }
    );

    // Response interceptor for performance monitoring
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        const configWithMetadata = response.config as InternalAxiosRequestConfig & {
          metadata?: { startTime: number };
        };
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
      },
      error => {
        if (axios.isAxiosError(error) && error.config) {
          const configWithMetadata = error.config as InternalAxiosRequestConfig & {
            metadata?: { startTime: number };
          };
          const responseTime = Date.now() - (configWithMetadata.metadata?.startTime ?? 0);

          this.logger.error('API request failed', undefined, {
            url: error.config.url,
            method: error.config.method,
            status: error.response?.status,
            responseTime,
          });
        }

        return Promise.reject(error);
      }
    );
  }

  private checkRateLimit(rateLimit: { requests: number; window: number }): void {
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

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getStats(): { requestCount: number; activeWindows: number } {
    return {
      requestCount: this.requestCount,
      activeWindows: this.rateLimitWindow.size,
    };
  }
}
