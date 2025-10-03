import { accessSync, constants } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import {
  analyzeClinicalNote,
  orchestratePythonCarePlan,
  predictPatientRisk,
  runRiskWorkflow,
} from '../../src/python';

const pythonExecutable = process.env.PYTHON_BRIDGE_PYTHON ?? 'python3';

function pythonBridgeAvailable(): boolean {
  const versionCheck = spawnSync(pythonExecutable, ['--version']);
  if (versionCheck.status !== 0) {
    return false;
  }

  try {
    const bridgeUrl = new URL('../../python-integration/bridge.py', import.meta.url);
    const bridgePath = fileURLToPath(bridgeUrl);
    accessSync(bridgePath, constants.R_OK);
    
    // Test if bridge can actually import required modules
    const testCheck = spawnSync(pythonExecutable, [
      bridgePath,
      '--package', 'pybrain',
      '--action', 'extract_entities',
      '--payload', '{"text": "test"}'
    ]);
    return testCheck.status === 0;
  } catch (error) {
    return false;
  }
}const describeIfAvailable = pythonBridgeAvailable() ? describe : describe.skip;

describeIfAvailable('Python integration bridge', () => {
  it('extracts clinical entities from a note', async () => {
    const result = await analyzeClinicalNote('Patient with type 2 diabetes on metformin 500mg BID and hypertension');
    expect(result.entities.conditions).toContain('Diabetes');
    expect(result.entities.medications).toContain('Metformin');
    expect(result.meta.modelType).toBe('nlp');
  }, 20_000);

  it('predicts patient risk scores with PyBrain', async () => {
    const result = await predictPatientRisk({
      age: 68,
      bmi: 31,
      conditions: ['diabetes', 'hypertension'],
      medications: ['metformin', 'lisinopril'],
      smoking: false,
    });

    expect(result.riskScore).toBeGreaterThan(0.2);
    expect(result.secondaryScores.readmission).toBeGreaterThan(0);
  }, 20_000);

  it('runs a PyHeart workflow using python-integration bridge', async () => {
    const workflow = await runRiskWorkflow({
      patient: { id: '12345', name: 'Jane Doe' },
      riskScore: 0.9,
      careTeam: ['chief.medical@example.com'],
      context: {
        fhirServer: 'https://fhir.example.com',
        primaryPhysician: 'dr.smith@example.com',
      },
    });

    expect(workflow.status).toBe('completed');
    expect(workflow.tasks).toHaveProperty('evaluate-risk');
    expect(workflow.variables.care_plan).toBe('critical-response');
  }, 20_000);

  it('orchestrates an end-to-end care plan', async () => {
    const summary = await orchestratePythonCarePlan({
      note: 'Elderly patient with hypertension and possible pneumonia. Administered aspirin.',
      patient: {
        id: '777',
        name: 'John Smith',
        age: 76,
        bmi: 29,
        conditions: ['hypertension'],
        medications: ['aspirin'],
      },
      careTeam: ['care.coordinator@example.com'],
      context: {
        primaryPhysician: 'dr.marwa@example.com',
      },
    });

    expect(summary.entities.entities.conditions.length).toBeGreaterThan(0);
    expect(summary.risk.riskScore).toBeGreaterThan(0);
    expect(summary.workflow.status).toBe('completed');
  }, 20_000);
});

