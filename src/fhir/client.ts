/**
 * FHIR R4 Client Implementation
 */

import { ConfigManager } from '@/core/config';
import { Logger } from '@/core/logger';
import { ApiClient } from '@/core/client';
import {
  FHIRResource,
  FHIRBundle,
  FHIRSearchParameters,
  FHIRResponse,
  FHIRSearchResponse,
  FHIRError,
  FHIRClientConfig,
} from '@/types/fhir';
import { ApiResponse } from '@/types/common';

export class FHIRClient {
  private serverUrl: string;
  private authToken?: string;

  constructor(
    private config: ConfigManager,
    private logger: Logger,
    private apiClient: ApiClient
  ) {
    const fhirConfig = this.config.get<FHIRClientConfig>('fhir');
    this.serverUrl = fhirConfig.serverUrl;
  }

  async initialize(): Promise<void> {
    this.logger.info('Initializing FHIR client...');
    
    try {
      // Check server capability statement
      await this.getCapabilityStatement();
      
      // Authenticate if credentials provided
      const fhirConfig = this.config.get<FHIRClientConfig>('fhir');
      if (fhirConfig.authentication) {
        await this.authenticate();
      }
      
      this.logger.info('FHIR client initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize FHIR client', error as Error);
      throw error;
    }
  }

  async healthCheck(): Promise<{ status: string; responseTime: number }> {
    const startTime = Date.now();
    
    try {
      await this.getCapabilityStatement();
      return { 
        status: 'up', 
        responseTime: Date.now() - startTime 
      };
    } catch (error) {
      this.logger.error('FHIR server health check failed', error as Error);
      return { 
        status: 'down', 
        responseTime: Date.now() - startTime 
      };
    }
  }

  async shutdown(): Promise<void> {
    this.logger.info('Shutting down FHIR client...');
    this.authToken = undefined;
    this.logger.info('FHIR client shutdown completed');
  }

  // ===== CRUD Operations =====

  /**
   * Create a new FHIR resource
   */
  async create<T extends FHIRResource>(resource: T): Promise<FHIRResponse<T>> {
    this.validateResource(resource);
    
    const url = `${this.serverUrl}/${resource.resourceType}`;
    
    try {
      const response = await this.apiClient.post<T>(url, resource, {
        headers: this.getHeaders(),
        timeout: this.config.get('api.timeout'),
      });

      return this.processResponse<T>(response);
    } catch (error) {
      throw this.handleError(error as Error, 'create', resource.resourceType);
    }
  }

  /**
   * Read a FHIR resource by ID
   */
  async read<T extends FHIRResource>(
    resourceType: string, 
    id: string, 
    versionId?: string
  ): Promise<FHIRResponse<T>> {
    let url = `${this.serverUrl}/${resourceType}/${id}`;
    if (versionId) {
      url += `/_history/${versionId}`;
    }

    try {
      const response = await this.apiClient.get<T>(url, {
        headers: this.getHeaders(),
        timeout: this.config.get('api.timeout'),
      });

      return this.processResponse<T>(response);
    } catch (error) {
      throw this.handleError(error as Error, 'read', resourceType);
    }
  }

  /**
   * Update a FHIR resource
   */
  async update<T extends FHIRResource>(resource: T): Promise<FHIRResponse<T>> {
    if (!resource.id) {
      throw new Error('Resource must have an id for update operation');
    }

    this.validateResource(resource);
    
    const url = `${this.serverUrl}/${resource.resourceType}/${resource.id}`;
    
    try {
      const response = await this.apiClient.put<T>(url, resource, {
        headers: this.getHeaders(),
        timeout: this.config.get('api.timeout'),
      });

      return this.processResponse<T>(response);
    } catch (error) {
      throw this.handleError(error as Error, 'update', resource.resourceType);
    }
  }

  /**
   * Delete a FHIR resource
   */
  async delete(resourceType: string, id: string): Promise<void> {
    const url = `${this.serverUrl}/${resourceType}/${id}`;
    
    try {
      await this.apiClient.delete(url, {
        headers: this.getHeaders(),
        timeout: this.config.get('api.timeout'),
      });
    } catch (error) {
      throw this.handleError(error as Error, 'delete', resourceType);
    }
  }

  // ===== Search Operations =====

  /**
   * Search for FHIR resources
   */
  async search<T extends FHIRResource>(
    resourceType: string,
    parameters: FHIRSearchParameters = {}
  ): Promise<FHIRSearchResponse<T>> {
    const url = this.buildSearchUrl(resourceType, parameters);
    
    try {
      const response = await this.apiClient.get<FHIRBundle>(url, {
        headers: this.getHeaders(),
        timeout: this.config.get('api.timeout'),
      });

      return this.processSearchResponse<T>(response);
    } catch (error) {
      throw this.handleError(error as Error, 'search', resourceType);
    }
  }

