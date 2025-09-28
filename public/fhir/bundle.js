/**
 * FHIR Bundle Operations
 * Support for creating and manipulating FHIR bundles
 */
import { v4 as uuidv4 } from 'uuid';
export class FHIRBundleBuilder {
    bundle;
    constructor(type, id) {
        this.bundle = {
            resourceType: 'Bundle',
            id: id || uuidv4(),
            type,
            entry: [],
            meta: {
                lastUpdated: new Date().toISOString(),
            },
        };
    }
    /**
     * Add a resource to the bundle
     */
    addResource(resource, fullUrl) {
        const entry = {
            fullUrl: fullUrl || `urn:uuid:${resource.id || uuidv4()}`,
            resource,
        };
        this.bundle.entry = this.bundle.entry || [];
        this.bundle.entry.push(entry);
        return this;
    }
    /**
     * Add a resource with request for transaction/batch bundles
     */
    addResourceWithRequest(resource, method, url, fullUrl) {
        const entry = {
            fullUrl: fullUrl || `urn:uuid:${resource.id || uuidv4()}`,
            resource,
            request: {
                method,
                url,
            },
        };
        this.bundle.entry = this.bundle.entry || [];
        this.bundle.entry.push(entry);
        return this;
    }
    /**
     * Add a create request to transaction bundle
     */
    addCreate(resource) {
        if (!resource.resourceType) {
            throw new Error('Resource must have resourceType for create operation');
        }
        return this.addResourceWithRequest(resource, 'POST', resource.resourceType);
    }
    /**
     * Add an update request to transaction bundle
     */
    addUpdate(resource) {
        if (!resource.id) {
            throw new Error('Resource must have id for update operation');
        }
        return this.addResourceWithRequest(resource, 'PUT', `${resource.resourceType}/${resource.id}`);
    }
    /**
     * Add a delete request to transaction bundle
     */
    addDelete(resourceType, id) {
        const entry = {
            request: {
                method: 'DELETE',
                url: `${resourceType}/${id}`,
            },
        };
        this.bundle.entry = this.bundle.entry || [];
        this.bundle.entry.push(entry);
        return this;
    }
    /**
     * Add a conditional create request
     */
    addConditionalCreate(resource, condition) {
        return this.addResourceWithRequest(resource, 'POST', `${resource.resourceType}?${condition}`);
    }
    /**
     * Add a conditional update request
     */
    addConditionalUpdate(resource, condition) {
        return this.addResourceWithRequest(resource, 'PUT', `${resource.resourceType}?${condition}`);
    }
    /**
     * Set bundle metadata
     */
    setMeta(meta) {
        this.bundle.meta = { ...this.bundle.meta, ...meta };
        return this;
    }
    /**
     * Set bundle total (for search results)
     */
    setTotal(total) {
        this.bundle.total = total;
        return this;
    }
    /**
     * Build and return the bundle
     */
    build() {
        // Update entry count
        this.bundle.total = this.bundle.entry?.length || 0;
        return { ...this.bundle };
    }
    /**
     * Get current bundle (without cloning)
     */
    getBundle() {
        return this.bundle;
    }
}
export class FHIRBundleProcessor {
    /**
     * Extract all resources from a bundle
     */
    static extractResources(bundle) {
        if (!bundle.entry)
            return [];
        return bundle.entry
            .map(entry => entry.resource)
            .filter((resource) => resource !== undefined);
    }
    /**
     * Extract resources of specific type from bundle
     */
    static extractResourcesByType(bundle, resourceType) {
        return this.extractResources(bundle).filter(resource => resource.resourceType === resourceType);
    }
    /**
     * Find resource by ID in bundle
     */
    static findResourceById(bundle, resourceType, id) {
        return this.extractResources(bundle).find(resource => resource.resourceType === resourceType && resource.id === id);
    }
    /**
     * Validate bundle structure
     */
    static validateBundle(bundle) {
        const errors = [];
        if (!bundle.resourceType || bundle.resourceType !== 'Bundle') {
            errors.push('Bundle must have resourceType "Bundle"');
        }
        if (!bundle.type) {
            errors.push('Bundle must have a type');
        }
        if (bundle.type === 'transaction' || bundle.type === 'batch') {
            if (!bundle.entry || bundle.entry.length === 0) {
                errors.push('Transaction/batch bundles must have at least one entry');
            }
            bundle.entry?.forEach((entry, index) => {
                const completeEntry = entry;
                if (!completeEntry.request) {
                    errors.push(`Entry ${index} in transaction/batch bundle must have a request`);
                }
            });
        }
        return {
            isValid: errors.length === 0,
            errors,
        };
    }
    /**
     * Create a response bundle from a request bundle
     */
    static createResponseBundle(requestBundle, responses) {
        const responseType = requestBundle.type === 'transaction' ? 'transaction-response' : 'batch-response';
        const builder = new FHIRBundleBuilder(responseType);
        requestBundle.entry?.forEach((requestEntry, index) => {
            const response = responses[index];
            if (response) {
                const responseEntry = {
                    fullUrl: requestEntry.fullUrl,
                    resource: response.resource,
                    response: {
                        status: response.status,
                        location: response.location,
                    },
                };
                const bundle = builder.getBundle();
                bundle.entry = bundle.entry || [];
                bundle.entry.push(responseEntry);
            }
        });
        return builder.build();
    }
    /**
     * Split large bundle into smaller chunks
     */
    static splitBundle(bundle, maxSize) {
        if (!bundle.entry || bundle.entry.length <= maxSize) {
            return [bundle];
        }
        const chunks = [];
        for (let i = 0; i < bundle.entry.length; i += maxSize) {
            const chunkEntries = bundle.entry.slice(i, i + maxSize);
            const chunkBundle = {
                ...bundle,
                id: `${bundle.id}-chunk-${Math.floor(i / maxSize) + 1}`,
                entry: chunkEntries,
                total: chunkEntries.length,
            };
            chunks.push(chunkBundle);
        }
        return chunks;
    }
    /**
     * Create a search result bundle
     */
    static createSearchBundle(resources, total, links) {
        const builder = new FHIRBundleBuilder('searchset');
        resources.forEach(resource => {
            builder.addResource(resource);
        });
        if (total !== undefined) {
            builder.setTotal(total);
        }
        const bundle = builder.build();
        // Add search links if provided
        if (links) {
            // In a full implementation, you would add link entries to the bundle
            // For now, we'll store them in meta extensions
            bundle.meta = {
                ...bundle.meta,
                extension: Object.entries(links).map(([rel, url]) => ({
                    url: `http://hl7.org/fhir/link-type#${rel}`,
                    valueString: url,
                })),
            };
        }
        return bundle;
    }
}
// Utility functions for creating common bundle types
/**
 * Create a transaction bundle for multiple operations
 */
export function createTransactionBundle() {
    return new FHIRBundleBuilder('transaction');
}
/**
 * Create a batch bundle for multiple operations (non-transactional)
 */
export function createBatchBundle() {
    return new FHIRBundleBuilder('batch');
}
/**
 * Create a document bundle
 */
export function createDocumentBundle(composition) {
    const builder = new FHIRBundleBuilder('document');
    builder.addResource(composition);
    return builder;
}
/**
 * Create a collection bundle
 */
export function createCollectionBundle() {
    return new FHIRBundleBuilder('collection');
}
