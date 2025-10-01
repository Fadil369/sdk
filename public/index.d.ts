import { AxiosRequestConfig } from 'axios';
import { default as default_2 } from 'react';
import * as React_2 from 'react';
import { ReactElement } from 'react';
import { ReactNode } from 'react';

export declare interface AccessContext {
    userId: string;
    resource: string;
    action: 'create' | 'read' | 'update' | 'delete' | 'search';
    resourceId?: string;
    data?: Record<string, unknown>;
    environment?: Record<string, unknown>;
}

export declare interface AccessResult {
    granted: boolean;
    reason: string;
    matchedPermissions: Permission[];
    appliedRestrictions: Restriction[];
    conditions?: PermissionCondition[];
}

export declare interface AccessToken {
    token: string;
    type: 'bearer' | 'basic';
    expiresAt: number;
    scope: string[];
    userId?: string;
    clientId?: string;
}

export declare interface AIAgent {
    id: string;
    name: string;
    type: 'nlp' | 'analytics' | 'decision-support' | 'automation';
    version: string;
    status: 'active' | 'inactive' | 'training' | 'error';
    capabilities: string[];
    configuration: Record<string, unknown>;
}

export declare class AIAgentManager {
    private config;
    private logger;
    constructor(config: ConfigManager, // Will be used in future implementation
    logger: Logger);
    initialize(): Promise<void>;
    healthCheck(): Promise<{
        status: string;
        agents: number;
    }>;
    shutdown(): Promise<void>;
}

/**
 * AI and machine learning type definitions
 */
export declare interface AIConfig {
    enabled: boolean;
    providers: {
        nlp?: {
            endpoint: string;
            model: string;
        };
        analytics?: {
            endpoint: string;
            model: string;
        };
    };
}

export declare interface AIWorkflow {
    id: string;
    name: string;
    description: string;
    steps: WorkflowStep[];
    status: 'active' | 'paused' | 'completed' | 'error';
    triggers: WorkflowTrigger[];
}

export declare class AnalyticsManager {
    private config;
    private logger;
    private enabled;
    constructor(config: SDKConfig, logger: Logger);
    trackEvent(eventName: string, eventProperties: Record<string, unknown>): void;
    healthCheck(): {
        status: string;
    };
}

export declare function analyzeClinicalNote(note: string, options?: PythonBridgeOptions): Promise<PyBrainEntitiesResponse>;

export declare class ApiClient {
    private client;
    private logger;
    private requestCount;
    private rateLimitWindow;
    constructor(config: ConfigManager, logger: Logger);
    get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
    post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
    put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
    delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
    patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
    private request;
    private setupInterceptors;
    private checkRateLimit;
    private generateRequestId;
    getStats(): {
        requestCount: number;
        activeWindows: number;
    };
}

export declare interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    metadata?: {
        timestamp: string;
        requestId: string;
        responseTime: number;
    };
}

export declare const arabicFontStack: string;

export declare interface AuditEvent {
    eventType: string;
    userId?: string;
    patientId?: string;
    resource?: string;
    action: 'create' | 'read' | 'update' | 'delete' | 'search';
    timestamp: string;
    ipAddress?: string;
    userAgent?: string;
    outcome: 'success' | 'failure';
    details?: Record<string, unknown>;
}

export declare interface AuditLog {
    id: string;
    timestamp: string;
    eventType: 'access' | 'create' | 'update' | 'delete' | 'export' | 'login' | 'logout';
    userId?: string;
    patientId?: string;
    resourceType?: string;
    resourceId?: string;
    action: string;
    outcome: 'success' | 'failure' | 'warning';
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
    details?: Record<string, unknown>;
}

export declare interface AuditLoggerConfig {
    hipaaLevel: 'minimal' | 'standard' | 'comprehensive';
    retentionPeriod: number;
    automaticReporting: boolean;
    endpoint?: string;
}

export declare const BaseComponent: ({ id, className, style, children, disabled, loading, rtl, theme, glassMorphism, opacity, blur, borderRadius, border, shadow, ...props }: BaseComponentProps) => ReactElement;

export declare interface BaseComponentProps extends ComponentProps, GlassMorphismProps {
    theme?: 'light' | 'dark';
    glassMorphism?: boolean;
}

declare class BrainSAITHealthcareSDK {
    private config;
    private logger;
    private apiClient;
    private performanceMonitor;
    private fhirClient;
    private nphiesClient;
    private securityManager;
    private aiManager;
    private analyticsManager;
    private cacheManager;
    private initialized;
    constructor(options?: SDKInitOptions);
    /**
     * Initialize the SDK with configuration validation
     */
    initialize(): Promise<void>;
    /**
     * Get FHIR client instance
     */
    get fhir(): LegacyFHIRClient;
    /**
     * Get FHIR client instance (alternative method)
     */
    getFHIRClient(): LegacyFHIRClient;
    /**
     * Get NPHIES client instance
     */
    get nphies(): NPHIESClient;
    /**
     * Get NPHIES client instance (alternative method)
     */
    getNPHIESClient(): NPHIESClient;
    /**
     * Get security manager instance
     */
    get security(): SecurityManager;
    /**
     * Get security manager instance (alternative method)
     */
    getSecurityManager(): SecurityManager;
    /**
     * Get AI agent manager instance
     */
    get ai(): AIAgentManager;
    /**
     * Get AI agent manager instance (alternative method)
     */
    getAIAgentManager(): AIAgentManager;
    /**
     * Get analytics manager instance
     */
    get analytics(): AnalyticsManager;
    /**
     * Get analytics manager instance (alternative method)
     */
    getAnalyticsManager(): AnalyticsManager;
    /**
     * Get cache manager instance
     */
    get cache(): CacheManager;
    /**
     * Get cache manager instance (alternative method)
     */
    getCacheManager(): CacheManager;
    /**
     * Get current performance metrics
     */
    getPerformanceMetrics(): PerformanceMetrics;
    /**
     * Update SDK configuration
     */
    updateConfig(newConfig: Partial<SDKConfig>): void;
    /**
     * Get health status of the SDK and connected services
     */
    healthCheck(): Promise<{
        status: string;
        timestamp: string;
        version: string;
        responseTime: number;
        services: Record<string, unknown>;
        error?: string;
    }>;
    /**
     * Alias for health check (for compatibility)
     */
    getHealthStatus(): Promise<{
        status: string;
        timestamp: string;
        version: string;
        responseTime: number;
        services: Record<string, unknown>;
        error?: string;
    }>;
    /**
     * Cleanup resources and shut down the SDK
     */
    shutdown(): Promise<void>;
    private ensureInitialized;
    private setErrorHandler;
}
export { BrainSAITHealthcareSDK }
export default BrainSAITHealthcareSDK;

declare type BundleType = 'document' | 'message' | 'transaction' | 'transaction-response' | 'batch' | 'batch-response' | 'history' | 'searchset' | 'collection';

export declare class CacheManager {
    private config;
    private logger;
    private enabled;
    private cache;
    constructor(config: SDKConfig, logger: Logger);
    get<T>(key: string): T | undefined;
    set<T>(key: string, value: T, ttl: number): void;
    clear(): void;
    healthCheck(): {
        status: string;
    };
}

export declare const clearNotifications: () => void;

export declare interface ClinicalAlert {
    type: 'interaction' | 'allergy' | 'contraindication' | 'dosage' | 'monitoring';
    severity: 'info' | 'warning' | 'critical';
    message: string;
    affectedMedications?: string[];
    recommendedAction?: string;
}

export declare interface ClinicalDecisionSupport {
    patientData: PatientData;
    context: {
        symptoms?: string[];
        vitals?: Record<string, number>;
        history?: string[];
        currentMedications?: string[];
    };
    recommendations?: ClinicalRecommendation[];
    alerts?: ClinicalAlert[];
}

