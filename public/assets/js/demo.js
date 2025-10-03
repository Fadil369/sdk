'use strict';

const state = {
  sdk: null,
  initialized: false,
  lastHealth: null,
};

const mockData = {
  health: {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.2.0',
    responseTime: 147,
    services: {
      api: { status: 'operational' },
      database: { status: 'operational', cache: '94%' },
      fhir: { status: 'operational' },
      security: { status: 'operational' },
      analytics: { status: 'enabled' },
    },
  },
  config: {
    version: '1.2.0',
    environment: 'production',
    features: {
      fhir: true,
      nphies: true,
      ai: true,
      ui: true,
      database: true,
      vision2030: true,
    },
    endpoints: {
      health: '/health',
      api: '/api/*',
      fhir: '/fhir/*',
      database: '/api/db/*',
    },
    security: {
      hipaaCompliant: true,
      encryption: 'AES-256-GCM',
      cors: true,
      csp: true,
    },
  },
  metrics: {
    timestamp: new Date().toISOString(),
    apiResponseTime: 158,
    uiFrameRate: 60,
    memoryUsage: 45.2,
    concurrentUsers: 1240,
    cacheHitRate: 94.6,
    databaseQueries: {
      total: 15432,
      averageTime: 22,
      slowQueries: 3,
    },
    edgeLocations: {
      total: 12,
      activeRegions: ['me-south-1', 'eu-west-1', 'us-east-1'],
    },
  },
  fhirPatient: {
    resourceType: 'Patient',
    id: 'saudi-demo-001',
    meta: {
      profile: ['http://hl7.org.sa/fhir/StructureDefinition/SACore-Patient'],
    },
    identifier: [
      {
        system: 'http://hl7.org.sa/fhir/sid/national-id',
        value: '1234567890',
      },
    ],
    name: [
      {
        use: 'official',
        family: 'العلي',
        given: ['أحمد', 'محمد'],
        extension: [
          {
            url: 'http://hl7.org.sa/fhir/StructureDefinition/arabic-name',
            valueString: 'أحمد محمد العلي',
          },
        ],
      },
      {
        use: 'usual',
        family: 'Al-Ali',
        given: ['Ahmed', 'Mohammed'],
      },
    ],
    gender: 'male',
    birthDate: '1985-03-15',
    address: [
      {
        use: 'home',
        city: 'الرياض',
        state: 'الرياض',
        postalCode: '12345',
        country: 'SA',
      },
    ],
    extension: [
      {
        url: 'http://hl7.org.sa/fhir/StructureDefinition/residency-type',
        valueCode: 'citizen',
      },
      {
        url: 'http://hl7.org.sa/fhir/StructureDefinition/region',
        valueString: 'riyadh',
      },
    ],
  },
  fhirValidation: {
    isValid: true,
    resourceType: 'Patient',
    profileCompliance: 'http://hl7.org.sa/fhir/StructureDefinition/SACore-Patient',
    validationResults: {
      errors: 0,
      warnings: 1,
      information: 3,
    },
    issues: [
      {
        severity: 'warning',
        code: 'incomplete',
        details: 'Missing emergency contact information',
        location: 'Patient.contact',
      },
      {
        severity: 'information',
        code: 'extension-used',
        details: 'Saudi-specific extensions properly implemented',
        location: 'Patient.extension',
      },
    ],
    complianceScore: 95,
    timestamp: new Date().toISOString(),
  },
  fhirBundle: {
    resourceType: 'Bundle',
    id: 'saudi-transaction-001',
    type: 'transaction',
    timestamp: new Date().toISOString(),
    entry: [
      {
        fullUrl: 'urn:uuid:patient-001',
        resource: {
          resourceType: 'Patient',
          id: 'patient-001',
          name: [{ given: ['أحمد'], family: 'العلي' }],
        },
        request: { method: 'POST', url: 'Patient' },
      },
      {
        fullUrl: 'urn:uuid:observation-001',
        resource: {
          resourceType: 'Observation',
          status: 'final',
          code: {
            coding: [
              {
                system: 'http://loinc.org',
                code: '29463-7',
                display: 'Body Weight',
              },
            ],
          },
          subject: { reference: 'urn:uuid:patient-001' },
          valueQuantity: {
            value: 70,
            unit: 'kg',
            system: 'http://unitsofmeasure.org',
          },
        },
        request: { method: 'POST', url: 'Observation' },
      },
    ],
    bundleValidation: {
      isValid: true,
      resourceCount: 2,
      transactionType: 'create',
      estimatedProcessingTime: '245ms',
    },
  },
  aiMasterLinc: {
    agent: 'MASTERLINC',
    version: '2.1.0',
    insights: {
      patientFlowEfficiency: {
        currentScore: 78,
        recommendations: [
          'Implement AI-driven appointment scheduling',
          'Optimize emergency department triage',
        ],
        potentialImprovement: '23% reduction in wait times',
      },
      resourceUtilization: {
        bedOccupancy: 87,
        staffEfficiency: 92,
        equipmentUtilization: 76,
      },
      costOptimization: {
        potentialSavings: 'SAR 2.4M annually',
        keyAreas: ['Supply chain optimization', 'Energy efficiency'],
      },
    },
    vision2030Alignment: {
      digitalTransformation: 85,
      patientExperience: 78,
      qualityImprovement: 91,
    },
    confidence: 94.5,
  },
  aiHealthcareLinc: {
    agent: 'HEALTHCARELINC',
    version: '1.8.0',
    clinicalInsights: {
      riskAssessment: {
        highRiskPatients: 127,
        criticalAlerts: 8,
        predictiveMetrics: {
          readmissionRisk: 'Reduced by 31%',
          complications: 'Early detection improved by 45%',
        },
      },
      treatmentOptimization: {
        medicationAdherence: 89,
        treatmentEffectiveness: 92,
        adverseEventPrevention: '18% reduction in adverse events',
      },
      populationHealth: {
        chronicDiseaseManagement: {
          diabetes: { patients: 1234, controlRate: 87 },
          hypertension: { patients: 2156, controlRate: 91 },
        },
      },
    },
    aiModelPerformance: {
      accuracy: 94.2,
      precision: 91.8,
      recall: 89.5,
      f1Score: 90.6,
    },
    saudiSpecificMetrics: {
      arabicNLPAccuracy: 96.3,
      culturalContextAwareness: 88.7,
      localGuidelineCompliance: 94.1,
    },
  },
  aiVision2030: {
    initiative: 'Saudi Vision 2030 - Healthcare Transformation',
    reportDate: new Date().toISOString(),
    overallProgress: {
      digitalHealthAdoption: 78,
      aiIntegration: 71,
      patientExperience: 85,
      healthcareAccessibility: 82,
    },
    keyPerformanceIndicators: {
      healthSectorTransformation: {
        telemedicineAdoption: '340% increase',
        electronicHealthRecords: '89% implementation',
        aiDiagnosticTools: '156 hospitals equipped',
      },
      innovationEconomy: {
        healthTechStartups: 89,
        researchPartnerships: 34,
        internationalCollaborations: 12,
      },
      sustainability: {
        energyEfficiency: '23% improvement',
        wasteReduction: '31% decrease',
        greenHealthcareFacilities: 45,
      },
    },
    regionalBreakdown: {
      riyadh: { score: 87, population: 8200000 },
      makkah: { score: 82, population: 8500000 },
    },
    predictions2030: {
      digitalHealthCoverage: '95%',
      aiAssistedDiagnosis: '80%',
      patientSatisfaction: '92%',
    },
  },
  databaseHealth: {
    status: 'healthy',
    database: 'brainsait_platform',
    collections: {
      hospitals: 1,
      ai_models: 1,
      vision2030_metrics: 1,
      patients: 0,
      audit_logs: 234,
      user_sessions: 45,
      fhir_resources: 127,
    },
    performance: {
      averageQueryTime: '23ms',
      connectionPool: { active: 8, idle: 2, total: 10 },
      cacheHitRate: '94.2%',
    },
    last_check: new Date().toISOString(),
  },
  hospitals: [
    {
      hospital_id: 'kfmc-001',
      name: 'King Fahd Medical City',
      location: {
        city: 'الرياض',
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
    },
  ],
  aiModels: [
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
    },
  ],
};

