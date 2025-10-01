/**
 * High-level helpers that connect the TypeScript SDK with the Python
 * PyBrain and PyHeart packages via the local bridge.
 */

import type {
  PyBrainEntitiesResponse,
  PyBrainPatientProfile,
  PyBrainRiskResponse,
  PyHeartWorkflowInput,
  PyHeartWorkflowResult,
  PythonBridgeOptions,
} from '@/types/python';
import { runPythonBridge } from '@/utils/pythonBridge';

export async function analyzeClinicalNote(
  note: string,
  options?: PythonBridgeOptions
): Promise<PyBrainEntitiesResponse> {
  return runPythonBridge<{ text: string }, PyBrainEntitiesResponse>(
    'pybrain',
    'extract_entities',
    { text: note },
    options
  );
}

export async function predictPatientRisk(
  patient: PyBrainPatientProfile,
  options?: PythonBridgeOptions
): Promise<PyBrainRiskResponse> {
  return runPythonBridge<{ patient: PyBrainPatientProfile }, PyBrainRiskResponse>(
    'pybrain',
    'predict_risk',
    { patient },
    options
  );
}

export async function runRiskWorkflow(
  input: PyHeartWorkflowInput,
  options?: PythonBridgeOptions
): Promise<PyHeartWorkflowResult> {
  return runPythonBridge<PyHeartWorkflowInput, PyHeartWorkflowResult>(
    'pyheart',
    'run_workflow',
    input,
    options
  );
}

export interface OrchestratedPythonCarePlan {
  entities: PyBrainEntitiesResponse;
  risk: PyBrainRiskResponse;
  workflow: PyHeartWorkflowResult;
}

export interface OrchestratedCarePlanInput {
  note: string;
  patient: PyBrainPatientProfile & { id?: string; name?: string };
  context?: PyHeartWorkflowInput['context'];
  careTeam?: string[];
}

/**
 * Convenience helper that runs entity extraction, risk scoring, and a
 * PyHeart workflow sequentially. This is useful for end-to-end demos
 * inside the SDK samples.
 */
export async function orchestratePythonCarePlan(
  input: OrchestratedCarePlanInput,
  options?: PythonBridgeOptions
): Promise<OrchestratedPythonCarePlan> {
  const entities = await analyzeClinicalNote(input.note, options);
  const risk = await predictPatientRisk(input.patient, options);

  const workflow = await runRiskWorkflow(
    {
      patient: {
        id: input.patient.id,
        name: input.patient.name,
        ...input.patient,
      },
      riskScore: risk.riskScore,
      careTeam: input.careTeam,
      context: input.context,
    },
    options
  );

  return {
    entities,
    risk,
    workflow,
  };
}