export declare interface ClinicalRecommendation {
    type: 'diagnosis' | 'treatment' | 'medication' | 'test' | 'referral';
    suggestion: string;
    confidence: number;
    evidence: string[];
    priority: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Design tokens for the BrainSAIT healthcare UI kit. Consumers can override these
 * tokens by setting the matching CSS custom properties before rendering the components.
 */
export declare const colorTokens: {
    primary: string;
    primaryAccent: string;
    secondary: string;
    success: string;
    warning: string;
    danger: string;
    info: string;
    textPrimary: string;
    textSecondary: string;
    glassLight: string;
    glassDark: string;
};

export declare type CommonTheme = 'light' | 'dark' | 'auto';

export declare interface ComplianceReport {
    overallCompliance: number;
    totalRules: number;
    passedRules: number;
    failedRules: number;
    criticalFailures: number;
    timestamp: string;
    ruleResults: {
        ruleId: string;
        ruleName: string;
        category: string;
        severity: string;
        passed: boolean;
        message: string;
        recommendations?: string[];
    }[];
    recommendations: string[];
}

export declare interface ComplianceValidationResult {
    passed: boolean;
    message: string;
    details?: Record<string, unknown>;
    recommendations?: string[];
}

export declare class ComplianceValidator {
    private rules;
    private logger;
    constructor(logger: Logger);
    /**
     * Initialize default HIPAA compliance rules
     */
    private initializeDefaultRules;
    /**
     * Add or update a validation rule
     */
    addRule(rule: ValidationRule): void;
    /**
     * Remove a validation rule
     */
    removeRule(ruleId: string): boolean;
    /**
     * Validate compliance for a given context
     */
    validateCompliance(context: ValidationContext): Promise<ComplianceReport>;
    /**
     * Validate specific rule categories
     */
    validateCategory(context: ValidationContext, category: 'administrative' | 'physical' | 'technical'): Promise<ComplianceReport>;
    /**
     * Enhanced parallel validation for critical rules only
     */
    quickValidation(context: ValidationContext): Promise<{
        passed: boolean;
        criticalFailures: number;
        failedRules: string[];
        performanceMetrics: {
            executionTime: number;
            rulesEvaluated: number;
            averageRuleTime: number;
        };
    }>;
    /**
     * Advanced compliance validation with risk scoring
     */
    advancedValidation(context: ValidationContext): Promise<ComplianceReport & {
        riskScore: number;
        riskLevel: 'low' | 'medium' | 'high' | 'critical';
        priorityRecommendations: string[];
        performanceMetrics: {
            executionTime: number;
            rulesEvaluated: number;
        };
    }>;
    /**
     * Get validation rule information
     */
    getRule(ruleId: string): ValidationRule | null;
    /**
     * List all validation rules
     */
    listRules(): Array<Omit<ValidationRule, 'validate'>>;
    /**
     * Get compliance statistics
     */
    getComplianceStats(): {
        totalRules: number;
        rulesByCategory: Record<string, number>;
        rulesBySeverity: Record<string, number>;
        requiredRules: number;
    };
    /**
     * Generate compliance report summary
     */
    generateReportSummary(report: ComplianceReport): string;
}

export declare interface ComponentProps {
    id?: string;
    className?: string;
    style?: React_2.CSSProperties;
    children?: React_2.ReactNode;
    disabled?: boolean;
    loading?: boolean;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    rtl?: boolean;
    onClick?: (event: React_2.MouseEvent) => void;
}

export declare class ConfigManager {
    private config;
    private validator;
    constructor(options?: SDKInitOptions);
    /**
     * Get configuration value by path
     */
    get<T = unknown>(path: string): T;
    /**
     * Update configuration
     */
    update(newConfig: Partial<SDKConfig>): void;
    /**
     * Validate configuration
     */
    validate(): void;
    /**
     * Get full configuration
     */
    getAll(): SDKConfig;
    private createDefaultConfig;
    private mergeConfig;
}

/**
 * Create a batch bundle for multiple operations (non-transactional)
 */
export declare function createBatchBundle(): FHIRBundleBuilder;

/**
 * Create a collection bundle
 */
export declare function createCollectionBundle(): FHIRBundleBuilder;

/**
 * Factory function to create compliance validator
 */
export declare function createComplianceValidator(logger: Logger): ComplianceValidator;

/**
 * Create a document bundle
 */
export declare function createDocumentBundle(composition: FHIRResource): FHIRBundleBuilder;

/**
 * Factory function to create encryption service
 */
export declare function createEncryptionService(config: EncryptionConfig, logger: Logger): EncryptionService;

export declare const createFontStyle: (rtl: boolean) => React.CSSProperties;

export declare const createGlassMorphismStyle: (props?: GlassMorphismProps) => GlassStyle;

/**
 * Factory function to create HIPAA audit logger
 */
export declare function createHIPAAAuditLogger(config: AuditLoggerConfig, logger: Logger): HIPAAAuditLogger;

/**
 * Factory function to create PHI data masker
 */
export declare function createPHIDataMasker(config: MaskingConfig, logger: Logger): PHIDataMasker;

/**
 * Factory function to create RBAC manager
 */
export declare function createRBACManager(logger: Logger): RBACManager;

export declare const createRTLStyle: (rtl?: boolean) => RTLStyle;

/**
 * Create a new Saudi patient builder
 */
export declare function createSaudiPatient(): SaudiPatientBuilder;

/**
 * Factory function to create session manager
 */
export declare function createSessionManager(config: SessionConfig, logger: Logger): SessionManager;

/**
 * Create a transaction bundle for multiple operations
 */
export declare function createTransactionBundle(): FHIRBundleBuilder;

/**
 * Utility function to create validation context
 */
export declare function createValidationContext(options: {
    data?: unknown;
    userId?: string;
    userRole?: string;
    permissions?: string[];
    sessionId?: string;
    sessionInfo?: {
        id: string;
        ipAddress?: string;
        userAgent?: string;
    };
    ipAddress?: string;
    userAgent?: string;
    operationType?: 'create' | 'read' | 'update' | 'delete' | 'export';
    resource?: string;
    resourceId?: string;
    auditLogged?: boolean;
    mfaVerified?: boolean;
    ipWhitelisted?: boolean;
    baaVerified?: boolean;
    retentionPolicyChecked?: boolean;
    additionalMetadata?: Record<string, unknown>;
}): ValidationContext;

export declare const darkModeGlassStyle: (props?: GlassMorphismProps) => GlassStyle;

declare interface DashboardFilter {
    id: string;
    name: string;
    type: 'select' | 'multiselect' | 'date' | 'daterange' | 'text' | 'number';
    placeholder?: string;
    options?: FilterOption[];
    value?: unknown;
    required?: boolean;
}

declare interface DashboardLayout {
    columns: number;
    rows: number;
    gaps: string;
    responsive: {
        breakpoint: string;
        columns: number;
    }[];
}

declare interface DashboardWidget {
    id: string;
    type: 'chart' | 'table' | 'metric' | 'list' | 'form' | 'map';
    title: string;
    subtitle?: string;
    position: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    dataSource: string;
    configuration: Record<string, unknown>;
    refreshInterval?: number;
    minHeight?: string;
    color?: string;
}

export declare const decrypt: (encryptedData: string, key: string) => string;

/**
 * Default masking configuration
 */
export declare const defaultMaskingConfig: MaskingConfig;

/**
 * Default session configuration for healthcare applications
 */
export declare const defaultSessionConfig: SessionConfig;

/**
 * Encryption utilities (placeholder)
 */
export declare const encrypt: (data: string, key: string) => string;

export declare interface EncryptedData {
    data: string;
    keyId: string;
    algorithm: string;
    iv?: string;
    tag?: string;
}

export declare interface EncryptionConfig {
    aes: {
        keySize: 256;
        algorithm: 'AES-256-GCM';
    };
    rsa: {
        keySize: 2048;
        algorithm: 'RSA-OAEP';
    };
    keyRotationInterval?: number;
}

export declare interface EncryptionKey {
    id: string;
    algorithm: string;
    key: string;
    createdAt: string;
    expiresAt?: string;
}

export declare class EncryptionService {
    private keys;
    private config;
    private logger;
    constructor(config: EncryptionConfig, logger: Logger);
    /**
     * Initialize encryption service with default keys
     */
    initialize(): Promise<void>;
    /**
     * Generate AES-256 encryption key
     */
    generateAESKey(keyId?: string): Promise<string>;
    /**
     * Generate RSA-2048 key pair
     */
    generateRSAKeyPair(keyId?: string): Promise<{
        publicKeyId: string;
        privateKeyId: string;
    }>;
    /**
     * Encrypt data using AES-256-GCM
     */
    encryptWithAES(data: string, keyId?: string): Promise<EncryptedData>;
    /**
     * Decrypt data using AES-256-GCM
     */
    decryptWithAES(encryptedData: EncryptedData): Promise<string>;
    /**
     * Encrypt data using RSA-OAEP (typically for small data like keys)
     */
    encryptWithRSA(data: string, publicKeyId?: string): Promise<EncryptedData>;
    /**
     * Decrypt data using RSA-OAEP
     */
    decryptWithRSA(encryptedData: EncryptedData): Promise<string>;
    /**
     * Encrypt PHI data with additional compliance checks
     */
    encryptPHI(data: string, metadata?: {
        patientId?: string;
        dataType?: string;
    }): Promise<EncryptedData>;
    /**
     * Decrypt PHI data with additional compliance checks
     */
    decryptPHI(encryptedData: EncryptedData, metadata?: {
        patientId?: string;
        dataType?: string;
    }): Promise<string>;
    /**
     * Rotate encryption keys
     */
    rotateKeys(): Promise<{
        rotated: string[];
        failed: string[];
    }>;
    /**
     * Get key information (without sensitive data)
     */
    getKeyInfo(keyId: string): Omit<EncryptionKey, 'key'> | null;
    /**
     * List all available keys (without sensitive data)
     */
    listKeys(): Array<Omit<EncryptionKey, 'key'>>;
    /**
     * Encrypt an object recursively
     */
    encryptObject(obj: Record<string, unknown>): Promise<Record<string, unknown>>;
    /**
     * Recursively decrypt an object's string values
     */
    decryptObject(encryptedObj: Record<string, unknown>): Promise<Record<string, unknown>>;
    /**
     * Generate random base64 string
     */
    private generateRandomBase64;
}

/**
 * Injects the base CSS needed for the BrainSAIT UI components. Calling this multiple
 * times is safe—the stylesheet will only be appended to the document once.
 */
export declare const ensureGlobalUIStyles: () => void;

export declare interface ErrorDetails {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    timestamp: string;
    requestId?: string;
    stackTrace?: string;
}

export declare interface ExtractedEntity {
    text: string;
    label: string;
    confidence: number;
    startIndex: number;
    endIndex: number;
    metadata?: Record<string, unknown>;
}

export declare interface FHIRAddress {
    use?: 'home' | 'work' | 'temp' | 'old' | 'billing';
    type?: 'postal' | 'physical' | 'both';
    line?: string[];
    city?: string;
    district?: string;
    state?: string;
    postalCode?: string;
    country?: string;
}

export declare interface FHIRBundle extends FHIRResource {
    resourceType: 'Bundle';
    type: 'document' | 'message' | 'transaction' | 'transaction-response' | 'batch' | 'batch-response' | 'history' | 'searchset' | 'collection';
    entry?: FHIRBundleEntry[];
    total?: number;
}

export declare class FHIRBundleBuilder {
    private bundle;
    constructor(type: BundleType, id?: string);
    /**
     * Add a resource to the bundle
     */
    addResource(resource: FHIRResource, fullUrl?: string): FHIRBundleBuilder;
    /**
     * Add a resource with request for transaction/batch bundles
     */
    addResourceWithRequest(resource: FHIRResource, method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH', url: string, fullUrl?: string): FHIRBundleBuilder;
    /**
     * Add a create request to transaction bundle
     */
    addCreate(resource: FHIRResource): FHIRBundleBuilder;
    /**
     * Add an update request to transaction bundle
     */
    addUpdate(resource: FHIRResource): FHIRBundleBuilder;
    /**
     * Add a delete request to transaction bundle
     */
    addDelete(resourceType: string, id: string): FHIRBundleBuilder;
    /**
     * Add a conditional create request
     */
    addConditionalCreate(resource: FHIRResource, condition: string): FHIRBundleBuilder;
    /**
     * Add a conditional update request
     */
    addConditionalUpdate(resource: FHIRResource, condition: string): FHIRBundleBuilder;
    /**
     * Set bundle metadata
     */
    setMeta(meta: FHIRBundle['meta']): FHIRBundleBuilder;
    /**
     * Set bundle total (for search results)
     */
    setTotal(total: number): FHIRBundleBuilder;
    /**
     * Build and return the bundle
     */
    build(): FHIRBundle;
    /**
     * Get current bundle (without cloning)
     */
    getBundle(): FHIRBundle;
}

export declare interface FHIRBundleEntry {
    fullUrl?: string;
    resource?: FHIRResource;
    search?: {
        mode?: 'match' | 'include' | 'outcome';
        score?: number;
    };
}

export declare interface FHIRBundleEntryComplete extends FHIRBundleEntry {
    request?: FHIRBundleRequest;
    response?: FHIRBundleResponse;
}

export declare class FHIRBundleProcessor {
    /**
     * Extract all resources from a bundle
     */
    static extractResources<T extends FHIRResource>(bundle: FHIRBundle): T[];
    /**
     * Extract resources of specific type from bundle
     */
    static extractResourcesByType<T extends FHIRResource>(bundle: FHIRBundle, resourceType: string): T[];
    /**
     * Find resource by ID in bundle
     */
    static findResourceById<T extends FHIRResource>(bundle: FHIRBundle, resourceType: string, id: string): T | undefined;
    /**
     * Validate bundle structure
     */
    static validateBundle(bundle: FHIRBundle): {
        isValid: boolean;
        errors: string[];
    };
    /**
     * Create a response bundle from a request bundle
     */
    static createResponseBundle(requestBundle: FHIRBundle, responses: Array<{
        status: string;
        location?: string;
        resource?: FHIRResource;
    }>): FHIRBundle;
    /**
     * Split large bundle into smaller chunks
     */
    static splitBundle(bundle: FHIRBundle, maxSize: number): FHIRBundle[];
    /**
     * Create a search result bundle
     */
    static createSearchBundle<T extends FHIRResource>(resources: T[], total?: number, links?: {
        self?: string;
        next?: string;
        previous?: string;
    }): FHIRBundle;
}

export declare interface FHIRBundleRequest {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    url: string;
    ifNoneMatch?: string;
    ifModifiedSince?: string;
    ifMatch?: string;
    ifNoneExist?: string;
}

export declare interface FHIRBundleResponse {
    status: string;
    location?: string;
    etag?: string;
    lastModified?: string;
    outcome?: FHIROperationOutcome;
}

export declare class FHIRClient {
    private config;
    private logger;
    private apiClient;
    private serverUrl;
    private authToken?;
    constructor(config: ConfigManager, logger: Logger, apiClient: ApiClient);
    initialize(): Promise<void>;
    healthCheck(): Promise<{
        status: string;
        responseTime: number;
    }>;
    shutdown(): Promise<void>;
    /**
     * Create a new FHIR resource
     */
    create<T extends FHIRResource>(resource: T): Promise<FHIRResponse<T>>;
    /**
     * Read a FHIR resource by ID
     */
    read<T extends FHIRResource>(resourceType: string, id: string, versionId?: string): Promise<FHIRResponse<T>>;
    /**
     * Update a FHIR resource
     */
    update<T extends FHIRResource>(resource: T): Promise<FHIRResponse<T>>;
    /**
     * Delete a FHIR resource
     */
    delete(resourceType: string, id: string): Promise<void>;
    /**
     * Search for FHIR resources
     */
    search<T extends FHIRResource>(resourceType: string, parameters?: FHIRSearchParameters): Promise<FHIRSearchResponse<T>>;
    /**
     * Submit a transaction bundle
     */
    transaction(bundle: FHIRBundle): Promise<FHIRResponse<FHIRBundle>>;
    /**
     * Submit a batch bundle
     */
    batch(bundle: FHIRBundle): Promise<FHIRResponse<FHIRBundle>>;
    /**
     * Get server capability statement
     */
    getCapabilityStatement(): Promise<FHIRResponse<FHIRResource>>;
    private authenticate;
    private getHeaders;
    private validateResource;
    private buildSearchUrl;
    private processResponse;
    private processSearchResponse;
    private handleError;
}

export declare interface FHIRClientConfig {
    serverUrl: string;
    version: 'R4' | 'R5';
    authentication?: {
        type: 'oauth2' | 'basic' | 'bearer';
        credentials: Record<string, string>;
    };
    timeout?: number;
    retries?: number;
}

export declare interface FHIRCodeableConcept {
    coding?: FHIRCoding[];
    text?: string;
}

export declare interface FHIRCoding {
    system?: string;
    version?: string;
    code?: string;
    display?: string;
}

export declare interface FHIRContactPoint {
    system?: 'phone' | 'fax' | 'email' | 'pager' | 'url' | 'sms' | 'other';
    value?: string;
    use?: 'home' | 'work' | 'temp' | 'old' | 'mobile';
}

export declare interface FHIRError extends Error {
    status: number;
    operationOutcome?: FHIROperationOutcome;
    resource?: string;
    operation?: string;
}

export declare interface FHIRExtension {
    url: string;
    valueString?: string;
    valueCode?: string;
    valueBoolean?: boolean;
    valueInteger?: number;
    valueUri?: string;
    extension?: FHIRExtension[];
}

export declare interface FHIRHumanName {
    use?: 'usual' | 'official' | 'temp' | 'nickname' | 'anonymous' | 'old' | 'maiden';
    family?: string;
    given?: string[];
    prefix?: string[];
    suffix?: string[];
}

export declare interface FHIRIdentifier {
    use?: 'usual' | 'official' | 'temp' | 'secondary' | 'old';
    type?: FHIRCodeableConcept;
    system?: string;
    value?: string;
}

export declare interface FHIRMeta {
    versionId?: string;
    lastUpdated?: string;
    profile?: string[];
    extension?: FHIRExtension[];
}

export declare interface FHIROperationOutcome extends FHIRResource {
    resourceType: 'OperationOutcome';
    issue: FHIROperationOutcomeIssue[];
}

export declare interface FHIROperationOutcomeIssue {
    severity: 'fatal' | 'error' | 'warning' | 'information';
    code: string;
    details?: FHIRCodeableConcept;
    diagnostics?: string;
    location?: string[];
    expression?: string[];
}

export declare interface FHIRPatient extends FHIRResource {
    resourceType: 'Patient';
    identifier?: FHIRIdentifier[];
    name?: FHIRHumanName[];
    telecom?: FHIRContactPoint[];
    gender?: 'male' | 'female' | 'other' | 'unknown';
    birthDate?: string;
    address?: FHIRAddress[];
}

/**
 * FHIR-related type definitions
 */
export declare interface FHIRResource {
    resourceType: string;
    id?: string;
    meta?: FHIRMeta;
}

declare interface FHIRResource_2 {
    resourceType: string;
    id?: string;
    meta?: {
        versionId?: string;
        lastUpdated?: string;
        profile?: string[];
    };
    [key: string]: unknown;
}

export declare interface FHIRResponse<T = FHIRResource> {
    data: T;
    status: number;
    headers: Record<string, string>;
    resourceId?: string;
    versionId?: string;
}

export declare interface FHIRSearchParameters {
    _id?: string;
    _lastUpdated?: string;
    _profile?: string;
    _security?: string;
    _source?: string;
    _tag?: string;
    _count?: number;
    _offset?: number;
    _sort?: string;
    _include?: string[];
    _revinclude?: string[];
    [key: string]: unknown;
}

export declare interface FHIRSearchResponse<T = FHIRResource> {
    data: FHIRBundle;
    total?: number;
    resources: T[];
    links: {
        self?: string;
        next?: string;
        previous?: string;
        first?: string;
        last?: string;
    };
}

export declare class FHIRValidator {
    /**
     * Validate a FHIR resource
     */
    validateResource(resource: FHIRResource): ValidationResult;
    /**
     * Convert validation result to FHIR OperationOutcome
     */
    toOperationOutcome(result: ValidationResult): FHIROperationOutcome;
    private validateBasicFHIR;
    private validatePatient;
    private validateSaudiExtensions;
    private isValidDateTime;
    private isValidDate;
    private isValidEmail;
    private isValidSaudiPhoneNumber;
    private isValidSaudiPostalCode;
    private containsArabic;
    private validateArabicText;
}

export declare const fhirValidator: FHIRValidator;

declare interface FilterOption {
    label: string;
    value: string | number;
    icon?: string;
}

/**
 * Monitor frame rate for UI performance
 */
export declare class FrameRateMonitor {
    private frameCount;
    private lastTime;
    private frameRates;
    private isMonitoring;
    private animationId?;
    /**
     * Start monitoring frame rate
     */
    start(): void;
    /**
     * Stop monitoring frame rate
     */
    stop(): void;
    /**
     * Get current average frame rate
     */
    getAverageFrameRate(): number;
    /**
     * Check if frame rate is acceptable for healthcare UI
     */
    isPerformanceAcceptable(): boolean;
    /**
     * Get performance status
     */
    getPerformanceStatus(): 'excellent' | 'good' | 'acceptable' | 'poor';
}

/**
 * Global frame rate monitor instance
 */
export declare const frameRateMonitor: FrameRateMonitor;

export declare const GlassMorphismButton: ({ type, onClick, children, icon, iconPosition, variant, size, fullWidth, animate, disabled, loading, rtl, ...baseProps }: GlassMorphismButtonProps) => ReactElement;

export declare interface GlassMorphismButtonProps extends Omit<BaseComponentProps, 'onClick'> {
    type?: 'button' | 'submit' | 'reset';
    onClick?: (event: default_2.MouseEvent<HTMLButtonElement>) => void;
    icon?: ReactNode;
    iconPosition?: 'left' | 'right';
    fullWidth?: boolean;
    animate?: boolean;
}

export declare const glassMorphismPresets: {
    readonly card: {
        readonly opacity: 0.1;
        readonly blur: 20;
        readonly borderRadius: "16px";
        readonly border: true;
        readonly shadow: true;
    };
    readonly button: {
        readonly opacity: 0.15;
        readonly blur: 10;
        readonly borderRadius: "8px";
        readonly border: true;
        readonly shadow: false;
    };
    readonly modal: {
        readonly opacity: 0.08;
        readonly blur: 30;
        readonly borderRadius: "20px";
        readonly border: true;
        readonly shadow: true;
    };
    readonly navbar: {
        readonly opacity: 0.12;
        readonly blur: 15;
        readonly borderRadius: "0px";
        readonly border: false;
        readonly shadow: true;
    };
};

export declare interface GlassMorphismProps {
    opacity?: number;
    blur?: number;
    borderRadius?: string;
    border?: boolean;
    shadow?: boolean;
}

declare interface GlassStyle extends React.CSSProperties {
    backdropFilter: string;
    backgroundColor: string;
    border: string;
    borderRadius: string;
    boxShadow: string;
}

export declare const HealthcareDashboard: ({ dashboard, onWidgetClick, onFilterChange, data, refreshInterval, isLoading, rtl, ...baseProps }: HealthcareDashboardProps) => ReactElement;

declare interface HealthcareDashboard_2 {
    id: string;
    title: string;
    layout: DashboardLayout;
    widgets: DashboardWidget[];
    filters?: DashboardFilter[];
    refreshInterval?: number;
    permissions: string[];
}

export declare interface HealthcareDashboardProps extends BaseComponentProps {
    dashboard: HealthcareDashboard_2;
    onWidgetClick?: (widget: DashboardWidget) => void;
    onFilterChange?: (filters: Record<string, unknown>) => void;
    data?: Record<string, unknown>;
    refreshInterval?: number;
    isLoading?: boolean;
}

/**
 * Advanced performance profiler for healthcare operations
 */
export declare class HealthcarePerformanceProfiler {
    private measurements;
    private activeTimers;
    /**
     * Start timing an operation
     */
    startTimer(operationName: string): void;
    /**
     * End timing an operation and record the measurement
     */
    endTimer(operationName: string): number;
    /**
     * Get performance statistics for an operation
     */
    getStats(operationName: string): {
        count: number;
        average: number;
        min: number;
        max: number;
        total: number;
        p95: number;
        p99: number;
    } | null;
    /**
     * Get all operation statistics
     */
    getAllStats(): Record<string, ReturnType<HealthcarePerformanceProfiler['getStats']>>;
    /**
     * Clear all measurements
     */
    clear(): void;
    /**
     * Check if operation is performing well (under threshold)
     */
    isPerformingWell(operationName: string, thresholdMs: number): boolean;
    /**
     * Generate performance report for healthcare operations
     */
    generateHealthcareReport(): {
        totalOperations: number;
        slowOperations: string[];
        fastOperations: string[];
        recommendations: string[];
        performanceScore: number;
    };
}

/**
 * Global healthcare performance profiler instance
 */
export declare const healthcareProfiler: HealthcarePerformanceProfiler;

export declare interface HealthcareTheme {
    theme: 'light' | 'dark' | 'auto';
    rtl: boolean;
    glassMorphism: {
        enabled: boolean;
        opacity: number;
        blur: number;
    };
    performance: {
        targetFps: number;
        lazyLoading: boolean;
        virtualScrolling: boolean;
    };
}

export declare interface HealthcheckResponse {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    version: string;
    services: {
        [serviceName: string]: {
            status: 'up' | 'down';
            responseTime?: number;
            error?: string;
        };
    };
}

export declare class HIPAAAuditLogger {
    private logs;
    private config;
    private logger;
    constructor(config: AuditLoggerConfig, logger: Logger);
    /**
     * Log a HIPAA-compliant audit event
     */
    logEvent(event: Omit<AuditLog, 'id' | 'timestamp'>): Promise<string>;
    /**
     * Process audit based on HIPAA compliance level
     */
    private processAuditLevel;
    /**
     * Mask PHI data for logging
     */
    private maskPHI;
    /**
     * Mask PHI in complex details object
     */
    private maskPHIInDetails;
    /**
     * Send audit log to remote endpoint
     */
    private sendToEndpoint;
    /**
     * Retrieve audit logs with filters
     */
    getAuditLogs(filters?: {
        userId?: string;
        eventType?: AuditLog['eventType'];
        startDate?: string;
        endDate?: string;
        outcome?: AuditLog['outcome'];
    }): Promise<AuditLog[]>;
    /**
     * Clean up old audit logs based on retention policy
     */
    cleanupOldLogs(): Promise<number>;
    /**
     * Get audit statistics
     */
    getAuditStats(): Promise<{
        totalLogs: number;
        logsByEventType: Record<string, number>;
        logsByOutcome: Record<string, number>;
        oldestLog?: string;
        newestLog?: string;
    }>;
}

export declare interface HIPAACompliance {
    dataClassification: 'phi' | 'non-phi' | 'de-identified';
    accessControls: {
        role: string;
        permissions: string[];
    }[];
    auditRequirements: {
        logLevel: 'minimal' | 'standard' | 'comprehensive';
        retentionPeriod: number;
        automaticReporting: boolean;
    };
    encryptionRequirements: {
        atRest: boolean;
        inTransit: boolean;
        algorithm: string;
    };
}

/**
 * JWT token management (placeholder)
 */
export declare interface JWTManager {
}

export declare class LegacyFHIRClient {
    private _config;
    private logger;
    private _apiClient;
    constructor(_config: ConfigManager, logger: Logger, _apiClient: ApiClient);
    initialize(): Promise<void>;
    healthCheck(): Promise<{
        status: string;
        responseTime: number;
    }>;
    shutdown(): Promise<void>;
}

/**
 * Common types and interfaces used throughout the SDK
 */
export declare type Locale = 'ar' | 'en';

export declare interface LogConfig {
    level: 'debug' | 'info' | 'warn' | 'error';
    format: 'json' | 'text';
    outputs: ('console' | 'file' | 'remote' | 'cloudflare')[];
    file?: {
        path: string;
        maxSize: string;
        maxFiles: number;
    };
    remote?: {
        endpoint: string;
        apiKey: string;
    };
    cloudflare?: {
        datasetId: string;
        token: string;
    };
    healthcare?: {
        auditTrail: boolean;
        hipaaCompliant: boolean;
        patientDataMasking: boolean;
    };
}

export declare class Logger {
    private logger;
    constructor(config: LoggingConfig);
    debug(message: string, ...args: unknown[]): void;
    info(message: string, ...args: unknown[]): void;
    warn(message: string, ...args: unknown[]): void;
    error(message: string, error?: Error, ...args: unknown[]): void;
    child(bindings: Record<string, unknown>): Logger;
}

/**
 * Logging utilities for the SDK
 */
export declare interface LoggingConfig {
    level: 'debug' | 'info' | 'warn' | 'error';
    format: 'json' | 'text';
    outputs: ('console' | 'file' | 'remote')[];
}

export declare interface MaskingConfig {
    defaultMaskChar: string;
    preserveFormat: boolean;
    maskingPatterns: {
        ssn: boolean;
        phone: boolean;
        email: boolean;
        nationalId: boolean;
        medicalRecordNumber: boolean;
        accountNumber: boolean;
        certificateNumber: boolean;
        vehicleIdentifier: boolean;
        deviceIdentifier: boolean;
        webUrl: boolean;
        ipAddress: boolean;
        biometricIdentifier: boolean;
        facePhotograph: boolean;
        otherUniqueIdentifier: boolean;
    };
}

export declare interface MaskingRule {
    field: string;
    type: 'full' | 'partial' | 'format' | 'hash' | 'tokenize';
    preserveLength?: boolean;
    preserveFormat?: boolean;
    visibleChars?: number;
    customPattern?: RegExp;
}

export declare const measureAsyncTime: <T>(fn: () => Promise<T>) => Promise<[T, number]>;

/**
 * Decorator for measuring function performance
 */
export declare function measurePerformance(operationName: string): <T extends (...args: unknown[]) => unknown>(target: unknown, propertyKey: string, descriptor: TypedPropertyDescriptor<T>) => TypedPropertyDescriptor<T>;

/**
 * Enhanced performance utilities for healthcare applications
 */
export declare const measureTime: <T>(fn: () => T) => [T, number];

/**
 * Multi-factor authentication support (placeholder)
 */
export declare interface MFAManager {
}

export declare interface NLPRequest {
    text: string;
    language: 'ar' | 'en';
    tasks: ('entity-extraction' | 'sentiment-analysis' | 'translation' | 'summarization')[];
    context?: {
        patientId?: string;
        resourceType?: string;
        specialty?: string;
    };
}

export declare interface NLPResponse {
    requestId: string;
    results: {
        entities?: ExtractedEntity[];
        sentiment?: SentimentScore;
        translation?: TranslationResult;
        summary?: string;
    };
    confidence: number;
    processingTime: number;
}

declare interface NotificationConfig {
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
    duration?: number;
    placement?: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'top' | 'bottom';
    rtl?: boolean;
}

export declare interface NotificationInstance extends NotificationConfig {
    id: string;
    timestamp: number;
    priority?: 'low' | 'medium' | 'high' | 'critical';
    category?: 'system' | 'security' | 'patient' | 'workflow' | 'compliance';
    acknowledged?: boolean;
    readAt?: number;
    metadata?: Record<string, unknown>;
}

export declare const NotificationSystem: ({ maxNotifications, defaultDuration, position, rtl, ...baseProps }: NotificationSystemProps) => ReactElement;

export declare interface NotificationSystemProps extends BaseComponentProps {
    maxNotifications?: number;
    defaultDuration?: number;
    position?: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'top' | 'bottom';
}

export declare interface NPHIESAuthToken {
    access_token: string;
    token_type: string;
    expires_in: number;
    scope: string;
    issued_at: number;
}

export declare interface NPHIESClaim {
    resourceType: 'Claim';
    id?: string;
    status: 'active' | 'cancelled' | 'draft' | 'entered-in-error';
    type: {
        coding: [
            {
            system: 'http://terminology.hl7.org/CodeSystem/claim-type';
            code: 'institutional' | 'oral' | 'pharmacy' | 'professional' | 'vision';
        }
        ];
    };
    patient: {
        reference: string;
    };
    created: string;
    provider: {
        reference: string;
    };
    priority: {
        coding: [
            {
            system: 'http://terminology.hl7.org/CodeSystem/processpriority';
            code: 'normal' | 'stat';
        }
        ];
    };
    item?: NPHIESClaimItem[];
    total?: {
        value: number;
        currency: 'SAR';
    };
}

export declare interface NPHIESClaimItem {
    sequence: number;
    productOrService: {
        coding: [
            {
            system: string;
            code: string;
            display?: string;
        }
        ];
    };
    quantity?: {
        value: number;
    };
    unitPrice?: {
        value: number;
        currency: 'SAR';
    };
    net?: {
        value: number;
        currency: 'SAR';
    };
}

export declare class NPHIESClient {
    private config;
    private logger;
    private apiClient;
    constructor(config: ConfigManager, // Will be used in future implementation
    logger: Logger, apiClient: ApiClient);
    initialize(): Promise<void>;
    healthCheck(): Promise<{
        status: string;
        responseTime: number;
    }>;
    shutdown(): Promise<void>;
}

/**
 * NPHIES-specific type definitions for Saudi Arabia
 */
export declare interface NPHIESConfig {
    baseUrl: string;
    clientId: string;
    clientSecret?: string;
    scope: string[];
    sandbox: boolean;
}

export declare interface NPHIESCoverageEligibilityRequest {
    resourceType: 'CoverageEligibilityRequest';
    id?: string;
    status: 'active' | 'cancelled' | 'draft' | 'entered-in-error';
    priority?: {
        coding: [
            {
            system: 'http://terminology.hl7.org/CodeSystem/processpriority';
            code: 'normal' | 'stat';
        }
        ];
    };
    purpose: ('auth-requirements' | 'benefits' | 'discovery' | 'validation')[];
    patient: {
        reference: string;
    };
    created: string;
    provider: {
        reference: string;
    };
    insurer: {
        reference: string;
    };
    item?: NPHIESEligibilityItem[];
}

export declare interface NPHIESEligibilityItem {
    sequence: number;
    productOrService: {
        coding: [
            {
            system: string;
            code: string;
            display?: string;
        }
        ];
    };
    quantity?: {
        value: number;
    };
}

export declare interface NPHIESError {
    code: string;
    severity: 'error' | 'warning' | 'information';
    diagnostics: string;
    location?: string[];
}

export declare interface NPHIESSubmissionRequest {
    submissionId: string;
    resourceType: 'Claim' | 'ClaimResponse' | 'CoverageEligibilityRequest' | 'CoverageEligibilityResponse';
    data: FHIRResource_2;
    priority?: 'routine' | 'urgent' | 'asap' | 'stat';
}

export declare interface NPHIESSubmissionResponse {
    submissionId: string;
    status: 'accepted' | 'rejected' | 'pending';
    outcomeCode?: string;
    outcomeDescription?: string;
    responseData?: FHIRResource_2;
    errors?: NPHIESError[];
    warnings?: NPHIESWarning[];
}

export declare interface NPHIESWarning {
    code: string;
    severity: 'warning' | 'information';
    diagnostics: string;
    location?: string[];
}

export declare interface OrchestratedCarePlanInput {
    note: string;
    patient: PyBrainPatientProfile & {
        id?: string;
        name?: string;
    };
    context?: PyHeartWorkflowInput['context'];
    careTeam?: string[];
}

export declare interface OrchestratedPythonCarePlan {
    entities: PyBrainEntitiesResponse;
    risk: PyBrainRiskResponse;
    workflow: PyHeartWorkflowResult;
}

/**
 * Convenience helper that runs entity extraction, risk scoring, and a
 * PyHeart workflow sequentially. This is useful for end-to-end demos
 * inside the SDK samples.
 */
export declare function orchestratePythonCarePlan(input: OrchestratedCarePlanInput, options?: PythonBridgeOptions): Promise<OrchestratedPythonCarePlan>;

export declare interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        hasNext: boolean;
        hasPrevious: boolean;
    };
}

