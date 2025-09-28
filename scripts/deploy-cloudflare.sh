#!/bin/bash

# BrainSAIT Healthcare SDK - Cloudflare Deployment Script
# This script handles deployment to Cloudflare Workers and Pages

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    if ! command -v npx &> /dev/null; then
        print_error "npx is not installed"
        exit 1
    fi
    
    print_success "All dependencies found"
}

# Check if wrangler is configured
check_wrangler_auth() {
    print_status "Checking Wrangler authentication..."
    
    if ! npx wrangler whoami &> /dev/null; then
        print_warning "Wrangler not authenticated. Please run: npx wrangler login"
        exit 1
    fi
    
    print_success "Wrangler is authenticated"
}

# Build the project
build_project() {
    print_status "Building project..."
    
    # Install dependencies
    npm ci
    
    # Run linting
    npm run lint
    
    # Run tests
    npm test
    
    # Build main SDK
    npm run build
    
    # Build worker
    npm run build:worker
    
    # Build documentation
    npm run build:docs
    
    print_success "Project built successfully"
}

# Deploy to Cloudflare Workers
deploy_worker() {
    local env=${1:-"development"}
    
    print_status "Deploying to Cloudflare Workers (${env})..."
    
    # Check if wrangler.toml exists
    if [ ! -f "wrangler.toml" ]; then
        print_error "wrangler.toml not found"
        exit 1
    fi
    
    # Deploy based on environment
    case $env in
        "production")
            npx wrangler deploy --env production --minify
            ;;
        "staging")
            npx wrangler deploy --env staging
            ;;
        *)
            npx wrangler deploy --env development
            ;;
    esac
    
    print_success "Worker deployed successfully to ${env}"
}

# Deploy to Cloudflare Pages
deploy_pages() {
    local env=${1:-"development"}
    
    print_status "Deploying to Cloudflare Pages (${env})..."
    
    # Check if documentation build exists
    if [ ! -d "docs/.vitepress/dist" ]; then
        print_error "Documentation build not found. Run 'npm run build:docs' first."
        exit 1
    fi
    
    # Deploy pages
    case $env in
        "production")
            npx wrangler pages deploy docs/.vitepress/dist --project-name="brainsait-sdk-docs" --branch=main
            ;;
        "staging")
            npx wrangler pages deploy docs/.vitepress/dist --project-name="brainsait-sdk-docs" --branch=staging
            ;;
        *)
            npx wrangler pages deploy docs/.vitepress/dist --project-name="brainsait-sdk-docs" --branch=dev
            ;;
    esac
    
    print_success "Pages deployed successfully to ${env}"
}

# Upload assets to R2
upload_assets() {
    print_status "Uploading assets to Cloudflare R2..."
    
    # Check if assets directory exists
    if [ ! -d "assets" ]; then
        print_warning "Assets directory not found, skipping upload"
        return
    fi
    
    # Upload CSS files
    if [ -d "assets/css" ]; then
        for file in assets/css/*.css; do
            if [ -f "$file" ]; then
                filename=$(basename "$file")
                npx wrangler r2 object put brainsait-sdk-assets/css/$filename --file="$file" --content-type="text/css"
                print_status "Uploaded: $filename"
            fi
        done
    fi
    
    # Upload demo files
    if [ -f "assets/demo.html" ]; then
        npx wrangler r2 object put brainsait-sdk-assets/demo.html --file="assets/demo.html" --content-type="text/html"
        print_status "Uploaded: demo.html"
    fi
    
    print_success "Assets uploaded successfully"
}

# Setup KV namespaces
setup_kv() {
    print_status "Setting up KV namespaces..."
    
    # Create KV namespaces if they don't exist
    local cache_namespace=$(npx wrangler kv:namespace create "SDK_CACHE" 2>/dev/null | grep -o 'id = "[^"]*"' | cut -d'"' -f2 || echo "")
    local config_namespace=$(npx wrangler kv:namespace create "SDK_CONFIG" 2>/dev/null | grep -o 'id = "[^"]*"' | cut -d'"' -f2 || echo "")
    
    if [ -n "$cache_namespace" ]; then
        print_status "SDK_CACHE namespace ID: $cache_namespace"
    fi
    
    if [ -n "$config_namespace" ]; then
        print_status "SDK_CONFIG namespace ID: $config_namespace"
    fi
    
    # Put initial configuration
    cat << EOF | npx wrangler kv:key put --namespace-id="$config_namespace" "sdk_info" --path=-
{
  "name": "BrainSAIT Healthcare SDK",
  "version": "1.2.0",
  "phase": "4",
  "features": {
    "fhir": true,
    "nphies": true,
    "ui": true,
    "glassMorphism": true,
    "rtl": true,
    "cloudflare": true
  },
  "lastUpdated": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF
    
    print_success "KV namespaces configured"
}

# Validate deployment
validate_deployment() {
    local env=${1:-"development"}
    
    print_status "Validating deployment..."
    
    # Get worker URL based on environment
    local worker_url
    case $env in
        "production")
            worker_url="https://sdk.brainsait.com"
            ;;
        "staging")
            worker_url="https://sdk-staging.brainsait.com"
            ;;
        *)
            worker_url="https://brainsait-healthcare-sdk-dev.fadil369.workers.dev"
            ;;
    esac
    
    # Test health endpoint
    if curl -s -f "${worker_url}/health" > /dev/null; then
        print_success "Health check passed: ${worker_url}/health"
    else
        print_warning "Health check failed for: ${worker_url}/health"
    fi
    
    # Test API endpoint
    if curl -s -f "${worker_url}/api/config" > /dev/null; then
        print_success "API check passed: ${worker_url}/api/config"
    else
        print_warning "API check failed for: ${worker_url}/api/config"
    fi
    
    print_success "Deployment validation completed"
}

# Show help
show_help() {
    echo "BrainSAIT Healthcare SDK - Cloudflare Deployment Script"
    echo ""
    echo "Usage: $0 [command] [environment]"
    echo ""
    echo "Commands:"
    echo "  worker      Deploy to Cloudflare Workers"
    echo "  pages       Deploy to Cloudflare Pages"
    echo "  assets      Upload assets to R2"
    echo "  kv          Setup KV namespaces"
    echo "  full        Full deployment (worker + pages + assets)"
    echo "  validate    Validate deployment"
    echo "  help        Show this help message"
    echo ""
    echo "Environments:"
    echo "  development (default)"
    echo "  staging"
    echo "  production"
    echo ""
    echo "Examples:"
    echo "  $0 worker production"
    echo "  $0 full staging"
    echo "  $0 assets"
    echo ""
}

# Main execution
main() {
    local command=${1:-"help"}
    local environment=${2:-"development"}
    
    case $command in
        "worker")
            check_dependencies
            check_wrangler_auth
            build_project
            deploy_worker "$environment"
            validate_deployment "$environment"
            ;;
        "pages")
            check_dependencies
            check_wrangler_auth
            build_project
            deploy_pages "$environment"
            ;;
        "assets")
            check_dependencies
            check_wrangler_auth
            upload_assets
            ;;
        "kv")
            check_dependencies
            check_wrangler_auth
            setup_kv
            ;;
        "full")
            check_dependencies
            check_wrangler_auth
            build_project
            setup_kv
            deploy_worker "$environment"
            deploy_pages "$environment"
            upload_assets
            validate_deployment "$environment"
            ;;
        "validate")
            validate_deployment "$environment"
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# Run main function with all arguments
main "$@"