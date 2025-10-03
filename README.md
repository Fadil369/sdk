# BrainSAIT Healthcare SDK

A comprehensive Software Development Kit (SDK) for NPHIES/FHIR Integration with Healthcare Ecosystems in Saudi Arabia, featuring Arabic/HIPAA support, AI agents, and glass morphism UI components.

## Features

- **🏥 NPHIES Integration**: Complete NPHIES API support with Arabic language handling
- **🔥 FHIR R4 Support**: Full FHIR R4 compliance with Saudi-specific extensions  
- **🤖 AI Agents**: Integrated AI agents for clinical decision support
- **🐍 Python Integration**: PyBrain & PyHeart packages for advanced AI and workflow capabilities
- **🎨 Glass Morphism UI**: Modern Arabic-first UI components with glass morphism design
- **🔒 HIPAA Compliance**: Built-in security and compliance features
- **📱 Mobile Responsive**: Optimized for all device sizes
- **🌐 Arabic RTL Support**: Native Arabic language and RTL layout support
- **⚡ Edge Computing**: Cloudflare Workers integration for global performance
- **🗄️ MongoDB Atlas**: Integrated database solutions for healthcare data
- **🚀 Vision 2030 Ready**: Aligned with Saudi Arabia's digital transformation goals

## 📦 Installation

```bash
npm install @brainsait/healthcare-sdk
```

### Python Integration Setup (Optional)

For advanced AI and workflow features, install Python dependencies:

```bash
# Create virtual environment (recommended)
python3 -m venv .venv-healthcare
source .venv-healthcare/bin/activate  # On Windows: .venv-healthcare\Scripts\activate

# Install required packages
pip install numpy pydantic structlog httpx tenacity fastapi

# Set Python path for the SDK (optional)
export PYTHON_BRIDGE_PYTHON="./.venv-healthcare/bin/python"
```

## 🔧 Quick Start

```typescript
import { BrainSAITHealthcareSDK } from '@brainsait/healthcare-sdk';

// Initialize the SDK
const sdk = new BrainSAITHealthcareSDK({
  api: {
    baseUrl: 'https://api.brainsait.com',
    timeout: 30000,
    retries: 3,
  },
  fhir: {
    serverUrl: 'https://fhir.nphies.sa',
    version: 'R4',
  },
  nphies: {
    baseUrl: 'https://nphies.sa',
    clientId: 'your-client-id',
    scope: ['read', 'write'],
    sandbox: true, // Set to false for production
  },
  localization: {
    defaultLanguage: 'ar',
    rtl: true,
  },
});

// Initialize the SDK
await sdk.initialize();

// Check system health
const health = await sdk.healthCheck();
console.log('System Status:', health.status);

// Access FHIR client
const fhirClient = sdk.fhir;

// Access NPHIES client
const nphiesClient = sdk.nphies;

// Access AI agents (if enabled)
const aiManager = sdk.ai;
```

### Python Integration (PyBrain & PyHeart)

The SDK includes advanced Python-based AI and workflow capabilities:

```typescript
import { 
  analyzeClinicalNote, 
  predictPatientRisk, 
  runRiskWorkflow,
  orchestratePythonCarePlan 
} from '@brainsait/healthcare-sdk';

// Extract clinical entities using PyBrain
const entities = await analyzeClinicalNote(
  'Patient presents with type 2 diabetes, prescribed metformin 500mg twice daily'
);
console.log('Extracted conditions:', entities.entities.conditions);
// Output: ['Diabetes']

// Predict patient risk scores
const riskAnalysis = await predictPatientRisk({
  age: 65,
  bmi: 30,
  conditions: ['diabetes', 'hypertension'],
  medications: ['metformin', 'lisinopril']
});
console.log('Risk score:', riskAnalysis.riskScore); // 0.45

// Run automated care workflows with PyHeart
const workflow = await runRiskWorkflow({
  patient: { id: '12345', name: 'أحمد المحمد' },
  riskScore: 0.8,
  careTeam: ['dr.hassan@hospital.sa'],
  context: {
    fhirServer: 'https://fhir.nphies.sa',
    primaryPhysician: 'dr.fatima@clinic.sa'
  }
});
console.log('Workflow status:', workflow.status); // 'completed'
console.log('Care plan:', workflow.variables.care_plan); // 'priority-followup'

// Orchestrate end-to-end care planning
const carePlan = await orchestratePythonCarePlan({
  note: 'Elderly patient with hypertension and chest pain',
  patient: {
    id: '67890',
    name: 'فاطمة أحمد',
    age: 72,
    conditions: ['hypertension']
  },
  careTeam: ['care.coordinator@hospital.sa']
});
```

## 🏗️ Architecture

The SDK is built with a modular architecture:

```text
src/
├── core/           # Core SDK functionality
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
├── fhir/           # FHIR R4/R5 client and utilities
├── nphies/         # NPHIES-specific implementations
├── security/       # Security and compliance features
├── ai/             # AI agents and ML capabilities
├── python/         # Python integration layer
└── ui/             # Glass morphism UI components

python-integration/
├── bridge.py       # Python ↔ TypeScript bridge
└── README.md       # Python setup documentation

pybrain-pyheart/
├── pybrain-pkg/    # PyBrain: AI & Clinical NLP
│   └── src/pybrain/
└── pyheart-pkg/    # PyHeart: Workflows & Interoperability
    └── src/pyheart/
```

### Python Packages Overview

#### PyBrain - Healthcare Intelligence

- **Clinical NLP**: Extract entities from medical notes
- **Risk Prediction**: AI-powered patient risk scoring
- **Decision Support**: Evidence-based clinical recommendations
- **Population Analytics**: Health trends and insights

#### PyHeart - Workflow Engine

- **Process Orchestration**: Automated healthcare workflows
- **System Integration**: Universal healthcare data connectivity
- **Event-Driven Architecture**: Real-time care coordination
- **Compliance Engine**: HIPAA, GDPR automated compliance

## 🔐 Security & Compliance

- **HIPAA Compliance**: Built-in audit logging and data protection
- **Encryption**: AES-256-GCM encryption for sensitive data
- **Role-Based Access Control**: Fine-grained permission system
- **Audit Trails**: Comprehensive logging for compliance
- **Security Headers**: Industry-standard security headers implemented
- **Secret Management**: Secure credential storage with Cloudflare Workers Secrets

### 📋 Security Documentation

- **[SECURITY.md](SECURITY.md)** - Security policy and vulnerability reporting
- **[SECURITY_SETUP.md](SECURITY_SETUP.md)** - Step-by-step security setup guide
- **[SECURITY_HEADERS.md](SECURITY_HEADERS.md)** - Security headers configuration and testing
- **[DEPLOYMENT_SECURITY_CHECKLIST.md](DEPLOYMENT_SECURITY_CHECKLIST.md)** - Pre-deployment security checklist
- **[DEPENDENCY_SECURITY.md](DEPENDENCY_SECURITY.md)** - Dependency vulnerability tracking

## 🌐 Internationalization

- **Arabic Support**: Native Arabic language support
- **RTL Layout**: Right-to-left layout support
- **Localization**: Easy translation and localization system

```typescript
import { t } from '@brainsait/healthcare-sdk/utils';

// Use translations
const welcome = t('welcome', 'ar'); // مرحباً
const patient = t('patient', 'en'); // Patient
```

## 🤖 AI Capabilities

The SDK includes AI agents for healthcare automation:

- **Natural Language Processing**: Arabic and English text processing
- **Clinical Decision Support**: AI-powered recommendations
- **Predictive Analytics**: Risk assessment and outcome prediction
- **Automated Workflows**: Intelligent process automation

## 🎨 UI Components

Glass morphism UI components optimized for 60fps performance:

```typescript
import { GlassMorphismButton, HealthcareDashboard } from '@brainsait/healthcare-sdk/ui';

// Use glass morphism components
const MyComponent = () => (
  <GlassMorphismButton 
    variant="primary"
    glassMorphism={{ opacity: 0.1, blur: 20 }}
  >
    Submit Claim
  </GlassMorphismButton>
);
```

## 📊 Performance Monitoring

Built-in performance monitoring and optimization:

```typescript
// Get performance metrics
const metrics = sdk.getPerformanceMetrics();
console.log('API Response Time:', metrics.apiResponseTime);
console.log('UI Frame Rate:', metrics.uiFrameRate);
console.log('Concurrent Users:', metrics.concurrentUsers);
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📚 Documentation

- [API Reference](docs/api/README.md)
- [FHIR Integration Guide](docs/fhir/README.md)
- [NPHIES Integration Guide](docs/nphies/README.md)
- [Security Guide](docs/security/README.md)
- [AI Agents Guide](docs/ai/README.md)
- [UI Components Guide](docs/ui/README.md)

## 🛠️ Development

```bash
# Install dependencies
npm install

# Start development mode
npm run dev

# Build the project
npm run build

# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run typecheck
```

## 🚢 Deployment

The SDK supports multiple deployment options:

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### Cloud Platforms

- AWS Lambda/ECS
- Azure Container Instances
- Google Cloud Run
- Kubernetes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- [Documentation](https://docs.brainsait.com)
- [GitHub Issues](https://github.com/Fadil369/sdk/issues)
- [Email Support](mailto:support@brainsait.com)

## 🏥 Healthcare Compliance

This SDK is designed for use in Saudi Arabian healthcare systems and complies with:

- NPHIES regulations and standards
- HIPAA privacy and security requirements
- Saudi Data Protection Law
- Healthcare data handling best practices

---

Built with ❤️ by [BrainSAIT](https://brainsait.com) for the Saudi healthcare ecosystem.