export declare const PatientCard: ({ patient, showPhoto, showIdentifiers, showContact, onPatientClick, compact, rtl, ...baseProps }: PatientCardProps) => ReactElement;

export declare interface PatientCardProps extends BaseComponentProps {
    patient: UIPatientData;
    showPhoto?: boolean;
    showIdentifiers?: boolean;
    showContact?: boolean;
    onPatientClick?: (patient: UIPatientData) => void;
    compact?: boolean;
}

export declare interface PatientData {
    id: string;
    demographics?: {
        age?: number;
        gender?: string;
        dateOfBirth?: string;
    };
    vitals?: Record<string, number>;
    conditions?: string[];
    medications?: string[];
    allergies?: string[];
    labResults?: Record<string, unknown>;
}

export declare interface PerformanceConfig {
    targetFps: number;
    lazyLoading: boolean;
    virtualScrolling: boolean;
}

export declare interface PerformanceMetrics {
    apiResponseTime: number;
    uiFrameRate: number;
    memoryUsage: number;
    concurrentUsers: number;
}

export declare class PerformanceMonitor {
    private config;
    private onMetric?;
    private metrics;
    private intervalId?;
    private frameCount;
    private lastFrameTime;
    constructor(config: PerformanceConfig, onMetric?: (metric: PerformanceMetrics) => void);
    start(): void;
    stop(): Promise<void>;
    getMetrics(): PerformanceMetrics;
    recordApiResponse(responseTime: number): void;
    incrementConcurrentUsers(): void;
    decrementConcurrentUsers(): void;
    private updateMetrics;
    private startFpsMonitoring;
    debounce<T extends (...args: unknown[]) => void>(func: T, wait: number): T;
    throttle<T extends (...args: unknown[]) => void>(func: T, limit: number): T;
    memoize<T extends (...args: unknown[]) => unknown>(func: T): T;
    createVirtualList<T>(items: T[], containerHeight: number, itemHeight: number): {
        visibleItems: T[];
        startIndex: number;
        endIndex: number;
    };
}

