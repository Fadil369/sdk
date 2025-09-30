/**
 * MongoDB Atlas Database Types for BrainSAIT Platform
 */

export interface Location {
  city: string;
  region: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface Capacity {
  beds: number;
  icu: number;
  emergency: number;
}

export interface Vision2030Compliance {
  health_sector_transformation: boolean;
  digital_health_adoption: number;
  ai_integration_level: number;
}

export interface Hospital {
  hospital_id: string;
  name: string;
  location: Location;
  license_number: string;
  capacity: Capacity;
  specializations: string[];
  digital_maturity_level: number;
  vision2030_compliance: Vision2030Compliance;
  created_at: Date;
  updated_at: Date;
}

export interface PerformanceMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
}

export interface Vision2030Alignment {
  innovation_contribution: number;
  quality_improvement: number;
  efficiency_gain: number;
}

export interface AIModel {
  model_id: string;
  name: string;
  type: 'predictive' | 'diagnostic' | 'therapeutic' | 'administrative';
  version: string;
  healthcare_domain: string;
  performance_metrics: PerformanceMetrics;
  deployment_status: 'development' | 'testing' | 'production' | 'retired';
  vision2030_alignment: Vision2030Alignment;
  created_at: Date;
  last_updated: Date;
}

export interface Vision2030Goals {
  health_sector_transformation: {
    digital_health_adoption: number;
    ai_integration: number;
    patient_experience: number;
  };
  innovation_economy: {
    tech_adoption: number;
    research_contribution: number;
    startup_collaboration: number;
  };
  sustainability: {
    resource_efficiency: number;
    environmental_impact: number;
    social_responsibility: number;
  };
}

export interface Vision2030Metrics {
  metric_id: string;
  hospital_id: string;
  vision2030_goals: Vision2030Goals;
  overall_alignment_score: number;
  measurement_date: Date;
}

export interface Patient {
  patient_id: string;
  hospital_id: string;
  national_id?: string;
  name: {
    arabic: string;
    english: string;
  };
  demographics: {
    age: number;
    gender: 'male' | 'female';
    nationality: string;
  };
  medical_record: {
    allergies: string[];
    chronic_conditions: string[];
    current_medications: string[];
  };
  privacy_consent: {
    data_sharing: boolean;
    ai_analysis: boolean;
    research_participation: boolean;
  };
  created_at: Date;
  updated_at: Date;
}

export interface DatabaseConfig {
  uri: string;
  database: string;
  collections: {
    hospitals: string;
    patients: string;
    ai_models: string;
    vision2030_metrics: string;
    audit_logs: string;
    user_sessions: string;
    fhir_resources: string;
  };
  options?: {
    ssl: boolean;
    retryWrites: boolean;
    writeConcern: string;
    readPreference: 'primary' | 'secondary' | 'nearest';
    maxPoolSize: number;
    minPoolSize: number;
    connectTimeoutMS: number;
    socketTimeoutMS: number;
  };
  monitoring?: {
    enabled: boolean;
    metricsInterval: number;
    alertThresholds: {
      connectionErrors: number;
      queryTimeMs: number;
      memoryUsageMB: number;
    };
  };
}
