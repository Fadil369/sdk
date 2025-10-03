'use strict';

/**
 * BrainSAIT Healthcare SDK - Production Application
 * Market-ready healthcare integration platform for Saudi Arabia
 * Version: 1.2.0
 */

const APP_CONFIG = {
  version: '1.2.0',
  apiBaseUrl: window.location.origin,
  environment: 'production',
  features: {
    fhir: true,
    nphies: true,
    ai: true,
    database: true,
    python: true
  }
};

// Application state
const state = {
  sdk: null,
  initialized: false,
  currentTab: 'api',
  user: null
};

// Initialize SDK
async function initializeSDK() {
  try {
    if (typeof BrainSAITHealthcareSDK !== 'undefined') {
      state.sdk = new BrainSAITHealthcareSDK.default({
        apiKey: 'production-key',
        environment: 'production',
        enableLogging: false,
        features: APP_CONFIG.features
      });
      state.initialized = true;
      showToast('SDK initialized successfully', 'success');
      return true;
    } else {
      console.warn('SDK bundle not loaded, using API mode');
      return false;
    }
  } catch (error) {
    console.error('SDK initialization error:', error);
    showToast('SDK initialization failed, using API fallback', 'warning');
    return false;
  }
}

// API Request Handler
async function makeApiRequest(endpoint, options = {}) {
  const controller = new AbortController();
  const timeout = options.timeout || 30000;
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const url = `${APP_CONFIG.apiBaseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(options.headers || {})
      },
      signal: controller.signal
    });

    clearTimeout(timer);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }

    return await response.text();
  } catch (error) {
    clearTimeout(timer);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
}

// Health Check
async function checkHealth() {
  try {
    const data = await makeApiRequest('/health');
    return data;
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
}

// FHIR Operations
async function getFHIRResource(resourceType, id) {
  return makeApiRequest(`/fhir/${resourceType}/${id}`);
}

async function createFHIRResource(resourceType, resource) {
  return makeApiRequest(`/fhir/${resourceType}`, {
    method: 'POST',
    body: JSON.stringify(resource)
  });
}

async function validateFHIRResource(resource) {
  return makeApiRequest('/fhir/validate', {
    method: 'POST',
    body: JSON.stringify(resource)
  });
}

// Database Operations
async function queryDatabase(collection, query) {
  return makeApiRequest('/api/db/query', {
    method: 'POST',
    body: JSON.stringify({ collection, query })
  });
}

// AI Agent Operations
async function queryAIAgent(agent, prompt) {
  return makeApiRequest('/ai/query', {
    method: 'POST',
    body: JSON.stringify({ agent, prompt })
  });
}

// UI Management
function setActiveTab(tabId, button) {
  // Update tab content
  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.remove('is-active');
    panel.setAttribute('aria-hidden', 'true');
  });
  const activePanel = document.getElementById(tabId);
  if (activePanel) {
    activePanel.classList.add('is-active');
    activePanel.setAttribute('aria-hidden', 'false');
  }

  // Update tab buttons
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.classList.remove('is-active');
    btn.setAttribute('aria-selected', 'false');
  });
  if (button) {
    button.classList.add('is-active');
    button.setAttribute('aria-selected', 'true');
  }

  state.currentTab = tabId;
}

function showLoading(panelId) {
  const panel = document.getElementById(panelId);
  if (panel) {
    const loading = panel.querySelector('.panel-loading');
    if (loading) {
      loading.classList.add('is-active');
    }
  }
}

function hideLoading(panelId) {
  const panel = document.getElementById(panelId);
  if (panel) {
    const loading = panel.querySelector('.panel-loading');
    if (loading) {
      loading.classList.remove('is-active');
    }
  }
}

function displayResult(elementId, data, format = 'json') {
  const element = document.getElementById(elementId);
  if (!element) return;

  if (format === 'json') {
    element.textContent = JSON.stringify(data, null, 2);
  } else {
    element.textContent = String(data);
  }
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'polite');
  toast.innerHTML = `
    <div class="toast-content">
      <span class="toast-icon">${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
      <span class="toast-message">${message}</span>
    </div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}

// Action Handlers
const actionHandlers = {
  async healthCheck() {
    try {
      const result = await checkHealth();
      displayResult('api-result', result);
      showToast('Health check completed', 'success');
    } catch (error) {
      displayResult('api-result', { error: error.message });
      showToast('Health check failed', 'error');
    }
  },

  async fhirValidate() {
    const input = document.getElementById('fhir-input');
    if (!input || !input.value.trim()) {
      showToast('Please enter FHIR resource JSON', 'warning');
      return;
    }

    try {
      const resource = JSON.parse(input.value);
      const result = await validateFHIRResource(resource);
      displayResult('fhir-result', result);
      showToast('FHIR validation completed', 'success');
    } catch (error) {
      displayResult('fhir-result', { error: error.message });
      showToast('FHIR validation failed', 'error');
    }
  },

  async aiQuery() {
    const input = document.getElementById('ai-input');
    const agentSelect = document.getElementById('ai-agent-select');
    
    if (!input || !input.value.trim()) {
      showToast('Please enter a query', 'warning');
      return;
    }

    try {
      const agent = agentSelect ? agentSelect.value : 'MASTERLINC';
      const result = await queryAIAgent(agent, input.value);
      displayResult('ai-result', result);
      showToast('AI query completed', 'success');
    } catch (error) {
      displayResult('ai-result', { error: error.message });
      showToast('AI query failed', 'error');
    }
  },

  async dbQuery() {
    const input = document.getElementById('db-input');
    const collectionSelect = document.getElementById('db-collection-select');
    
    if (!input || !input.value.trim()) {
      showToast('Please enter a query', 'warning');
      return;
    }

    try {
      const collection = collectionSelect ? collectionSelect.value : 'patients';
      const query = JSON.parse(input.value);
      const result = await queryDatabase(collection, query);
      displayResult('db-result', result);
      showToast('Database query completed', 'success');
    } catch (error) {
      displayResult('db-result', { error: error.message });
      showToast('Database query failed', 'error');
    }
  }
};

// Event Listeners
function setupEventListeners() {
  // Tab navigation
  document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', (e) => {
      const target = e.target.getAttribute('data-tab-target');
      setActiveTab(target, e.target);
    });
  });

  // Action buttons
  document.querySelectorAll('[data-action]').forEach(button => {
    button.addEventListener('click', async (e) => {
      const action = e.target.getAttribute('data-action');
      const handler = actionHandlers[action];
      
      if (handler) {
        const panelId = e.target.closest('.tab-panel').id;
        showLoading(panelId);
        try {
          await handler();
        } finally {
          hideLoading(panelId);
        }
      }
    });
  });

  // RTL Toggle
  const rtlToggle = document.getElementById('rtl-toggle');
  if (rtlToggle) {
    rtlToggle.addEventListener('click', () => {
      const html = document.documentElement;
      const isRtl = html.getAttribute('dir') === 'rtl';
      html.setAttribute('dir', isRtl ? 'ltr' : 'rtl');
      rtlToggle.textContent = isRtl ? 'العربية' : 'EN';
    });
  }

  // Mobile menu toggle
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('is-active');
    });
  }
}

// Initialize Application
async function init() {
  console.log(`BrainSAIT Healthcare SDK v${APP_CONFIG.version} - Production`);
  
  // Setup event listeners
  setupEventListeners();
  
  // Initialize SDK
  await initializeSDK();
  
  // Set initial tab
  const firstTab = document.querySelector('.tab-button');
  if (firstTab) {
    const target = firstTab.getAttribute('data-tab-target');
    setActiveTab(target, firstTab);
  }
  
  // Run initial health check
  try {
    await checkHealth();
    console.log('Application ready');
  } catch (error) {
    console.warn('Health check failed on init:', error);
  }
}

// Start application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