export declare interface Permission {
    resource: string;
    actions: ('create' | 'read' | 'update' | 'delete' | 'search')[];
    conditions?: PermissionCondition[];
}

export declare interface PermissionCondition {
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'in' | 'not_in';
    value: unknown;
}

/**
 * Permission validation middleware (placeholder)
 */
export declare interface PermissionMiddleware {
}

export declare class PHIDataMasker {
    private config;
    private logger;
    private maskingRules;
    constructor(config: MaskingConfig, logger: Logger);
    /**
     * Initialize default masking rules for common PHI fields
     */
    private initializeDefaultRules;
    /**
     * Add or update a masking rule
     */
    addMaskingRule(rule: MaskingRule): void;
    /**
     * Remove a masking rule
     */
    removeMaskingRule(field: string): boolean;
    /**
     * Mask a single value based on field type
     */
    maskValue(value: unknown, field: string): unknown;
    /**
     * Mask an entire object, applying rules to known PHI fields
     */
    maskObject<T extends Record<string, unknown>>(obj: T): T;
    /**
     * Apply full masking (replace all characters)
     */
    private applyFullMasking;
    /**
     * Apply partial masking (show first/last few characters)
     */
    private applyPartialMasking;
    /**
     * Apply format-specific masking
     */
    private applyFormatMasking;
    /**
     * Mask Social Security Number (XXX-XX-1234 format)
     */
    private maskSSN;
    /**
     * Mask National ID (Saudi format: 1234567890)
     */
    private maskNationalId;
    /**
     * Mask phone number
     */
    private maskPhone;
    /**
     * Mask email address
     */
    private maskEmail;
    /**
     * Mask IP address
     */
    private maskIPAddress;
    /**
     * Mask date (keep only year if specified)
     */
    private maskDate;
    /**
     * Apply hash masking (one-way hash for consistent masking)
     */
    private applyHashMasking;
    /**
     * Apply tokenization (replace with a token)
     */
    private applyTokenization;
    /**
     * Check if a field contains PHI
     */
    isPHIField(field: string): boolean;
    /**
     * Get masking statistics
     */
    getMaskingStats(): {
        totalRules: number;
        rulesByType: Record<string, number>;
        phiFields: string[];
    };
    /**
     * Validate masking configuration
     */
    validateConfiguration(): {
        isValid: boolean;
        errors: string[];
    };
}