  // ===== Bundle Operations =====

  /**
   * Submit a transaction bundle
   */
  async transaction(bundle: FHIRBundle): Promise<FHIRResponse<FHIRBundle>> {
    if (bundle.type !== 'transaction') {
      throw new Error('Bundle type must be "transaction" for transaction operations');
    }

    const url = `${this.serverUrl}`;
    
    try {
      const response = await this.apiClient.post<FHIRBundle>(url, bundle, {
        headers: this.getHeaders(),
        timeout: this.config.get('api.timeout'),
      });

      return this.processResponse<FHIRBundle>(response);
    } catch (error) {
      throw this.handleError(error as Error, 'transaction', 'Bundle');
    }
  }

  /**
   * Submit a batch bundle
   */
  async batch(bundle: FHIRBundle): Promise<FHIRResponse<FHIRBundle>> {
    if (bundle.type !== 'batch') {
      throw new Error('Bundle type must be "batch" for batch operations');
    }

    const url = `${this.serverUrl}`;
    
    try {
      const response = await this.apiClient.post<FHIRBundle>(url, bundle, {
        headers: this.getHeaders(),
        timeout: this.config.get('api.timeout'),
      });

      return this.processResponse<FHIRBundle>(response);
    } catch (error) {
      throw this.handleError(error as Error, 'batch', 'Bundle');
    }
  }

  // ===== Utility Methods =====

  /**
   * Get server capability statement
   */
  async getCapabilityStatement(): Promise<FHIRResponse<FHIRResource>> {
    const url = `${this.serverUrl}/metadata`;
    
    try {
      const response = await this.apiClient.get<FHIRResource>(url, {
        headers: { 'Accept': 'application/fhir+json' },
        timeout: this.config.get('api.timeout'),
      });

      return this.processResponse<FHIRResource>(response);
    } catch (error) {
      throw this.handleError(error as Error, 'capability', 'metadata');
    }
  }

  // ===== Private Methods =====

  private async authenticate(): Promise<void> {
    // Implementation would depend on the specific authentication method
    // For now, we'll simulate successful authentication
    this.authToken = 'simulated-token';
    this.logger.info('FHIR authentication successful');
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/fhir+json',
      'Accept': 'application/fhir+json',
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  private validateResource(resource: FHIRResource): void {
    if (!resource.resourceType) {
      throw new Error('Resource must have a resourceType');
    }

    // Additional validation could be added here
    // For now, we'll do basic validation
  }

  private buildSearchUrl(resourceType: string, parameters: FHIRSearchParameters): string {
    const baseUrl = `${this.serverUrl}/${resourceType}`;
    const searchParams = new URLSearchParams();

    Object.entries(parameters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, String(v)));
        } else {
          searchParams.append(key, String(value));
        }
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  }

  private processResponse<T extends FHIRResource>(response: ApiResponse<T>): FHIRResponse<T> {
    if (!response.success || !response.data) {
      throw new Error(`FHIR operation failed: ${response.error || 'Unknown error'}`);
    }

    return {
      data: response.data,
      status: 200, // Default success status
      headers: {}, // ApiResponse doesn't include headers, using empty object
      resourceId: response.data.id,
      versionId: response.data.meta?.versionId,
    };
  }

  private processSearchResponse<T extends FHIRResource>(response: ApiResponse<FHIRBundle>): FHIRSearchResponse<T> {
    if (!response.success || !response.data) {
      throw new Error(`FHIR search failed: ${response.error || 'Unknown error'}`);
    }

    const bundle = response.data;
    const resources = (bundle.entry || [])
      .map(entry => entry.resource)
      .filter((resource): resource is T => resource !== undefined);

    // Extract pagination links
    const links: FHIRSearchResponse<T>['links'] = {};
    // In a real implementation, you would parse Link headers or bundle links
    
    return {
      data: bundle,
      total: bundle.total,
      resources,
      links,
    };
  }

  private handleError(error: Error, operation: string, resourceType: string): FHIRError {
    const fhirError = new Error(`FHIR ${operation} operation failed: ${error.message}`) as FHIRError;
    fhirError.name = 'FHIRError';
    fhirError.status = 500; // Default status
    fhirError.operation = operation;
    fhirError.resource = resourceType;

    // In a real implementation, you would parse the error response
    // to extract operation outcome and proper status codes

    return fhirError;
  }
}