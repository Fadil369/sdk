/**
 * Type contracts for the Python bridge that exposes PyBrain/PyHeart
 * functionality to the TypeScript SDK.
 */

export interface PythonBridgeOptions {
  pythonPath?: string;
  timeoutMs?: number;
  env?: NodeJS.ProcessEnv;
}

export interface PyBrainPatientProfile {
  age?: number;
  bmi?: number;
  conditions?: string[];
  medications?: string[];
  smoking?: boolean;
  [key: string]: unknown;
}

export interface PyBrainEntitiesResponse {
  entities: Record<string, string[]>;
  meta: {
    model: string;
    modelType: string;
  };
}

export interface PyBrainRiskResponse {
  riskScore: number;
  secondaryScores: {
    readmission: number;
    fall: number;
  };
}

export interface PyHeartWorkflowInput {
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

export interface PyHeartTaskResult {
  status: string;
  output?: unknown;
  error?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
}

export interface PyHeartWorkflowResult {
  instanceId: string;
  status: string;
  variables: Record<string, unknown>;
  tasks: Record<string, PyHeartTaskResult>;
  riskScore: number;
}