export declare interface Prediction {
    outcome: string;
    probability: number;
    confidence: number;
    timeframe?: string;
    factors?: PredictionFactor[];
}

export declare interface PredictionFactor {
    name: string;
    importance: number;
    value: unknown;
    impact: 'positive' | 'negative' | 'neutral';
}

export declare interface PredictiveAnalytics {
    modelType: 'risk-assessment' | 'readmission' | 'outcome-prediction' | 'resource-planning';
    inputData: Record<string, unknown>;
    predictions: Prediction[];
    modelMetrics: {
        accuracy: number;
        lastTrainingDate: string;
        dataQualityScore: number;
    };
}

export declare function predictPatientRisk(patient: PyBrainPatientProfile, options?: PythonBridgeOptions): Promise<PyBrainRiskResponse>;

export declare interface PyBrainEntitiesResponse {
    entities: Record<string, string[]>;
    meta: {
        model: string;
        modelType: string;
    };
}

export declare interface PyBrainPatientProfile {
    age?: number;
    bmi?: number;
    conditions?: string[];
    medications?: string[];
    smoking?: boolean;
    [key: string]: unknown;
}

export declare interface PyBrainRiskResponse {
    riskScore: number;
    secondaryScores: {
        readmission: number;
        fall: number;
    };
}

