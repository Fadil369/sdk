/**
 * AI and machine learning type definitions
 */

export interface AIConfig {
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

export interface AIAgent {
  id: string;
  name: string;
  type: 'nlp' | 'analytics' | 'decision-support' | 'automation';
  version: string;
  status: 'active' | 'inactive' | 'training' | 'error';
  capabilities: string[];
  configuration: Record<string, any>;
}

export interface NLPRequest {
  text: string;
  language: 'ar' | 'en';
  tasks: ('entity-extraction' | 'sentiment-analysis' | 'translation' | 'summarization')[];
  context?: {
    patientId?: string;
    resourceType?: string;
    specialty?: string;
  };
}

export interface NLPResponse {
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

export interface ExtractedEntity {
  text: string;
  label: string;
  confidence: number;
  startIndex: number;
  endIndex: number;
  metadata?: Record<string, any>;
}

export interface SentimentScore {
  overall: number; // -1 to 1
  aspects: {
    [aspect: string]: number;
  };
  confidence: number;
}

export interface TranslationResult {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  confidence: number;
}

export interface ClinicalDecisionSupport {
  patientData: any;
  context: {
    symptoms?: string[];
    vitals?: Record<string, number>;
    history?: string[];
    currentMedications?: string[];
  };
  recommendations?: ClinicalRecommendation[];
  alerts?: ClinicalAlert[];
}

export interface ClinicalRecommendation {
  type: 'diagnosis' | 'treatment' | 'medication' | 'test' | 'referral';
  suggestion: string;
  confidence: number;
  evidence: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface ClinicalAlert {
  type: 'interaction' | 'allergy' | 'contraindication' | 'dosage' | 'monitoring';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  affectedMedications?: string[];
  recommendedAction?: string;
}

export interface PredictiveAnalytics {
  modelType: 'risk-assessment' | 'readmission' | 'outcome-prediction' | 'resource-planning';
  inputData: Record<string, any>;
  predictions: Prediction[];
  modelMetrics: {
    accuracy: number;
    lastTrainingDate: string;
    dataQualityScore: number;
  };
}

export interface Prediction {
  outcome: string;
  probability: number;
  confidence: number;
  timeframe?: string;
  factors?: PredictionFactor[];
}

export interface PredictionFactor {
  name: string;
  importance: number;
  value: any;
  impact: 'positive' | 'negative' | 'neutral';
}

export interface AIWorkflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  status: 'active' | 'paused' | 'completed' | 'error';
  triggers: WorkflowTrigger[];
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'data-input' | 'ai-processing' | 'human-review' | 'action' | 'notification';
  configuration: Record<string, any>;
  dependencies?: string[];
}

export interface WorkflowTrigger {
  type: 'schedule' | 'event' | 'manual' | 'data-change';
  configuration: Record<string, any>;
}