const aiScenarioProfiles = {
  triage: {
    title: 'Adaptive Triage Optimization',
    narrative: 'AI triages emergency intake leveraging Arabic NLP with automated acuity scoring.',
    insights: {
      throughputGain: '26%',
      aiConfidence: '0.93',
      riskAlerts: 4,
      projectedWaitReduction: '18 minutes',
    },
    interventions: [
      'Deploy MASTERLINC queue balancer across Riyadh and Jeddah hubs',
      'Activate Arabic NLP intent routing for emergency complaints',
      'Route high-risk cardiovascular patients to fast-track lanes',
    ],
  },
  capacity: {
    title: 'Bed Capacity Forecast',
    narrative: 'Predict bed utilization with real-time telemetry, seasonal demand, and Vision 2030 KPIs.',
    insights: {
      throughputGain: '19%',
      aiConfidence: '0.96',
      riskAlerts: 2,
      projectedWaitReduction: '12 minutes',
    },
    interventions: [
      'Scale ICU micro-clusters at 92% occupancy threshold',
      'Shift elective surgeries by 4 hours to balance load',
      'Pre-position 160 surge beds across Eastern Province',
    ],
  },
  supply: {
    title: 'Supply Chain Resilience',
    narrative: 'AI monitors medical supply nodes and predicts disruptions via anomaly detection.',
    insights: {
      throughputGain: '31%',
      aiConfidence: '0.91',
      riskAlerts: 5,
      projectedWaitReduction: '9 minutes',
    },
    interventions: [
      'Re-route cold chain shipments through Dammam dry port',
      'Trigger procurement automation for high-risk SKUs',
      'Notify Vision 2030 command center of supply impact window',
    ],
  },
  population: {
    title: 'Population Health Risk Shift',
    narrative: 'Anticipate chronic disease shifts with MASTERLINC predictive cohorts and equity scoring.',
    insights: {
      throughputGain: '22%',
      aiConfidence: '0.95',
      riskAlerts: 3,
      projectedWaitReduction: '15 minutes',
    },
    interventions: [
      'Deploy HEALTHCARELINC outreach for diabetic patients (GCC cohort)',
      'Launch Arabic lifestyle coaching for 11k citizens',
      'Sync Vision 2030 dashboards with new risk indices',
    ],
  },
};

const endpointCatalog = {
  health: [
    { method: 'GET', url: '/health', description: 'System health status' },
    { method: 'GET', url: '/api/config', description: 'SDK configuration' },
    { method: 'GET', url: '/api/metrics', description: 'Performance metrics' },
  ],
  database: [
    { method: 'GET', url: '/api/db/hospitals', description: 'List all hospitals' },
    { method: 'GET', url: '/api/db/ai-models', description: 'AI model registry' },
    { method: 'GET', url: '/api/db/vision2030-metrics', description: 'Transformation metrics' },
  ],
  fhir: [
    { method: 'GET', url: '/fhir/Patient', description: 'FHIR Patient resources' },
    { method: 'POST', url: '/fhir/Bundle', description: 'Transaction bundles' },
    { method: 'GET', url: '/nphies/claims', description: 'NPHIES claims data' },
  ],
};

function getContainer(id) {
  return document.getElementById(id);
}

function setStatusChip(id, label, state = 'neutral') {
  const chip = getContainer(id);
  if (!chip) {
    return;
  }
  chip.dataset.state = state;
  chip.textContent = label;
}

function showToast(message, variant = 'info', timeout = 4500) {
  const container = getContainer('toastContainer');
  if (!container) {
    return;
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.dataset.variant = variant;
  toast.textContent = message;
  container.append(toast);

  setTimeout(() => {
    toast.classList.add('is-exiting');
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(8px)';
  }, timeout - 300);

  setTimeout(() => {
    toast.remove();
  }, timeout);
}

function toggleLoading(id, isVisible) {
  const el = getContainer(id);
  if (!el) {
    return;
  }
  if (isVisible) {
    el.classList.add('is-visible');
  } else {
    el.classList.remove('is-visible');
  }
}

function renderOutput(id, payload, isError = false) {
  const target = getContainer(id);
  if (!target) {
    return;
  }

  const timestamp = new Date().toLocaleTimeString();
  const statusIcon = isError ? '❌' : '✅';
  let content;

  if (typeof payload === 'string') {
    content = payload;
  } else {
    try {
      content = JSON.stringify(payload, null, 2);
    } catch (error) {
      content = String(payload);
    }
  }

  target.innerHTML = `
    <div class="output-header">${statusIcon} ${timestamp}<span>${isError ? 'Error' : 'Success'}</span></div>
    <pre>${content}</pre>
  `;
}

async function fetchJson(url, options = {}) {
  const controller = new AbortController();
  const timeout = options.timeout ?? 12000;
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(options.headers ?? {}),
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`${response.status} ${response.statusText}${text ? ` - ${text}` : ''}`);
    }

    if (response.status === 204) {
      return {};
    }

    const text = await response.text();
    if (!text) {
      return {};
    }

    return JSON.parse(text);
  } finally {
    clearTimeout(timer);
  }
}