export declare interface PyHeartTaskResult {
    status: string;
    output?: unknown;
    error?: string | null;
    startedAt?: string | null;
    completedAt?: string | null;
}

export declare interface PyHeartWorkflowInput {
    patient: {
        id?: string;
        name?: string;
        [key: string]: unknown;
    };
    riskScore: number;
    context?: {
        fhirServer?: string;
        primaryPhysician?: string;
        [key: string]: unknown;
    };
    careTeam?: string[];
}

export declare interface PyHeartWorkflowResult {
    instanceId: string;
    status: string;
    variables: Record<string, unknown>;
    tasks: Record<string, PyHeartTaskResult>;
    riskScore: number;
}

/**
 * Type contracts for the Python bridge that exposes PyBrain/PyHeart
 * functionality to the TypeScript SDK.
 */
export declare interface PythonBridgeOptions {
    pythonPath?: string;
    timeoutMs?: number;
    env?: NodeJS.ProcessEnv;
}

export declare class RBACManager {
    private roles;
    private users;
    private logger;
    constructor(logger: Logger);
    /**
     * Initialize default healthcare roles
     */
    private initializeDefaultRoles;
    /**
     * Create a new role
     */
    createRole(roleData: Omit<Role, 'createdAt' | 'updatedAt'>): Promise<Role>;
    /**
     * Update an existing role
     */
    updateRole(roleId: string, updates: Partial<Omit<Role, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Role | null>;
    /**
     * Delete a role
     */
    deleteRole(roleId: string): Promise<boolean>;
    /**
     * Get role by ID
     */
    getRole(roleId: string): Role | null;
    /**
     * List all roles
     */
    listRoles(activeOnly?: boolean): Role[];
    /**
     * Create or update a user
     */
    setUser(userData: User): Promise<User>;
    /**
     * Get user by ID
     */
    getUser(userId: string): User | null;
    /**
     * Remove a user
     */
    removeUser(userId: string): Promise<boolean>;
    /**
     * Check if user has access to perform an action
     */
    checkAccess(context: AccessContext): Promise<AccessResult>;
    /**
     * Get user permissions summary
     */
    getUserPermissions(userId: string): {
        roles: string[];
        permissions: Permission[];
        restrictions: Restriction[];
    };
    /**
     * Check if permission matches the access context
     */
    private matchesPermission;
    /**
     * Evaluate permission conditions
     */
    private evaluateConditions;
    /**
     * Evaluate a single condition
     */
    private evaluateCondition;
    /**
     * Get nested value from an object using dot notation
     */
    private getNestedValue;
    /**
     * Check if any restrictions are violated
     */
    private checkRestrictions;
    /**
     * Evaluate a single restriction
     */
    private evaluateRestriction;
    /**
     * Check if data contains clinical information
     */
    private containsClinicalData;
    /**
     * Check if data reference points to the user themselves
     */
    private isSelfReference;
    /**
     * Get RBAC statistics
     */
    getRBACStats(): {
        totalRoles: number;
        activeRoles: number;
        totalUsers: number;
        activeUsers: number;
        totalPermissions: number;
        totalRestrictions: number;
    };
}

export declare type ResidencyType = 'citizen' | 'resident' | 'visitor';

export declare interface Restriction {
    type: 'time' | 'location' | 'network' | 'device' | 'data_access' | 'field_access' | 'access_mode';
    rule: string;
    description: string;
    rules?: RestrictionRule[];
}

export declare interface RestrictionRule {
    condition: string;
    value: unknown;
    effect: 'allow' | 'deny';
}

export declare interface Role {
    id: string;
    name: string;
    description: string;
    permissions: Permission[];
    restrictions?: Restriction[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    metadata?: Record<string, unknown>;
}

export declare interface RoleBasedAccess {
    role: string;
    permissions: Permission[];
    restrictions?: Restriction[];
}

export declare const rtlAwareMargin: (rtl: boolean, left: string, right: string) => React.CSSProperties;

export declare const rtlAwarePadding: (rtl: boolean, left: string, right: string) => React.CSSProperties;

export declare const rtlAwarePosition: (rtl: boolean, leftPos?: string, rightPos?: string) => React.CSSProperties;

/**
 * RTL (Right-to-Left) support utilities for Arabic localization
 */
declare interface RTLStyle extends React.CSSProperties {
    direction: 'ltr' | 'rtl';
    textAlign?: 'left' | 'right' | 'center';
}

export declare const rtlTransform: (rtl: boolean, transform?: string) => React.CSSProperties;

export declare function runRiskWorkflow(input: PyHeartWorkflowInput, options?: PythonBridgeOptions): Promise<PyHeartWorkflowResult>;

export declare const SAUDI_REGIONS: readonly ["riyadh", "makkah", "madinah", "qassim", "eastern", "asir", "tabuk", "hail", "northern-borders", "jazan", "najran", "al-bahah", "al-jawf"];

export declare const SAUDI_SYSTEMS: {
    readonly NATIONAL_ID: "https://fhir.nphies.sa/CodeSystem/identifier";
    readonly FAMILY_CARD: "https://fhir.nphies.sa/CodeSystem/family-card";
    readonly SPONSOR_ID: "https://fhir.nphies.sa/CodeSystem/sponsor";
    readonly REGION: "https://fhir.nphies.sa/CodeSystem/region";
    readonly RESIDENCY_TYPE: "https://fhir.nphies.sa/CodeSystem/residency-type";
    readonly PATIENT_EXTENSION: "https://fhir.nphies.sa/StructureDefinition/saudi-patient";
};

export declare class SaudiExtensionHelper {
    /**
     * Extract Saudi National ID from patient
     */
    static getSaudiNationalId(patient: FHIRPatient): string | undefined;
    /**
     * Extract family card number from patient
     */
    static getFamilyCardNumber(patient: FHIRPatient): string | undefined;
    /**
     * Extract residency type from patient extension
     */
    static getResidencyType(patient: FHIRPatient): ResidencyType | undefined;
    /**
     * Extract region from patient extension
     */
    static getRegion(patient: FHIRPatient): SaudiRegion | undefined;
    /**
     * Check if patient is a Saudi citizen
     */
    static isSaudiCitizen(patient: FHIRPatient): boolean;
    /**
     * Get Arabic name from patient
     */
    static getArabicName(patient: FHIRPatient): {
        family?: string;
        given?: string[];
    } | undefined;
    /**
     * Get English name from patient
     */
    static getEnglishName(patient: FHIRPatient): {
        family?: string;
        given?: string[];
    } | undefined;
    private static getExtensionValue;
}

export declare class SaudiPatientBuilder {
    private patient;
    constructor();
    /**
     * Set Saudi National ID
     */
    setSaudiNationalId(nationalId: string, skipValidation?: boolean): SaudiPatientBuilder;
    /**
     * Set family card number
     */
    setFamilyCardNumber(familyCard: string): SaudiPatientBuilder;
    /**
     * Set sponsor ID (for residents and visitors)
     */
    setSponsorId(sponsorId: string): SaudiPatientBuilder;
    /**
     * Set residency type
     */
    setResidencyType(type: ResidencyType): SaudiPatientBuilder;
    /**
     * Set Saudi region
     */
    setRegion(region: SaudiRegion): SaudiPatientBuilder;
    /**
     * Set Arabic name
     */
    setArabicName(family: string, given: string[]): SaudiPatientBuilder;
    /**
     * Set English name
     */
    setEnglishName(family: string, given: string[]): SaudiPatientBuilder;
    /**
     * Set basic patient information
     */
    setBasicInfo(gender: 'male' | 'female' | 'other' | 'unknown', birthDate: string): SaudiPatientBuilder;
    /**
     * Set Saudi phone number
     */
    setSaudiPhoneNumber(phoneNumber: string, use?: 'home' | 'work' | 'mobile'): SaudiPatientBuilder;
    /**
     * Set Saudi address
     */
    setSaudiAddress(city: string, district?: string, postalCode?: string, addressLine?: string[]): SaudiPatientBuilder;
    /**
     * Build the Saudi patient profile
     */
    build(): SaudiPatientProfile;
    private addExtension;
    private normalizeSaudiPhoneNumber;
}

export declare interface SaudiPatientExtension {
    saudiNationalId?: string;
    familyCardNumber?: string;
    sponsorId?: string;
    residencyType?: 'citizen' | 'resident' | 'visitor';
    region?: string;
}

export declare interface SaudiPatientProfile extends FHIRPatient {
    identifier: FHIRIdentifier[];
    extension?: Array<{
        url: typeof SAUDI_SYSTEMS.PATIENT_EXTENSION;
        extension: Array<{
            url: string;
            valueString?: string;
            valueCode?: string;
            valueBoolean?: boolean;
        }>;
    }>;
}

export declare type SaudiRegion = (typeof SAUDI_REGIONS)[number];

/**
 * Configuration types for the SDK
 */
export declare interface SDKConfig {
    /** Environment configuration */
    environment: 'development' | 'staging' | 'production';
    /** API configuration */
    api: {
        baseUrl: string;
        timeout: number;
        retries: number;
        rateLimit?: {
            requests: number;
            window: number;
        };
    };
    /** FHIR server configuration */
    fhir: {
        serverUrl: string;
        version: 'R4' | 'R5';
        authentication?: {
            type: 'oauth2' | 'basic' | 'bearer';
            credentials: Record<string, string>;
        };
    };
    /** NPHIES specific configuration */
    nphies: {
        baseUrl: string;
        clientId: string;
        clientSecret?: string;
        scope: string[];
        sandbox: boolean;
    };
    /** Security configuration */
    security: {
        encryption: {
            algorithm: string;
            keySize: number;
        };
        audit: {
            enabled: boolean;
            endpoint?: string;
        };
        hipaa: {
            enabled: boolean;
            auditLevel: 'minimal' | 'standard' | 'comprehensive';
        };
    };
    /** Localization configuration */
    localization: {
        defaultLanguage: 'ar' | 'en';
        supportedLanguages: string[];
        rtl: boolean;
    };
    /** AI configuration */
    ai?: {
        enabled: boolean;
        providers: {
            nlp?: {
                endpoint: string;
                model: string;
            };
            analytics?: {
                endpoint: string;
                model: string;
            };
        };
    };
    /** Analytics configuration */
    analytics?: {
        enabled: boolean;
    };
    caching?: {
        enabled: boolean;
        defaultTTL: number;
    };
    /** UI configuration */
    ui: {
        theme: 'light' | 'dark' | 'auto';
        glassMorphism: {
            enabled: boolean;
            opacity: number;
            blur: number;
        };
        performance: {
            targetFps: number;
            lazyLoading: boolean;
            virtualScrolling: boolean;
        };
    };
    /** Logging configuration */
    logging?: LogConfig;
}

export declare interface SDKInitOptions extends Partial<SDKConfig> {
    /** Custom configuration validator */
    validator?: (config: SDKConfig) => boolean;
    /** Performance monitoring callback */
    onPerformanceMetric?: (metric: PerformanceMetrics) => void;
    /** Error handler */
    onError?: (error: Error) => void;
}

/**
 * Security and compliance type definitions
 */
export declare interface SecurityConfig {
    encryption: {
        algorithm: string;
        keySize: number;
    };
    audit: {
        enabled: boolean;
        endpoint?: string;
    };
    hipaa: {
        enabled: boolean;
        auditLevel: 'minimal' | 'standard' | 'comprehensive';
    };
}

export declare class SecurityManager {
    private config;
    private logger;
    private auditLogger?;
    private encryptionService?;
    private phiMasker?;
    private sessionManager?;
    private complianceValidator?;
    private rbacManager?;
    constructor(config: ConfigManager, logger: Logger);
    initialize(): Promise<void>;
    healthCheck(): Promise<{
        status: string;
        encryption: string;
        audit: string;
        compliance: string;
        rbac: string;
    }>;
    shutdown(): Promise<void>;
    getAuditLogger(): HIPAAAuditLogger | undefined;
    getEncryptionService(): EncryptionService | undefined;
    getPHIMasker(): PHIDataMasker | undefined;
    getSessionManager(): SessionManager | undefined;
    getComplianceValidator(): ComplianceValidator | undefined;
    getRBACManager(): RBACManager | undefined;
}

export declare interface SecurityPolicy {
    passwordRequirements: {
        minLength: number;
        requireUppercase: boolean;
        requireLowercase: boolean;
        requireNumbers: boolean;
        requireSpecialChars: boolean;
    };
    sessionManagement: {
        maxDuration: number;
        idleTimeout: number;
        maxConcurrentSessions: number;
    };
    auditLogging: {
        enabled: boolean;
        level: 'minimal' | 'standard' | 'comprehensive';
        retention: number;
    };
}

export declare interface SentimentScore {
    overall: number;
    aspects: {
        [aspect: string]: number;
    };
    confidence: number;
}

export declare interface SessionConfig {
    maxDuration: number;
    idleTimeout: number;
    maxConcurrentSessions: number;
    secureTransport: boolean;
    sessionTokenLength: number;
    renewBeforeExpiry: number;
}

export declare interface SessionData {
    sessionId: string;
    userId: string;
    userRole: string;
    permissions: string[];
    createdAt: string;
    lastActivity: string;
    expiresAt: string;
    ipAddress?: string;
    userAgent?: string;
    isActive: boolean;
    metadata?: Record<string, unknown>;
}

export declare interface SessionEvent {
    sessionId: string;
    eventType: 'created' | 'renewed' | 'expired' | 'terminated' | 'activity';
    timestamp: string;
    details?: Record<string, unknown>;
}

export declare class SessionManager {
    private sessions;
    private userSessions;
    private config;
    private logger;
    private cleanupInterval;
    constructor(config: SessionConfig, logger: Logger);
    /**
     * Create a new session
     */
    createSession(userId: string, userRole: string, permissions: string[], metadata?: {
        ipAddress?: string;
        userAgent?: string;
        additionalData?: Record<string, unknown>;
    }): Promise<SessionData>;
    /**
     * Validate and retrieve session
     */
    validateSession(sessionId: string, ipAddress?: string): Promise<SessionData | null>;
    /**
     * Renew session (extend expiration)
     */
    renewSession(sessionId: string): Promise<SessionData | null>;
    /**
     * Terminate a session
     */
    terminateSession(sessionId: string, reason?: string): Promise<boolean>;
    /**
     * Terminate all sessions for a user
     */
    terminateUserSessions(userId: string, except?: string): Promise<number>;
    /**
     * Get active sessions for a user
     */
    getUserSessions(userId: string): SessionData[];
    /**
     * Get session information (without sensitive data)
     */
    getSessionInfo(sessionId: string): Omit<SessionData, 'metadata'> | null;
    /**
     * Get all active sessions (admin function)
     */
    getAllActiveSessions(): Array<Omit<SessionData, 'metadata'>>;
    /**
     * Update session permissions
     */
    updateSessionPermissions(sessionId: string, permissions: string[]): Promise<boolean>;
    /**
     * Check if session has specific permission
     */
    hasPermission(sessionId: string, permission: string): boolean;
    /**
     * Get session statistics
     */
    getSessionStats(): {
        totalSessions: number;
        activeSessions: number;
        expiredSessions: number;
        userCount: number;
        averageSessionDuration: number;
        sessionsPerUser: Record<string, number>;
    };
    /**
     * Start automatic cleanup process
     */
    private startCleanupProcess;
    /**
     * Stop cleanup process
     */
    stopCleanupProcess(): void;
    /**
     * Clean up expired sessions
     */
    private cleanupExpiredSessions;
    /**
     * Generate secure session ID
     */
    private generateSessionId;
    /**
     * Log session events for audit
     */
    private logSessionEvent;
    /**
     * Shutdown session manager
     */
    shutdown(): Promise<void>;
}

export declare const showError: (title: string, message?: string, duration?: number) => string;

export declare const showInfo: (title: string, message?: string, duration?: number) => string;

export declare const showNotification: (config: Omit<NotificationInstance, "id" | "timestamp">) => string;

export declare const showSuccess: (title: string, message?: string, duration?: number) => string;

export declare const showWarning: (title: string, message?: string, duration?: number) => string;

export declare const spacingTokens: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
};

/**
 * SSO integration capabilities (placeholder)
 */
export declare interface SSOManager {
}

export declare const t: (key: string, locale?: "ar" | "en") => string;

export declare const transitionTokens: {
    base: string;
    microInteraction: string;
    fade: string;
};

export declare interface TranslationResult {
    translatedText: string;
    sourceLanguage: string;
    targetLanguage: string;
    confidence: number;
}

/**
 * Internationalization utilities (placeholder)
 */
export declare const translations: {
    ar: {
        welcome: string;
        patient: string;
        doctor: string;
    };
    en: {
        welcome: string;
        patient: string;
        doctor: string;
    };
};

export declare const typographyTokens: {
    sans: string;
    display: string;
    monospace: string;
};

export declare interface UIConfig {
    theme: 'light' | 'dark' | 'auto';
    glassMorphism: {
        enabled: boolean;
        opacity: number;
        blur: number;
    };
    performance: {
        targetFps: number;
        lazyLoading: boolean;
        virtualScrolling: boolean;
    };
}

export declare interface UIPatientData {
    id: string;
    name: {
        family?: string;
        given?: string[];
        text?: string;
    }[];
    gender?: 'male' | 'female' | 'other' | 'unknown';
    birthDate?: string;
    phone?: string;
    email?: string;
    address?: {
        line?: string[];
        city?: string;
        country?: string;
    }[];
    identifier?: {
        system?: string;
        value?: string;
        type?: {
            text?: string;
        };
    }[];
    photo?: {
        url?: string;
        contentType?: string;
    }[];
}

export declare const useHealthcareTheme: (initialConfig?: Partial<UIConfig>) => UseHealthcareThemeReturn;

export declare interface UseHealthcareThemeReturn {
    theme: HealthcareTheme;
    isDark: boolean;
    updateTheme: (updates: Partial<HealthcareTheme>) => void;
    toggleDarkMode: () => void;
    toggleRTL: () => void;
    toggleGlassMorphism: () => void;
    resetTheme: () => void;
}

export declare interface User {
    id: string;
    username: string;
    roles: string[];
    isActive: boolean;
    metadata?: Record<string, unknown>;
}

/**
 * Validation utilities
 */
export declare const validateEmail: (email: string) => boolean;

export declare const validateSaudiID: (id: string) => boolean;

export declare interface ValidationContext {
    data?: unknown;
    user?: {
        id: string;
        role: string;
        permissions: string[];
    };
    session?: {
        id: string;
        ipAddress?: string;
        userAgent?: string;
    };
    operation?: {
        type: 'create' | 'read' | 'update' | 'delete' | 'export';
        resource: string;
        resourceId?: string;
    };
    metadata?: Record<string, unknown>;
}

export declare interface ValidationIssue {
    severity: 'error' | 'warning' | 'information';
    code: string;
    message: string;
    path?: string;
}

export declare interface ValidationResult {
    isValid: boolean;
    issues: ValidationIssue[];
}

export declare interface ValidationRule {
    id: string;
    name: string;
    description: string;
    category: 'administrative' | 'physical' | 'technical';
    severity: 'low' | 'medium' | 'high' | 'critical';
    required: boolean;
    validate: (context: ValidationContext) => Promise<ComplianceValidationResult>;
}

export declare interface WorkflowStep {
    id: string;
    name: string;
    type: 'data-input' | 'ai-processing' | 'human-review' | 'action' | 'notification';
    configuration: Record<string, unknown>;
    dependencies?: string[];
}

export declare interface WorkflowTrigger {
    type: 'schedule' | 'event' | 'manual' | 'data-change';
    configuration: Record<string, unknown>;
}

export { }
