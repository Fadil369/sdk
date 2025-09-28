/**
 * FHIR R4 Client Implementation
 */
export class FHIRClient {
    config;
    logger;
    apiClient;
    serverUrl;
    authToken;
    constructor(config, logger, apiClient) {
        this.config = config;
        this.logger = logger;
        this.apiClient = apiClient;
        const fhirConfig = this.config.get('fhir');
        this.serverUrl = fhirConfig.serverUrl;
    }
    async initialize() {
        this.logger.info('Initializing FHIR client...');
        try {
            // Check server capability statement
            await this.getCapabilityStatement();
            // Authenticate if credentials provided
            const fhirConfig = this.config.get('fhir');
            if (fhirConfig.authentication) {
                await this.authenticate();
            }
            this.logger.info('FHIR client initialized successfully');
        }
        catch (error) {
            this.logger.error('Failed to initialize FHIR client', error);
            throw error;
        }
    }
    async healthCheck() {
        const startTime = Date.now();
        try {
            await this.getCapabilityStatement();
            return {
                status: 'up',
                responseTime: Date.now() - startTime,
            };
        }
        catch (error) {
            this.logger.error('FHIR server health check failed', error);
            return {
                status: 'down',
                responseTime: Date.now() - startTime,
            };
        }
    }
    async shutdown() {
        this.logger.info('Shutting down FHIR client...');
        this.authToken = undefined;
        this.logger.info('FHIR client shutdown completed');
    }
    // ===== CRUD Operations =====
    /**
     * Create a new FHIR resource
     */
    async create(resource) {
        this.validateResource(resource);
        const url = `${this.serverUrl}/${resource.resourceType}`;
        try {
            const response = await this.apiClient.post(url, resource, {
                headers: this.getHeaders(),
                timeout: this.config.get('api.timeout'),
            });
            return this.processResponse(response);
        }
        catch (error) {
            throw this.handleError(error, 'create', resource.resourceType);
        }
    }
    /**
     * Read a FHIR resource by ID
     */
    async read(resourceType, id, versionId) {
        let url = `${this.serverUrl}/${resourceType}/${id}`;
        if (versionId) {
            url += `/_history/${versionId}`;
        }
        try {
            const response = await this.apiClient.get(url, {
                headers: this.getHeaders(),
                timeout: this.config.get('api.timeout'),
            });
            return this.processResponse(response);
        }
        catch (error) {
            throw this.handleError(error, 'read', resourceType);
        }
    }
    /**
     * Update a FHIR resource
     */
    async update(resource) {
        if (!resource.id) {
            throw new Error('Resource must have an id for update operation');
        }
        this.validateResource(resource);
        const url = `${this.serverUrl}/${resource.resourceType}/${resource.id}`;
        try {
            const response = await this.apiClient.put(url, resource, {
                headers: this.getHeaders(),
                timeout: this.config.get('api.timeout'),
            });
            return this.processResponse(response);
        }
        catch (error) {
            throw this.handleError(error, 'update', resource.resourceType);
        }
    }
    /**
     * Delete a FHIR resource
     */
    async delete(resourceType, id) {
        const url = `${this.serverUrl}/${resourceType}/${id}`;
        try {
            await this.apiClient.delete(url, {
                headers: this.getHeaders(),
                timeout: this.config.get('api.timeout'),
            });
        }
        catch (error) {
            throw this.handleError(error, 'delete', resourceType);
        }
    }
    // ===== Search Operations =====
    /**
     * Search for FHIR resources
     */
    async search(resourceType, parameters = {}) {
        const url = this.buildSearchUrl(resourceType, parameters);
        try {
            const response = await this.apiClient.get(url, {
                headers: this.getHeaders(),
                timeout: this.config.get('api.timeout'),
            });
            return this.processSearchResponse(response);
        }
        catch (error) {
            throw this.handleError(error, 'search', resourceType);
        }
    }
    // ===== Bundle Operations =====
    /**
     * Submit a transaction bundle
     */
    async transaction(bundle) {
        if (bundle.type !== 'transaction') {
            throw new Error('Bundle type must be "transaction" for transaction operations');
        }
        const url = `${this.serverUrl}`;
        try {
            const response = await this.apiClient.post(url, bundle, {
                headers: this.getHeaders(),
                timeout: this.config.get('api.timeout'),
            });
            return this.processResponse(response);
        }
        catch (error) {
            throw this.handleError(error, 'transaction', 'Bundle');
        }
    }
    /**
     * Submit a batch bundle
     */
    async batch(bundle) {
        if (bundle.type !== 'batch') {
            throw new Error('Bundle type must be "batch" for batch operations');
        }
        const url = `${this.serverUrl}`;
        try {
            const response = await this.apiClient.post(url, bundle, {
                headers: this.getHeaders(),
                timeout: this.config.get('api.timeout'),
            });
            return this.processResponse(response);
        }
        catch (error) {
            throw this.handleError(error, 'batch', 'Bundle');
        }
    }
    // ===== Utility Methods =====
    /**
     * Get server capability statement
     */
    async getCapabilityStatement() {
        const url = `${this.serverUrl}/metadata`;
        try {
            const response = await this.apiClient.get(url, {
                headers: { Accept: 'application/fhir+json' },
                timeout: this.config.get('api.timeout'),
            });
            return this.processResponse(response);
        }
        catch (error) {
            throw this.handleError(error, 'capability', 'metadata');
        }
    }
    // ===== Private Methods =====
    async authenticate() {
        // Implementation would depend on the specific authentication method
        // For now, we'll simulate successful authentication
        this.authToken = 'simulated-token';
        this.logger.info('FHIR authentication successful');
    }
    getHeaders() {
        const headers = {
            'Content-Type': 'application/fhir+json',
            Accept: 'application/fhir+json',
        };
        if (this.authToken) {
            headers['Authorization'] = `Bearer ${this.authToken}`;
        }
        return headers;
    }
    validateResource(resource) {
        if (!resource.resourceType) {
            throw new Error('Resource must have a resourceType');
        }
        // Additional validation could be added here
        // For now, we'll do basic validation
    }
    buildSearchUrl(resourceType, parameters) {
        const baseUrl = `${this.serverUrl}/${resourceType}`;
        const searchParams = new URLSearchParams();
        Object.entries(parameters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                if (Array.isArray(value)) {
                    value.forEach(v => searchParams.append(key, String(v)));
                }
                else {
                    searchParams.append(key, String(value));
                }
            }
        });
        const queryString = searchParams.toString();
        return queryString ? `${baseUrl}?${queryString}` : baseUrl;
    }
    processResponse(response) {
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
    processSearchResponse(response) {
        if (!response.success || !response.data) {
            throw new Error(`FHIR search failed: ${response.error || 'Unknown error'}`);
        }
        const bundle = response.data;
        const resources = (bundle.entry || [])
            .map(entry => entry.resource)
            .filter((resource) => resource !== undefined);
        // Extract pagination links
        const links = {};
        // In a real implementation, you would parse Link headers or bundle links
        return {
            data: bundle,
            total: bundle.total,
            resources,
            links,
        };
    }
    handleError(error, operation, resourceType) {
        const fhirError = new Error(`FHIR ${operation} operation failed: ${error.message}`);
        fhirError.name = 'FHIRError';
        fhirError.status = 500; // Default status
        fhirError.operation = operation;
        fhirError.resource = resourceType;
        // In a real implementation, you would parse the error response
        // to extract operation outcome and proper status codes
        return fhirError;
    }
}