async function withFallback(tasks) {
  let lastError;
  for (const task of tasks) {
    try {
      const result = await task();
      if (result !== undefined && result !== null) {
        return result;
      }
    } catch (error) {
      lastError = error;
    }
  }
  if (lastError) {
    throw lastError;
  }
  throw new Error('No data available');
}

function toHealthState(status) {
  if (!status) {
    return 'warning';
  }
  const normalized = String(status).toLowerCase();
  if (normalized === 'healthy' || normalized === 'up' || normalized === 'operational') {
    return 'healthy';
  }
  if (normalized === 'unhealthy' || normalized === 'down' || normalized === 'critical') {
    return 'critical';
  }
  return 'warning';
}

function updateLiveStatus(health, metrics) {
  const response = typeof health?.responseTime === 'number' ? `${health.responseTime} ms` : 'N/A';
  setStatusChip('status-health', `System health • ${String(health?.status ?? 'unknown').toUpperCase()}`, toHealthState(health?.status));
  setStatusChip('status-response', `Response • ${response}`, 'neutral');

  if (metrics) {
    const users = metrics.concurrentUsers ?? metrics.services?.api?.concurrentUsers;
    const coverage = metrics.edgeLocations?.total ?? metrics.coverage ?? 0;
    setStatusChip('status-usage', `Concurrent users • ${users ?? 'N/A'}`, 'neutral');
    setStatusChip('status-coverage', `Edge coverage • ${coverage}`, 'neutral');
  }
}

function updateMetricsBanner(metrics) {
  const banner = getContainer('aiMetricsBanner');
  if (!banner) {
    return;
  }
  banner.innerHTML = `
    <span class="metrics-chip">Inference latency: ${metrics.latency}</span>
    <span class="metrics-chip">Confidence: ${metrics.confidence}</span>
    <span class="metrics-chip">Coverage: ${metrics.coverage}</span>
  `;
}

function computeScenarioMetrics({ horizon, enableXai, enableArabic, enableEdge, profile }) {
  let latency = 138;
  latency -= enableEdge ? 26 : 0;
  latency += enableXai ? 6 : 0;
  latency += enableArabic ? 4 : 0;
  latency += Math.max(0, horizon - 30) * 0.5;
  latency = Math.max(82, Math.round(latency));

  let confidence = Math.round(parseFloat(profile.insights.aiConfidence) * 100);
  confidence += enableXai ? 2 : 0;
  confidence -= enableArabic ? 0 : 3;
  confidence -= enableEdge ? 0 : 1;
  confidence = Math.min(99, Math.max(70, confidence));

  let coverage = 18;
  coverage += enableEdge ? 6 : 0;
  coverage -= enableArabic ? 0 : 2;

  return {
    latency: `${latency} ms`,
    confidence: `${confidence}%`,
    coverage: `${coverage} regions`,
  };
}

async function initSDK() {
  if (state.initialized) {
    return;
  }

  if (typeof window.BrainSAITHealthcareSDK === 'undefined') {
    showToast('SDK bundle not detected, running in mock mode.', 'warning');
    return;
  }

  try {
    state.sdk = new window.BrainSAITHealthcareSDK({
      environment: 'production',
      api: {
        baseUrl: window.location.origin,
        timeout: 30000,
        retries: 3,
      },
      fhir: {
        serverUrl: 'https://fhir.nphies.sa',
        version: 'R4',
      },
      nphies: {
        baseUrl: 'https://nphies.sa',
        clientId: 'demo-client',
        scope: ['read'],
        sandbox: true,
      },
      ai: {
        enabled: true,
      },
    });

    await state.sdk.initialize();
    state.initialized = true;
    showToast('SDK connected successfully.', 'success');
  } catch (error) {
    state.sdk = null;
    showToast(`SDK initialization failed: ${error instanceof Error ? error.message : error}`, 'error');
  }
}

function setActiveTab(targetId, button) {
  const contents = document.querySelectorAll('.tab-content');
  contents.forEach(section => {
    section.classList.remove('is-active');
    section.setAttribute('hidden', '');
  });
  const tabs = document.querySelectorAll('[data-tab-target]');
  tabs.forEach(tab => {
    tab.classList.remove('active');
    tab.setAttribute('aria-selected', 'false');
  });

  const target = getContainer(targetId);
  if (target) {
    target.classList.add('is-active');
    target.removeAttribute('hidden');
  }
  if (button) {
    button.classList.add('active');
    button.setAttribute('aria-selected', 'true');
  }
}

function initTabs() {
  const buttons = document.querySelectorAll('[data-tab-target]');
  buttons.forEach(button => {
    button.addEventListener('click', event => {
      event.preventDefault();
      setActiveTab(button.dataset.tabTarget, button);
    });
  });
}

function initNavigation() {
  const header = getContainer('siteHeader');
  const nav = getContainer('primaryNav');
  const toggle = getContainer('menuToggle');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      nav.classList.toggle('is-open');
      const expanded = nav.classList.contains('is-open');
      toggle.setAttribute('aria-expanded', String(expanded));
    });

    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 24) {
        header.classList.add('is-condensed');
      } else {
        header.classList.remove('is-condensed');
      }
    });
  }
}

function initSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', event => {
      const targetSelector = anchor.getAttribute('href');
      if (!targetSelector || targetSelector.length <= 1) {
        return;
      }
      const section = document.querySelector(targetSelector);
      if (section) {
        event.preventDefault();
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

function attachEndpointButtons() {
  document.querySelectorAll('[data-endpoints]').forEach(button => {
    button.addEventListener('click', () => {
      const category = button.dataset.endpoints;
      if (!category || !endpointCatalog[category]) {
        return;
      }
      setActiveTab('api-demo', document.querySelector('[data-tab-target="api-demo"]'));
      renderOutput('api-output', {
        description: 'Endpoint catalog',
        category,
        endpoints: endpointCatalog[category],
      });
      showToast('Endpoint catalog loaded into API console.', 'info');
    });
  });
}

async function executeAction(actionKey, options = {}) {
  const config = actionRegistry[actionKey];
  if (!config) {
    return;
  }

  toggleLoading(config.loaderId, true);

  try {
    const result = await config.executor();
    renderOutput(config.outputId, result);
    if (config.onSuccess) {
      config.onSuccess(result);
    }
    if (!options.silent) {
      showToast(config.successMessage, 'success');
    }
  } catch (error) {
    renderOutput(config.outputId, error instanceof Error ? error.message : String(error), true);
    showToast(`Action failed: ${error instanceof Error ? error.message : error}`, 'error');
  } finally {
    toggleLoading(config.loaderId, false);
  }
}

async function executeHealthCheck() {
  return withFallback([
    async () => {
      if (!state.sdk) {
        throw new Error('SDK not initialized');
      }
      return state.sdk.healthCheck();
    },
    async () => fetchJson('/health'),
    async () => mockData.health,
  ]);
}

async function executeConfigFetch() {
  return withFallback([
    async () => fetchJson('/api/config'),
    async () => mockData.config,
  ]);
}

async function executeMetricsFetch() {
  const result = await withFallback([
    async () => {
      if (!state.sdk) {
        throw new Error('SDK not initialized');
      }
      return state.sdk.getPerformanceMetrics();
    },
    async () => fetchJson('/api/metrics'),
    async () => mockData.metrics,
  ]);

  return result;
}

function buildFHIRPatientResource() {
  return JSON.parse(JSON.stringify(mockData.fhirPatient));
}

async function executeFHIRPatient() {
  return withFallback([
    async () => {
      if (!state.sdk) {
        throw new Error('SDK not initialized');
      }
      const response = await state.sdk.fhir.create(buildFHIRPatientResource());
      return {
        resourceSubmitted: true,
        request: buildFHIRPatientResource(),
        response,
      };
    },
    async () => fetchJson('/fhir/Patient', {
      method: 'POST',
      body: JSON.stringify(buildFHIRPatientResource()),
    }),
    async () => ({
      resourceSubmitted: false,
      fallback: true,
      resource: mockData.fhirPatient,
    }),
  ]);
}

async function executeFHIRValidation() {
  return withFallback([
    async () => {
      if (!state.sdk) {
        throw new Error('SDK not initialized');
      }
      const capability = await state.sdk.fhir.getCapabilityStatement();
      return {
        capability: capability.data,
        metadata: capability.headers,
      };
    },
    async () => fetchJson('/fhir/metadata'),
    async () => mockData.fhirValidation,
  ]);
}

async function executeFHIRBundle() {
  const bundle = JSON.parse(JSON.stringify(mockData.fhirBundle));
  bundle.timestamp = new Date().toISOString();

  return withFallback([
    async () => {
      if (!state.sdk) {
        throw new Error('SDK not initialized');
      }
      const response = await state.sdk.fhir.transaction(bundle);
      return {
        bundle,
        response,
      };
    },
    async () => fetchJson('/fhir/Bundle', {
      method: 'POST',
      body: JSON.stringify(bundle),
    }),
    async () => ({
      fallback: true,
      bundle,
    }),
  ]);
}

async function executeMasterLinc() {
  return withFallback([
    async () => fetchJson('/api/ai/masterlinc'),
    async () => mockData.aiMasterLinc,
  ]);
}

async function executeHealthcareLinc() {
  return withFallback([
    async () => fetchJson('/api/ai/healthcarelinc'),
    async () => mockData.aiHealthcareLinc,
  ]);
}

async function executeVision2030() {
  return withFallback([
    async () => fetchJson('/api/ai/vision2030'),
    async () => mockData.aiVision2030,
  ]);
}

async function executeDatabaseHealth() {
  return withFallback([
    async () => fetchJson('/api/db/health'),
    async () => mockData.databaseHealth,
  ]);
}

async function executeHospitals() {
  return withFallback([
    async () => fetchJson('/api/db/hospitals'),
    async () => ({ data: mockData.hospitals, total: mockData.hospitals.length }),
  ]);
}

async function executeAIModels() {
  return withFallback([
    async () => fetchJson('/api/db/ai-models'),
    async () => ({ data: mockData.aiModels, total: mockData.aiModels.length }),
  ]);
}

// Analytics Dashboard Executors
async function executeAnalyticsRealtime() {
  if (typeof AnalyticsDashboard === 'undefined') {
    return { error: 'AnalyticsDashboard module not loaded' };
  }
  const dashboard = new AnalyticsDashboard();
  await dashboard.initialize();
  return {
    status: 'Real-time monitoring started',
    message: 'Analytics dashboard is now streaming live metrics every 3 seconds.',
    currentMetrics: dashboard.metrics,
    historicalData: `${dashboard.historicalData.length} hours of historical data loaded`,
  };
}

async function executeAnalyticsVision2030() {
  if (typeof AnalyticsDashboard === 'undefined') {
    return { error: 'AnalyticsDashboard module not loaded' };
  }
  const dashboard = new AnalyticsDashboard();
  await dashboard.loadInitialData();
  const kpis = dashboard.getVision2030KPIs();
  return {
    vision2030KPIs: kpis,
    summary: 'Saudi Vision 2030 digital health transformation metrics',
    overallProgress: `${Math.round((kpis.digitalTransformation.current / kpis.digitalTransformation.target) * 100)}% overall progress`,
  };
}

async function executeAnalyticsPredictions() {
  if (typeof AnalyticsDashboard === 'undefined') {
    return { error: 'AnalyticsDashboard module not loaded' };
  }
  const dashboard = new AnalyticsDashboard();
  await dashboard.loadInitialData();
  const report = dashboard.generateReport();
  return {
    predictions: report.predictions,
    healthScore: report.healthScore,
    recommendations: report.recommendations,
    summary: 'AI-powered predictive analytics for next-hour operational metrics',
  };
}

async function executeAnalyticsExport() {
  if (typeof AnalyticsDashboard === 'undefined') {
    return { error: 'AnalyticsDashboard module not loaded' };
  }
  const dashboard = new AnalyticsDashboard();
  await dashboard.loadInitialData();
  const jsonData = dashboard.exportData('json');
  const csvData = dashboard.exportData('csv');
  return {
    status: 'Export completed',
    formats: ['JSON', 'CSV'],
    jsonPreview: JSON.stringify(jsonData).substring(0, 200) + '...',
    csvPreview: csvData.substring(0, 200) + '...',
    message: 'Analytics data exported successfully in JSON and CSV formats',
  };
}

// Clinical AI Executors
async function executeClinicalRiskAssess() {
  if (typeof AIClinicalSupport === 'undefined') {
    return { error: 'AIClinicalSupport module not loaded' };
  }
  const clinicalAI = new AIClinicalSupport();
  const patientData = {
    age: 58,
    gender: 'male',
    vitals: { systolicBP: 145, diastolicBP: 92, heartRate: 88, temperature: 37.2 },
    labs: { glucose: 145, hba1c: 6.8, cholesterol: 220, ldl: 145 },
    medicalHistory: ['hypertension', 'type2_diabetes'],
    medications: ['metformin', 'lisinopril'],
    lifestyle: { smoking: true, bmi: 31.5 },
  };
  const riskAssessment = clinicalAI.assessPatientRisk(patientData);
  return {
    patient: 'Demo Patient (58yo Male)',
    riskAssessment,
    summary: 'Multi-domain clinical risk assessment completed',
    highRiskDomains: Object.entries(riskAssessment).filter(([, v]) => v.riskLevel === 'high' || v.riskLevel === 'critical').map(([k]) => k),
  };
}

async function executeClinicalDrugCheck() {
  if (typeof AIClinicalSupport === 'undefined') {
    return { error: 'AIClinicalSupport module not loaded' };
  }
  const clinicalAI = new AIClinicalSupport();
  const medications = ['warfarin', 'aspirin', 'metformin'];
  const interactions = clinicalAI.checkDrugInteractions(medications);
  return {
    medications,
    interactions,
    summary: `Checked ${medications.length} medications for drug-drug interactions`,
    criticalInteractions: interactions.filter(i => i.severity === 'major' || i.severity === 'severe').length,
  };
}

async function executeClinicalDiagnostic() {
  if (typeof AIClinicalSupport === 'undefined') {
    return { error: 'AIClinicalSupport module not loaded' };
  }
  const clinicalAI = new AIClinicalSupport();
  const symptoms = ['chest pain', 'shortness of breath', 'diaphoresis'];
  const vitals = { systolicBP: 145, diastolicBP: 92, heartRate: 110 };
  const suggestions = clinicalAI.suggestDiagnosis(symptoms, vitals);
  return {
    presentingSymptoms: symptoms,
    vitals,
    diagnosticSuggestions: suggestions,
    summary: 'AI-powered diagnostic decision support',
    topDiagnosis: suggestions[0]?.condition || 'No diagnosis suggested',
  };
}

async function executeClinicalPathway() {
  if (typeof AIClinicalSupport === 'undefined') {
    return { error: 'AIClinicalSupport module not loaded' };
  }
  const clinicalAI = new AIClinicalSupport();
  const pathway = clinicalAI.getClinicalPathway('ami');
  return {
    pathwayType: 'Acute Myocardial Infarction (AMI)',
    pathway,
    summary: 'Evidence-based clinical pathway with step-by-step protocol',
    totalSteps: pathway?.steps?.length || 0,
  };
}

// Authentication Executors
async function executeAuthLogin() {
  if (typeof AuthenticationManager === 'undefined') {
    return { error: 'AuthenticationManager module not loaded' };
  }
  const authManager = new AuthenticationManager();
  const result = await authManager.login('demo.physician@brainsait.health', 'DemoPassword123!', 'password');
  return {
    authentication: 'successful',
    user: result.user,
    tokens: {
      accessToken: result.tokens.accessToken.substring(0, 50) + '...',
      refreshToken: result.tokens.refreshToken.substring(0, 50) + '...',
      expiresIn: result.tokens.expiresIn,
    },
    session: result.session,
    summary: 'JWT authentication completed successfully',
  };
}

async function executeAuthOAuth() {
  if (typeof AuthenticationManager === 'undefined') {
    return { error: 'AuthenticationManager module not loaded' };
  }
  const authManager = new AuthenticationManager();
  const result = await authManager.loginWithOAuth('google', 'demo_google_user_001');
  return {
    authentication: 'successful',
    provider: 'Google OAuth2',
    user: result.user,
    tokens: {
      accessToken: result.tokens.accessToken.substring(0, 50) + '...',
      expiresIn: result.tokens.expiresIn,
    },
    summary: 'OAuth2 authentication flow completed',
  };
}

async function executeAuthMFA() {
  if (typeof AuthenticationManager === 'undefined') {
    return { error: 'AuthenticationManager module not loaded' };
  }
  const authManager = new AuthenticationManager();
  // First login
  await authManager.login('demo.admin@brainsait.health', 'Admin123!', 'password');
  // Then MFA
  const mfaResult = await authManager.verifyMFA('123456');
  return {
    mfaVerification: 'successful',
    method: 'TOTP',
    result: mfaResult,
    summary: 'Multi-factor authentication verified',
  };
}

async function executeAuthBiometric() {
  if (typeof AuthenticationManager === 'undefined') {
    return { error: 'AuthenticationManager module not loaded' };
  }
  const authManager = new AuthenticationManager();
  try {
    const result = await authManager.authenticateWithBiometric('demo_user_001');
    return {
      authentication: 'successful',
      method: 'WebAuthn Biometric',
      result,
      summary: 'Biometric authentication (Face ID / Touch ID) completed',
    };
  } catch (error) {
    return {
      status: 'simulated',
      message: 'Biometric authentication requires HTTPS and supported hardware',
      note: 'In production, this would use WebAuthn API for Face ID, Touch ID, or fingerprint authentication',
    };
  }
}

async function executeAuthRoles() {
  if (typeof AuthenticationManager === 'undefined') {
    return { error: 'AuthenticationManager module not loaded' };
  }
  const authManager = new AuthenticationManager();
  const roles = Object.keys(authManager.rolePermissions).map(role => ({
    role,
    level: authManager.rolePermissions[role].level,
    permissions: authManager.rolePermissions[role].permissions.slice(0, 5),
    description: authManager.rolePermissions[role].description,
  }));
  return {
    rbacSystem: 'Role-Based Access Control (RBAC)',
    totalRoles: roles.length,
    roles,
    summary: '7 healthcare roles with granular permission management',
  };
}

async function executeAuthSessions() {
  if (typeof AuthenticationManager === 'undefined') {
    return { error: 'AuthenticationManager module not loaded' };
  }
  const authManager = new AuthenticationManager();
  // Login to create a session
  await authManager.login('demo.physician@brainsait.health', 'DemoPassword123!', 'password');
  const sessions = authManager.getActiveSessions();
  return {
    activeSessions: sessions.length,
    sessions: sessions.map(s => ({
      id: s.id,
      userId: s.userId,
      deviceInfo: s.deviceInfo,
      lastActivity: s.lastActivity,
      isActive: s.isActive,
    })),
    summary: 'Active session management with device tracking',
  };
}

// Workflow Executors
async function executeWorkflowTemplates() {
  if (typeof FHIRWorkflowEngine === 'undefined') {
    return { error: 'FHIRWorkflowEngine module not loaded' };
  }
  const workflowEngine = new FHIRWorkflowEngine();
  const templates = Object.entries(workflowEngine.workflowTemplates).map(([key, template]) => ({
    type: key,
    name: template.name,
    description: template.description,
    steps: template.steps.length,
    stepNames: template.steps.map(s => s.name),
  }));
  return {
    workflowTemplates: templates,
    totalTemplates: templates.length,
    summary: 'Pre-built clinical workflow templates (Admission, Discharge, Medication, Lab)',
  };
}

async function executeWorkflowCarePlan() {
  if (typeof FHIRWorkflowEngine === 'undefined') {
    return { error: 'FHIRWorkflowEngine module not loaded' };
  }
  const workflowEngine = new FHIRWorkflowEngine();
  const carePlan = workflowEngine.createCarePlan('patient-001', 'practitioner-001', 'Diabetes Management Plan', [
    { code: '33747003', display: 'Glycemic control', target: 'HbA1c < 7%' },
    { code: '161832001', display: 'Weight management', target: 'BMI < 30' },
  ]);
  return {
    resourceType: carePlan.resourceType,
    id: carePlan.id,
    status: carePlan.status,
    title: carePlan.title,
    goals: carePlan.goal,
    summary: 'FHIR R4 CarePlan resource created with goals and activities',
  };
}

async function executeWorkflowTask() {
  if (typeof FHIRWorkflowEngine === 'undefined') {
    return { error: 'FHIRWorkflowEngine module not loaded' };
  }
  const workflowEngine = new FHIRWorkflowEngine();
  const task = workflowEngine.createTask('patient-001', 'practitioner-001', 'Review lab results', 'Review and interpret recent HbA1c results');
  return {
    resourceType: task.resourceType,
    id: task.id,
    status: task.status,
    priority: task.priority,
    description: task.description,
    summary: 'FHIR R4 Task resource created for clinical task management',
  };
}

async function executeWorkflowMedication() {
  if (typeof FHIRWorkflowEngine === 'undefined') {
    return { error: 'FHIRWorkflowEngine module not loaded' };
  }
  const workflowEngine = new FHIRWorkflowEngine();
  const medOrder = workflowEngine.createMedicationOrder('patient-001', 'practitioner-001', {
    code: '105075',
    display: 'Metformin 500mg',
  }, 'Take 1 tablet twice daily with meals');
  return {
    resourceType: medOrder.resourceType,
    id: medOrder.id,
    status: medOrder.status,
    medication: medOrder.medicationCodeableConcept,
    dosageInstruction: medOrder.dosageInstruction,
    summary: 'FHIR R4 MedicationRequest resource created',
  };
}

async function executeWorkflowLab() {
  if (typeof FHIRWorkflowEngine === 'undefined') {
    return { error: 'FHIRWorkflowEngine module not loaded' };
  }
  const workflowEngine = new FHIRWorkflowEngine();
  const labOrder = workflowEngine.createLabOrder('patient-001', 'practitioner-001', {
    code: '4548-4',
    display: 'Hemoglobin A1c',
  });
  return {
    resourceType: labOrder.resourceType,
    id: labOrder.id,
    status: labOrder.status,
    code: labOrder.code,
    summary: 'FHIR R4 ServiceRequest (lab order) resource created',
  };
}

// Reporting Executors
async function executeReportsTemplates() {
  if (typeof ReportingEngine === 'undefined') {
    return { error: 'ReportingEngine module not loaded' };
  }
  const reportingEngine = new ReportingEngine();
  const templates = Object.entries(reportingEngine.reportTemplates).map(([key, template]) => ({
    type: key,
    name: template.name,
    description: template.description,
    sections: template.sections.length,
  }));
  return {
    reportTemplates: templates,
    totalTemplates: templates.length,
    exportFormats: ['PDF', 'Excel (XLSX)', 'CSV'],
    summary: '5 professional report templates (Patient Summary, Clinical Quality, Financial, Compliance, Vision 2030)',
  };
}

async function executeReportsPatient() {
  if (typeof ReportingEngine === 'undefined') {
    return { error: 'ReportingEngine module not loaded' };
  }
  const reportingEngine = new ReportingEngine();
  const sampleData = {
    patient: { id: 'P001', name: 'Ahmed Al-Ali', age: 45, mrn: 'MRN-2024-001' },
    vitals: { bp: '140/90', hr: 88, temp: 37.2 },
    medications: ['Metformin 500mg BID', 'Lisinopril 10mg QD'],
    diagnoses: ['Type 2 Diabetes Mellitus', 'Hypertension'],
  };
  const report = reportingEngine.generateReport('patient_summary', sampleData);
  return {
    reportType: 'Patient Summary',
    generatedAt: report.generatedAt,
    sections: report.sections,
    data: sampleData,
    summary: 'Comprehensive patient summary report generated',
  };
}

async function executeReportsClinical() {
  if (typeof ReportingEngine === 'undefined') {
    return { error: 'ReportingEngine module not loaded' };
  }
  const reportingEngine = new ReportingEngine();
  const sampleData = {
    period: 'Q1 2024',
    outcomes: { mortality: 2.1, readmission: 12.4, infectionRate: 1.8 },
    safety: { adverseEvents: 45, medicationErrors: 12, falls: 8 },
    efficiency: { avgLOS: 4.2, bedUtilization: 87, waitTime: 35 },
  };
  const report = reportingEngine.generateReport('clinical_quality', sampleData);
  return {
    reportType: 'Clinical Quality Metrics',
    period: sampleData.period,
    generatedAt: report.generatedAt,
    keyMetrics: sampleData,
    summary: 'Clinical quality and safety metrics report',
  };
}

async function executeReportsVision2030() {
  if (typeof ReportingEngine === 'undefined') {
    return { error: 'ReportingEngine module not loaded' };
  }
  const reportingEngine = new ReportingEngine();
  const sampleData = {
    period: '2024',
    digitalTransformation: { ehrAdoption: 98, paperlessOps: 92, telehealth: 85 },
    aiIntegration: { diagnosticAI: 78, predictiveAnalytics: 82, nlpUsage: 88 },
    qualityMetrics: { patientSafety: 94, outcomes: 91, experience: 89 },
  };
  const report = reportingEngine.generateReport('vision2030_progress', sampleData);
  return {
    reportType: 'Saudi Vision 2030 Progress',
    period: sampleData.period,
    generatedAt: report.generatedAt,
    progress: sampleData,
    summary: 'Vision 2030 digital health transformation progress report',
  };
}

async function executeReportsCompliance() {
  if (typeof ReportingEngine === 'undefined') {
    return { error: 'ReportingEngine module not loaded' };
  }
  const reportingEngine = new ReportingEngine();
  const sampleData = {
    period: 'Q1 2024',
    accessLogs: { total: 15432, authorized: 15389, unauthorized: 43 },
    breaches: { total: 2, resolved: 2, pending: 0 },
    training: { completed: 245, pending: 12, compliance: 95.3 },
  };
  const report = reportingEngine.generateReport('compliance_audit', sampleData);
  return {
    reportType: 'HIPAA Compliance Audit',
    period: sampleData.period,
    generatedAt: report.generatedAt,
    complianceData: sampleData,
    summary: 'HIPAA compliance and security audit report',
  };
}

async function executeReportsExport() {
  if (typeof ReportingEngine === 'undefined') {
    return { error: 'ReportingEngine module not loaded' };
  }
  const reportingEngine = new ReportingEngine();
  return {
    status: 'Export capabilities ready',
    formats: [
      { format: 'PDF', library: 'jsPDF', status: 'Ready (requires jsPDF library in production)' },
      { format: 'Excel', library: 'SheetJS', status: 'Ready (requires xlsx library in production)' },
      { format: 'CSV', library: 'Native', status: 'Ready' },
    ],
    note: 'In production, integrate jsPDF and SheetJS libraries for full export functionality',
    summary: 'Multi-format report export capabilities',
  };
}

const actionRegistry = {
  'sdk-health': {
    loaderId: 'api-loading',
    outputId: 'api-output',
    successMessage: 'SDK health check completed.',
    executor: async () => {
      const health = await executeHealthCheck();
      updateLiveStatus(health);
      state.lastHealth = health;
      return health;
    },
  },
  'sdk-config': {
    loaderId: 'api-loading',
    outputId: 'api-output',
    successMessage: 'Configuration snapshot loaded.',
    executor: executeConfigFetch,
  },
  'sdk-metrics': {
    loaderId: 'api-loading',
    outputId: 'api-output',
    successMessage: 'Performance metrics refreshed.',
    executor: async () => {
      const result = await executeMetricsFetch();
      updateLiveStatus(state.lastHealth ?? mockData.health, result);
      return result;
    },
  },
  'fhir-patient': {
    loaderId: 'fhir-loading',
    outputId: 'fhir-output',
    successMessage: 'FHIR patient payload processed.',
    executor: executeFHIRPatient,
  },
  'fhir-validate': {
    loaderId: 'fhir-loading',
    outputId: 'fhir-output',
    successMessage: 'FHIR capability statement loaded.',
    executor: executeFHIRValidation,
  },
  'fhir-bundle': {
    loaderId: 'fhir-loading',
    outputId: 'fhir-output',
    successMessage: 'FHIR transaction bundle executed.',
    executor: executeFHIRBundle,
  },
  'ai-masterlinc': {
    loaderId: 'ai-loading',
    outputId: 'ai-output',
    successMessage: 'MASTERLINC analysis generated.',
    executor: executeMasterLinc,
  },
  'ai-healthcarelinc': {
    loaderId: 'ai-loading',
    outputId: 'ai-output',
    successMessage: 'HEALTHCARELINC insights generated.',
    executor: executeHealthcareLinc,
  },
  'ai-vision2030': {
    loaderId: 'ai-loading',
    outputId: 'ai-output',
    successMessage: 'Vision 2030 metrics generated.',
    executor: executeVision2030,
  },
  'db-health': {
    loaderId: 'db-loading',
    outputId: 'db-output',
    successMessage: 'Database health snapshot retrieved.',
    executor: executeDatabaseHealth,
  },
  'db-hospitals': {
    loaderId: 'db-loading',
    outputId: 'db-output',
    successMessage: 'Hospital registry loaded.',
    executor: executeHospitals,
  },
  'db-ai-models': {
    loaderId: 'db-loading',
    outputId: 'db-output',
    successMessage: 'AI model registry loaded.',
    executor: executeAIModels,
  },
  // Analytics Dashboard Actions
  'analytics-realtime': {
    loaderId: 'analytics-loading',
    outputId: 'analytics-output',
    successMessage: 'Real-time monitoring started.',
    executor: executeAnalyticsRealtime,
  },
  'analytics-vision2030': {
    loaderId: 'analytics-loading',
    outputId: 'analytics-output',
    successMessage: 'Vision 2030 KPIs loaded.',
    executor: executeAnalyticsVision2030,
  },
  'analytics-predictions': {
    loaderId: 'analytics-loading',
    outputId: 'analytics-output',
    successMessage: 'Predictive analytics generated.',
    executor: executeAnalyticsPredictions,
  },
  'analytics-export': {
    loaderId: 'analytics-loading',
    outputId: 'analytics-output',
    successMessage: 'Analytics data exported.',
    executor: executeAnalyticsExport,
  },
  // Clinical AI Actions
  'clinical-risk-assess': {
    loaderId: 'clinical-loading',
    outputId: 'clinical-output',
    successMessage: 'Risk assessment completed.',
    executor: executeClinicalRiskAssess,
  },
  'clinical-drug-check': {
    loaderId: 'clinical-loading',
    outputId: 'clinical-output',
    successMessage: 'Drug interaction check completed.',
    executor: executeClinicalDrugCheck,
  },
  'clinical-diagnostic': {
    loaderId: 'clinical-loading',
    outputId: 'clinical-output',
    successMessage: 'Diagnostic suggestions generated.',
    executor: executeClinicalDiagnostic,
  },
  'clinical-pathway': {
    loaderId: 'clinical-loading',
    outputId: 'clinical-output',
    successMessage: 'Clinical pathways loaded.',
    executor: executeClinicalPathway,
  },
  // Authentication Actions
  'auth-login': {
    loaderId: 'auth-loading',
    outputId: 'auth-output',
    successMessage: 'Login successful.',
    executor: executeAuthLogin,
  },
  'auth-oauth': {
    loaderId: 'auth-loading',
    outputId: 'auth-output',
    successMessage: 'OAuth2 authentication initiated.',
    executor: executeAuthOAuth,
  },
  'auth-mfa': {
    loaderId: 'auth-loading',
    outputId: 'auth-output',
    successMessage: 'MFA verification completed.',
    executor: executeAuthMFA,
  },
  'auth-biometric': {
    loaderId: 'auth-loading',
    outputId: 'auth-output',
    successMessage: 'Biometric authentication completed.',
    executor: executeAuthBiometric,
  },
  'auth-roles': {
    loaderId: 'auth-loading',
    outputId: 'auth-output',
    successMessage: 'Role permissions retrieved.',
    executor: executeAuthRoles,
  },
  'auth-sessions': {
    loaderId: 'auth-loading',
    outputId: 'auth-output',
    successMessage: 'Active sessions retrieved.',
    executor: executeAuthSessions,
  },
  // Workflow Actions
  'workflow-templates': {
    loaderId: 'workflow-loading',
    outputId: 'workflow-output',
    successMessage: 'Workflow templates loaded.',
    executor: executeWorkflowTemplates,
  },
  'workflow-careplan': {
    loaderId: 'workflow-loading',
    outputId: 'workflow-output',
    successMessage: 'Care plan created.',
    executor: executeWorkflowCarePlan,
  },
  'workflow-task': {
    loaderId: 'workflow-loading',
    outputId: 'workflow-output',
    successMessage: 'Task management demo completed.',
    executor: executeWorkflowTask,
  },
  'workflow-medication': {
    loaderId: 'workflow-loading',
    outputId: 'workflow-output',
    successMessage: 'Medication order created.',
    executor: executeWorkflowMedication,
  },
  'workflow-lab': {
    loaderId: 'workflow-loading',
    outputId: 'workflow-output',
    successMessage: 'Lab order created.',
    executor: executeWorkflowLab,
  },
  // Reporting Actions
  'reports-templates': {
    loaderId: 'reports-loading',
    outputId: 'reports-output',
    successMessage: 'Report templates loaded.',
    executor: executeReportsTemplates,
  },
  'reports-patient': {
    loaderId: 'reports-loading',
    outputId: 'reports-output',
    successMessage: 'Patient summary report generated.',
    executor: executeReportsPatient,
  },
  'reports-clinical': {
    loaderId: 'reports-loading',
    outputId: 'reports-output',
    successMessage: 'Clinical quality report generated.',
    executor: executeReportsClinical,
  },
  'reports-vision2030': {
    loaderId: 'reports-loading',
    outputId: 'reports-output',
    successMessage: 'Vision 2030 progress report generated.',
    executor: executeReportsVision2030,
  },
  'reports-compliance': {
    loaderId: 'reports-loading',
    outputId: 'reports-output',
    successMessage: 'Compliance audit report generated.',
    executor: executeReportsCompliance,
  },
  'reports-export': {
    loaderId: 'reports-loading',
    outputId: 'reports-output',
    successMessage: 'Reports exported successfully.',
    executor: executeReportsExport,
  },
};

function attachActionHandlers() {
  document.querySelectorAll('[data-action]').forEach(button => {
    button.addEventListener('click', () => {
      const key = button.dataset.action;
      executeAction(key);
    });
  });
}

function attachAIScenarioHandler() {
  const form = getContainer('aiScenarioForm');
  if (!form) {
    return;
  }

  form.addEventListener('submit', event => {
    event.preventDefault();

    const scenarioKey = form.scenario.value;
    const profile = aiScenarioProfiles[scenarioKey];
    if (!profile) {
      renderOutput('ai-scenario-output', 'Scenario profile not found.', true);
      return;
    }

    const horizon = Number(form.horizon.value || 30);
    const enableXai = Boolean(form.enableXai?.checked);
    const enableArabic = Boolean(form.enableArabic?.checked);
    const enableEdge = Boolean(form.enableEdge?.checked);

    const metrics = computeScenarioMetrics({
      horizon,
      enableXai,
      enableArabic,
      enableEdge,
      profile,
    });

    updateMetricsBanner(metrics);

    const result = {
      scenario: profile.title,
      projectionHorizon: `${horizon} days`,
      coPilotModules: {
        explainableAI: enableXai,
        arabicNlp: enableArabic,
        edgeDeployment: enableEdge,
      },
      narrative: profile.narrative,
      keyInsights: {
        throughputGain: profile.insights.throughputGain,
        riskAlerts: profile.insights.riskAlerts,
        projectedWaitReduction: profile.insights.projectedWaitReduction,
      },
      recommendedActions: profile.interventions,
      operationalPlaybook: {
        auditTrail: enableXai
          ? 'Counterfactual explanations ready for clinical review.'
          : 'Enable Explainable AI to generate regulatory audit trails.',
        deployment: enableEdge
          ? 'Deploy edge inference bundles to 24 Cloudflare regions.'
          : 'Enable edge deployment to target sub-120ms inference.',
        localization: enableArabic
          ? 'Arabic NLP tuned for KSA regional dialects.'
          : 'Activate Arabic NLP to improve patient intent recognition.',
      },
      generatedAt: new Date().toISOString(),
    };

    renderOutput('ai-scenario-output', result);
    showToast('AI scenario simulation completed.', 'success');
  });
}

async function hydrateInitialState() {
  await executeAction('sdk-health', { silent: true });
  await executeAction('sdk-metrics', { silent: true });
}

document.addEventListener('DOMContentLoaded', async () => {
  initNavigation();
  initTabs();
  initSmoothScrolling();
  attachEndpointButtons();
  attachActionHandlers();
  attachAIScenarioHandler();
  await initSDK();
  await hydrateInitialState();
});
