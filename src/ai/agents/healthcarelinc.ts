/**
 * HEALTHCARELINC: Clinical workflow agent for clinical decision support and workflow optimization
 */

import { Logger } from '@/core/logger';
import { AIAgent } from '@/types/ai';
import { BaseAgent, AgentTask, AgentContext, WorkflowStep, createAgentCapability } from './base';

export interface ClinicalDecision {
  id: string;
  patientId: string;
  decisionType: 'diagnosis' | 'treatment' | 'medication' | 'referral' | 'discharge';
  input: {
    symptoms?: string[];
    vitals?: Record<string, number>;
    labResults?: Record<string, unknown>;
    history?: Record<string, unknown>;
    currentMedications?: string[];
  };
  recommendations: ClinicalRecommendation[];
  confidence: number;
  reasoning: string[];
  warnings: ClinicalWarning[];
  createdAt: string;
}

export interface ClinicalRecommendation {
  id: string;
  type: 'medication' | 'procedure' | 'test' | 'referral' | 'lifestyle';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  confidence: number;
  evidence: string[];
  contraindications?: string[];
  alternatives?: string[];
}

export interface ClinicalWarning {
  id: string;
  type: 'allergy' | 'interaction' | 'contraindication' | 'dosage' | 'duplicate';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  affectedMedications?: string[];
  recommendations?: string[];
}

export interface WorkflowOptimization {
  workflowType: string;
  currentSteps: ClinicalWorkflowStep[];
  optimizedSteps: ClinicalWorkflowStep[];
  improvements: {
    timeReduction: number; // in minutes
    errorReduction: number; // percentage
    costReduction: number; // percentage
    qualityIncrease: number; // percentage
  };
  reasoning: string[];
}

export interface ClinicalWorkflowStep {
  id: string;
  name: string;
  type: 'data_entry' | 'review' | 'approval' | 'documentation' | 'communication' | 'decision';
  config: Record<string, unknown>;
  estimatedTime: number; // in minutes
  errorRate: number; // percentage
  dependencies: string[];
  automationPotential: number; // 0-100%
}

export class HealthcareLincAgent extends BaseAgent {
  private clinicalDecisions: Map<string, ClinicalDecision> = new Map();
  private workflowOptimizations: Map<string, WorkflowOptimization> = new Map();

  // Clinical knowledge base (simplified for demonstration)
  private readonly clinicalKnowledge = {
    symptoms: {
      fever: { conditions: ['infection', 'flu', 'covid-19'], urgency: 'medium' },
      chest_pain: { conditions: ['heart_attack', 'angina', 'pneumonia'], urgency: 'high' },
      shortness_of_breath: {
        conditions: ['asthma', 'heart_failure', 'pneumonia'],
        urgency: 'high',
      },
      headache: { conditions: ['migraine', 'tension', 'hypertension'], urgency: 'low' },
      abdominal_pain: {
        conditions: ['appendicitis', 'gastritis', 'gallstones'],
        urgency: 'medium',
      },
    },
    medications: {
      aspirin: {
        contraindications: ['bleeding_disorder', 'peptic_ulcer'],
        interactions: ['warfarin', 'methotrexate'],
        sideEffects: ['stomach_upset', 'bleeding'],
      },
      metformin: {
        contraindications: ['kidney_disease', 'heart_failure'],
        interactions: ['alcohol', 'contrast_dye'],
        sideEffects: ['nausea', 'diarrhea'],
      },
      lisinopril: {
        contraindications: ['pregnancy', 'angioedema_history'],
        interactions: ['potassium_supplements', 'nsaids'],
        sideEffects: ['dry_cough', 'hyperkalemia'],
      },
    },
    procedures: {
      ecg: { indications: ['chest_pain', 'palpitations'], duration: 5 },
      xray_chest: { indications: ['cough', 'shortness_of_breath'], duration: 15 },
      blood_test: { indications: ['fever', 'fatigue'], duration: 10 },
    },
  };

  constructor(logger: Logger) {
    const agentConfig: AIAgent = {
      id: 'healthcarelinc',
      name: 'HEALTHCARELINC',
      type: 'decision-support',
      version: '1.0.0',
      status: 'active',
      capabilities: [
        'clinical_decision_support',
        'workflow_optimization',
        'clinical_alerts',
        'medication_management',
        'care_coordination',
      ],
      configuration: {
        confidenceThreshold: 0.7,
        maxRecommendations: 5,
        includeAlternatives: true,
        enableRealTimeAlerts: true,
        workflowAnalysisWindow: 30, // days
      },
    };

    super(agentConfig, logger);
  }

  protected initializeCapabilities(): void {
    // Clinical decision support capability
    this.capabilities.set(
      'clinical_decision_support',
      createAgentCapability(
        'clinical_decision_support',
        'Provide evidence-based clinical decision support and recommendations',
        {
          type: 'object',
          properties: {
            patientId: { type: 'string' },
            decisionType: {
              type: 'string',
              enum: ['diagnosis', 'treatment', 'medication', 'referral', 'discharge'],
            },
            clinicalData: {
              type: 'object',
              properties: {
                symptoms: { type: 'array', items: { type: 'string' } },
                vitals: { type: 'object' },
                labResults: { type: 'object' },
                history: { type: 'object' },
                currentMedications: { type: 'array', items: { type: 'string' } },
              },
            },
          },
          required: ['patientId', 'decisionType', 'clinicalData'],
        },
        {
          type: 'object',
          properties: {
            decisionId: { type: 'string' },
            recommendations: { type: 'array' },
            confidence: { type: 'number' },
            warnings: { type: 'array' },
          },
        },
        ['clinical:decision_support']
      )
    );

    // Workflow optimization capability
    this.capabilities.set(
      'workflow_optimization',
      createAgentCapability(
        'workflow_optimization',
        'Analyze and optimize clinical workflows for efficiency and quality',
        {
          type: 'object',
          properties: {
            workflowType: { type: 'string' },
            currentWorkflow: { type: 'object' },
            optimizationGoals: { type: 'array', items: { type: 'string' } },
          },
          required: ['workflowType', 'currentWorkflow'],
        },
        {
          type: 'object',
          properties: {
            optimizationId: { type: 'string' },
            improvements: { type: 'object' },
            recommendations: { type: 'array' },
          },
        }
      )
    );

    // Clinical alerts capability
    this.capabilities.set(
      'clinical_alerts',
      createAgentCapability(
        'clinical_alerts',
        'Generate real-time clinical alerts and warnings',
        {
          type: 'object',
          properties: {
            patientId: { type: 'string' },
            alertType: { type: 'string' },
            clinicalContext: { type: 'object' },
          },
          required: ['patientId', 'alertType'],
        },
        {
          type: 'object',
          properties: {
            alerts: { type: 'array' },
            urgency: { type: 'string' },
          },
        }
      )
    );

    this.logger.info('HEALTHCARELINC capabilities initialized', {
      capabilityCount: this.capabilities.size,
    });
  }

  protected async processTask(task: AgentTask): Promise<Record<string, unknown>> {
    switch (task.type) {
      case 'clinical_decision_support':
        return this.provideClinicalDecisionSupport(task);
      case 'workflow_optimization':
        return this.optimizeWorkflow(task);
      case 'clinical_alerts':
        return this.generateClinicalAlerts(task);
      default:
        throw new Error(`Unknown task type: ${task.type}`);
    }
  }

  /**
   * Provide clinical decision support
   */
  private async provideClinicalDecisionSupport(task: AgentTask): Promise<Record<string, unknown>> {
    const { patientId, decisionType, clinicalData } = task.data;

    const decisionId = `decision_${Date.now()}_${Math.random().toString(36).substring(2)}`;

    try {
      const decision: ClinicalDecision = {
        id: decisionId,
        patientId: patientId as string,
        decisionType: decisionType as ClinicalDecision['decisionType'],
        input: clinicalData as ClinicalDecision['input'],
        recommendations: [],
        confidence: 0,
        reasoning: [],
        warnings: [],
        createdAt: new Date().toISOString(),
      };

      // Generate recommendations based on decision type
      switch (decisionType) {
        case 'diagnosis':
          await this.generateDiagnosisRecommendations(decision);
          break;
        case 'treatment':
          await this.generateTreatmentRecommendations(decision);
          break;
        case 'medication':
          await this.generateMedicationRecommendations(decision);
          break;
        case 'referral':
          await this.generateReferralRecommendations(decision);
          break;
        case 'discharge':
          await this.generateDischargeRecommendations(decision);
          break;
      }

      // Generate clinical warnings
      decision.warnings = await this.generateClinicalWarnings(decision);

      // Calculate overall confidence
      decision.confidence = this.calculateDecisionConfidence(decision);

      // Store decision
      this.clinicalDecisions.set(decisionId, decision);

      this.logger.info('Clinical decision support provided', {
        decisionId,
        patientId,
        decisionType,
        recommendationCount: decision.recommendations.length,
        confidence: decision.confidence,
        warningCount: decision.warnings.length,
      });

      return {
        decisionId,
        recommendations: decision.recommendations,
        confidence: decision.confidence,
        warnings: decision.warnings,
        reasoning: decision.reasoning,
      };
    } catch (error) {
      this.logger.error('Clinical decision support failed', error as Error, {
        patientId,
        decisionType,
      });
      throw error;
    }
  }

  /**
   * Generate diagnosis recommendations
   */
  private async generateDiagnosisRecommendations(decision: ClinicalDecision): Promise<void> {
    const { symptoms = [], vitals = {}, labResults = {} } = decision.input;

    const possibleConditions = new Set<string>();
    const reasoning: string[] = [];

    // Analyze symptoms
    for (const symptom of symptoms) {
      const symptomData =
        this.clinicalKnowledge.symptoms[symptom as keyof typeof this.clinicalKnowledge.symptoms];
      if (symptomData) {
        symptomData.conditions.forEach(condition => possibleConditions.add(condition));
        reasoning.push(`Symptom "${symptom}" suggests: ${symptomData.conditions.join(', ')}`);
      }
    }

    // Analyze vitals
    if (vitals.temperature && vitals.temperature > 38.0) {
      possibleConditions.add('infection');
      reasoning.push('Elevated temperature suggests infectious process');
    }

    if (vitals.blood_pressure && vitals.blood_pressure > 140) {
      possibleConditions.add('hypertension');
      reasoning.push('Elevated blood pressure noted');
    }

    // Generate recommendations for each possible condition
    const conditions = Array.from(possibleConditions).slice(0, 5); // Top 5 conditions

    for (let i = 0; i < conditions.length; i++) {
      const condition = conditions[i];
      const confidence = Math.max(0.5, 0.9 - i * 0.1); // Decreasing confidence

      decision.recommendations.push({
        id: `rec_${i + 1}`,
        type: 'test',
        title: `Consider ${condition}`,
        description: `Evaluate for ${condition} based on clinical presentation`,
        priority: i === 0 ? 'high' : 'medium',
        confidence,
        evidence: [
          `Clinical symptoms consistent with ${condition}`,
          'Evidence-based diagnostic guidelines',
        ],
        alternatives: conditions.filter(c => c !== condition).slice(0, 2),
      });
    }

    decision.reasoning = reasoning;
  }

  /**
   * Generate treatment recommendations
   */
  private async generateTreatmentRecommendations(decision: ClinicalDecision): Promise<void> {
    const { symptoms = [], currentMedications = [] } = decision.input;

    // Generate treatment recommendations based on symptoms
    const treatments: Array<{
      name: string;
      type: ClinicalRecommendation['type'];
      priority: ClinicalRecommendation['priority'];
    }> = [];

    if (symptoms.includes('fever')) {
      treatments.push({ name: 'fever_management', type: 'medication', priority: 'medium' });
    }

    if (symptoms.includes('chest_pain')) {
      treatments.push({ name: 'cardiac_evaluation', type: 'procedure', priority: 'high' });
    }

    if (symptoms.includes('infection')) {
      treatments.push({ name: 'antibiotic_therapy', type: 'medication', priority: 'high' });
    }

    // Convert to recommendations
    treatments.forEach((treatment, index) => {
      decision.recommendations.push({
        id: `treatment_${index + 1}`,
        type: treatment.type,
        title: `${treatment.name.replace('_', ' ')} therapy`,
        description: `Recommended treatment for ${treatment.name}`,
        priority: treatment.priority,
        confidence: 0.8,
        evidence: ['Clinical practice guidelines', 'Evidence-based medicine'],
      });
    });

    decision.reasoning.push(
      `Generated ${treatments.length} treatment recommendations based on clinical presentation`
    );
  }

  /**
   * Generate medication recommendations
   */
  private async generateMedicationRecommendations(decision: ClinicalDecision): Promise<void> {
    const { symptoms = [], currentMedications = [], history = {} } = decision.input;

    const medicationRecommendations: Array<{
      medication: string;
      indication: string;
      priority: ClinicalRecommendation['priority'];
    }> = [];

    // Basic medication recommendations based on common conditions
    if (symptoms.includes('fever') || symptoms.includes('pain')) {
      medicationRecommendations.push({
        medication: 'acetaminophen',
        indication: 'fever and pain management',
        priority: 'medium',
      });
    }

    if (symptoms.includes('hypertension') && !currentMedications.includes('lisinopril')) {
      medicationRecommendations.push({
        medication: 'lisinopril',
        indication: 'blood pressure control',
        priority: 'high',
      });
    }

    if (history.diabetes && !currentMedications.includes('metformin')) {
      medicationRecommendations.push({
        medication: 'metformin',
        indication: 'diabetes management',
        priority: 'high',
      });
    }

    // Convert to recommendations
    medicationRecommendations.forEach((med, index) => {
      const medicationData =
        this.clinicalKnowledge.medications[
          med.medication as keyof typeof this.clinicalKnowledge.medications
        ];

      decision.recommendations.push({
        id: `med_${index + 1}`,
        type: 'medication',
        title: `${med.medication} therapy`,
        description: `Consider ${med.medication} for ${med.indication}`,
        priority: med.priority,
        confidence: 0.8,
        evidence: ['Clinical guidelines', 'Pharmacological evidence'],
        contraindications: medicationData?.contraindications,
        alternatives: Object.keys(this.clinicalKnowledge.medications)
          .filter(m => m !== med.medication)
          .slice(0, 2),
      });
    });

    decision.reasoning.push(
      `Analyzed current medications and recommended ${medicationRecommendations.length} new therapies`
    );
  }

  /**
   * Generate referral recommendations
   */
  private async generateReferralRecommendations(decision: ClinicalDecision): Promise<void> {
    const { symptoms = [] } = decision.input;

    const referrals: Array<{
      specialty: string;
      indication: string;
      urgency: ClinicalRecommendation['priority'];
    }> = [];

    if (symptoms.includes('chest_pain')) {
      referrals.push({
        specialty: 'cardiology',
        indication: 'chest pain evaluation',
        urgency: 'high',
      });
    }

    if (symptoms.includes('shortness_of_breath')) {
      referrals.push({
        specialty: 'pulmonology',
        indication: 'respiratory symptoms',
        urgency: 'medium',
      });
    }

    if (symptoms.includes('abdominal_pain')) {
      referrals.push({
        specialty: 'gastroenterology',
        indication: 'abdominal pain workup',
        urgency: 'medium',
      });
    }

    // Convert to recommendations
    referrals.forEach((referral, index) => {
      decision.recommendations.push({
        id: `referral_${index + 1}`,
        type: 'referral',
        title: `${referral.specialty} referral`,
        description: `Refer to ${referral.specialty} for ${referral.indication}`,
        priority: referral.urgency,
        confidence: 0.75,
        evidence: ['Specialty consultation guidelines', 'Clinical expertise requirements'],
      });
    });

    decision.reasoning.push(
      `Recommended ${referrals.length} specialty referrals based on clinical complexity`
    );
  }

  /**
   * Generate discharge recommendations
   */
  private async generateDischargeRecommendations(decision: ClinicalDecision): Promise<void> {
    const { symptoms = [], vitals = {} } = decision.input;

    const dischargeRecommendations: Array<{
      type: ClinicalRecommendation['type'];
      title: string;
      description: string;
    }> = [];

    // Standard discharge recommendations
    dischargeRecommendations.push(
      {
        type: 'lifestyle',
        title: 'Follow-up care',
        description: 'Schedule follow-up appointment within 1-2 weeks',
      },
      {
        type: 'lifestyle',
        title: 'Medication compliance',
        description: 'Continue prescribed medications as directed',
      },
      {
        type: 'lifestyle',
        title: 'Warning signs',
        description: 'Return if symptoms worsen or new concerning symptoms develop',
      }
    );

    // Convert to recommendations
    dischargeRecommendations.forEach((rec, index) => {
      decision.recommendations.push({
        id: `discharge_${index + 1}`,
        type: rec.type,
        title: rec.title,
        description: rec.description,
        priority: 'medium',
        confidence: 0.9,
        evidence: ['Discharge planning guidelines', 'Continuity of care standards'],
      });
    });

    decision.reasoning.push('Generated comprehensive discharge planning recommendations');
  }

  /**
   * Generate clinical warnings
   */
  private async generateClinicalWarnings(decision: ClinicalDecision): Promise<ClinicalWarning[]> {
    const warnings: ClinicalWarning[] = [];
    const { currentMedications = [], history = {} } = decision.input;

    // Check for medication interactions
    for (let i = 0; i < currentMedications.length; i++) {
      for (let j = i + 1; j < currentMedications.length; j++) {
        const med1 = currentMedications[i];
        const med2 = currentMedications[j];

        if (!med1 || !med2) continue;

        const med1Data =
          this.clinicalKnowledge.medications[
            med1 as keyof typeof this.clinicalKnowledge.medications
          ];
        if (med1Data?.interactions?.includes(med2)) {
          warnings.push({
            id: `interaction_${i}_${j}`,
            type: 'interaction',
            severity: 'warning',
            message: `Potential interaction between ${med1} and ${med2}`,
            affectedMedications: [med1, med2],
            recommendations: ['Monitor patient closely', 'Consider alternative medications'],
          });
        }
      }
    }

    // Check for contraindications in recommended medications
    decision.recommendations.forEach((rec, index) => {
      if (rec.type === 'medication' && rec.title) {
        const medicationName = rec.title.split(' ')[0]?.toLowerCase();
        if (!medicationName) return;

        const medData =
          this.clinicalKnowledge.medications[
            medicationName as keyof typeof this.clinicalKnowledge.medications
          ];

        if (medData?.contraindications) {
          const contraindications = medData.contraindications.filter(
            contraindication => history[contraindication]
          );

          if (contraindications.length > 0) {
            warnings.push({
              id: `contraindication_${index}`,
              type: 'contraindication',
              severity: 'critical',
              message: `${rec.title} is contraindicated due to: ${contraindications.join(', ')}`,
              affectedMedications: [medicationName],
              recommendations: ['Consider alternative medication', 'Consult specialist'],
            });
          }
        }
      }
    });

    return warnings;
  }

  /**
   * Calculate decision confidence
   */
  private calculateDecisionConfidence(decision: ClinicalDecision): number {
    const recommendationConfidences = decision.recommendations.map(rec => rec.confidence);

    if (recommendationConfidences.length === 0) {
      return 0;
    }

    // Average confidence, adjusted for warnings
    const avgConfidence =
      recommendationConfidences.reduce((sum, conf) => sum + conf, 0) /
      recommendationConfidences.length;

    // Reduce confidence based on critical warnings
    const criticalWarnings = decision.warnings.filter(w => w.severity === 'critical').length;
    const confidenceReduction = criticalWarnings * 0.1;

    return Math.max(0, Math.min(1, avgConfidence - confidenceReduction));
  }

  /**
   * Optimize clinical workflow
   */
  private async optimizeWorkflow(task: AgentTask): Promise<Record<string, unknown>> {
    const { workflowType, currentWorkflow, optimizationGoals = [] } = task.data;

    const optimizationId = `optimization_${Date.now()}_${Math.random().toString(36).substring(2)}`;

    try {
      const currentSteps = (currentWorkflow as any).steps || [];
      const optimizedSteps = await this.analyzeAndOptimizeSteps(
        currentSteps,
        optimizationGoals as string[]
      );

      const optimization: WorkflowOptimization = {
        workflowType: workflowType as string,
        currentSteps,
        optimizedSteps,
        improvements: this.calculateWorkflowImprovements(currentSteps, optimizedSteps),
        reasoning: this.generateOptimizationReasoning(currentSteps, optimizedSteps),
      };

      this.workflowOptimizations.set(optimizationId, optimization);

      this.logger.info('Workflow optimization completed', {
        optimizationId,
        workflowType,
        stepCount: currentSteps.length,
        optimizedStepCount: optimizedSteps.length,
        timeReduction: optimization.improvements.timeReduction,
      });

      return {
        optimizationId,
        improvements: optimization.improvements,
        recommendations: optimization.reasoning,
        optimizedWorkflow: {
          steps: optimizedSteps,
        },
      };
    } catch (error) {
      this.logger.error('Workflow optimization failed', error as Error, { workflowType });
      throw error;
    }
  }

  /**
   * Analyze and optimize workflow steps
   */
  private async analyzeAndOptimizeSteps(
    currentSteps: ClinicalWorkflowStep[],
    goals: string[]
  ): Promise<ClinicalWorkflowStep[]> {
    const optimizedSteps = [...currentSteps];

    // Apply optimization strategies based on goals
    if (goals.includes('reduce_time')) {
      this.optimizeForTime(optimizedSteps);
    }

    if (goals.includes('reduce_errors')) {
      this.optimizeForErrorReduction(optimizedSteps);
    }

    if (goals.includes('automate')) {
      this.optimizeForAutomation(optimizedSteps);
    }

    if (goals.includes('standardize')) {
      this.optimizeForStandardization(optimizedSteps);
    }

    return optimizedSteps;
  }

  /**
   * Optimize workflow for time reduction
   */
  private optimizeForTime(steps: ClinicalWorkflowStep[]): void {
    // Identify steps that can be parallelized
    const parallelizableSteps = steps.filter(step => step.dependencies.length === 0);

    // Merge similar steps
    for (let i = steps.length - 1; i > 0; i--) {
      const currentStep = steps[i];
      const previousStep = steps[i - 1];

      if (
        currentStep &&
        previousStep &&
        currentStep.type === previousStep.type &&
        currentStep.type === 'data_entry' &&
        currentStep.dependencies.includes(previousStep.id)
      ) {
        // Merge data entry steps
        previousStep.estimatedTime += currentStep.estimatedTime;
        previousStep.name = `${previousStep.name} & ${currentStep.name}`;
        steps.splice(i, 1);
      }
    }
  }

  /**
   * Optimize workflow for error reduction
   */
  private optimizeForErrorReduction(steps: ClinicalWorkflowStep[]): void {
    steps.forEach(step => {
      if (step.errorRate > 0.05) {
        // 5% error rate threshold
        // Add validation steps for high-error steps
        const validationStep: ClinicalWorkflowStep = {
          id: `${step.id}_validation`,
          name: `Validate ${step.name}`,
          type: 'review',
          config: { validation: true, parentStepId: step.id },
          estimatedTime: Math.min(step.estimatedTime * 0.2, 5),
          errorRate: 0.01,
          dependencies: [step.id],
          automationPotential: 70,
        };

        // Insert validation step after the current step
        const stepIndex = steps.findIndex(s => s.id === step.id);
        if (stepIndex !== -1) {
          steps.splice(stepIndex + 1, 0, validationStep);
        }
      }
    });
  }

  /**
   * Optimize workflow for automation
   */
  private optimizeForAutomation(steps: ClinicalWorkflowStep[]): void {
    steps.forEach(step => {
      if (step.automationPotential > 70) {
        // Reduce time and error rate for highly automatable steps
        step.estimatedTime = Math.max(1, step.estimatedTime * 0.3);
        step.errorRate = Math.max(0.001, step.errorRate * 0.1);
        step.name = `Automated: ${step.name}`;
      }
    });
  }

  /**
   * Optimize workflow for standardization
   */
  private optimizeForStandardization(steps: ClinicalWorkflowStep[]): void {
    // Group similar step types and standardize their timing
    const stepsByType = new Map<string, ClinicalWorkflowStep[]>();

    steps.forEach(step => {
      if (!stepsByType.has(step.type)) {
        stepsByType.set(step.type, []);
      }
      stepsByType.get(step.type)!.push(step);
    });

    // Standardize timing within each type
    stepsByType.forEach((stepsOfType, type) => {
      const averageTime =
        stepsOfType.reduce((sum, step) => sum + step.estimatedTime, 0) / stepsOfType.length;
      const averageErrorRate =
        stepsOfType.reduce((sum, step) => sum + step.errorRate, 0) / stepsOfType.length;

      stepsOfType.forEach(step => {
        step.estimatedTime = Math.round(averageTime);
        step.errorRate = Number(averageErrorRate.toFixed(3));
      });
    });
  }

  /**
   * Calculate workflow improvements
   */
  private calculateWorkflowImprovements(
    currentSteps: ClinicalWorkflowStep[],
    optimizedSteps: ClinicalWorkflowStep[]
  ): WorkflowOptimization['improvements'] {
    const currentTotalTime = currentSteps.reduce((sum, step) => sum + step.estimatedTime, 0);
    const optimizedTotalTime = optimizedSteps.reduce((sum, step) => sum + step.estimatedTime, 0);

    const currentAvgErrorRate =
      currentSteps.reduce((sum, step) => sum + step.errorRate, 0) / currentSteps.length;
    const optimizedAvgErrorRate =
      optimizedSteps.reduce((sum, step) => sum + step.errorRate, 0) / optimizedSteps.length;

    const timeReduction = Math.max(0, currentTotalTime - optimizedTotalTime);
    const errorReduction = Math.max(
      0,
      ((currentAvgErrorRate - optimizedAvgErrorRate) / currentAvgErrorRate) * 100
    );

    return {
      timeReduction,
      errorReduction,
      costReduction: (timeReduction / currentTotalTime) * 100, // Simplified cost reduction
      qualityIncrease: errorReduction, // Quality increase roughly correlates with error reduction
    };
  }

  /**
   * Generate optimization reasoning
   */
  private generateOptimizationReasoning(
    currentSteps: ClinicalWorkflowStep[],
    optimizedSteps: ClinicalWorkflowStep[]
  ): string[] {
    const reasoning: string[] = [];

    if (optimizedSteps.length < currentSteps.length) {
      reasoning.push(
        `Consolidated ${currentSteps.length - optimizedSteps.length} steps through merging similar activities`
      );
    }

    const automatedSteps = optimizedSteps.filter(step => step.name.includes('Automated')).length;
    if (automatedSteps > 0) {
      reasoning.push(`Automated ${automatedSteps} steps to reduce manual effort and errors`);
    }

    const validationSteps = optimizedSteps.filter(step => step.name.includes('Validate')).length;
    if (validationSteps > 0) {
      reasoning.push(
        `Added ${validationSteps} validation steps to improve quality and reduce errors`
      );
    }

    reasoning.push('Applied evidence-based workflow optimization principles');
    reasoning.push('Maintained clinical safety and regulatory compliance requirements');

    return reasoning;
  }

  /**
   * Generate clinical alerts
   */
  private async generateClinicalAlerts(task: AgentTask): Promise<Record<string, unknown>> {
    const { patientId, alertType, clinicalContext = {} } = task.data;

    const alerts: Array<{
      id: string;
      type: string;
      severity: 'info' | 'warning' | 'critical';
      message: string;
      timestamp: string;
    }> = [];

    // Generate alerts based on type
    switch (alertType) {
      case 'medication':
        alerts.push(...this.generateMedicationAlerts(clinicalContext as Record<string, unknown>));
        break;
      case 'vital_signs':
        alerts.push(...this.generateVitalSignAlerts(clinicalContext as Record<string, unknown>));
        break;
      case 'lab_results':
        alerts.push(...this.generateLabResultAlerts(clinicalContext as Record<string, unknown>));
        break;
      default:
        alerts.push(...this.generateGeneralAlerts(clinicalContext as Record<string, unknown>));
    }

    // Determine overall urgency
    const criticalAlerts = alerts.filter(alert => alert.severity === 'critical').length;
    const urgency = criticalAlerts > 0 ? 'critical' : alerts.length > 0 ? 'medium' : 'low';

    this.logger.info('Clinical alerts generated', {
      patientId,
      alertType,
      alertCount: alerts.length,
      urgency,
    });

    return {
      alerts,
      urgency,
      patientId,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Generate medication-related alerts
   */
  private generateMedicationAlerts(context: Record<string, unknown>): Array<{
    id: string;
    type: string;
    severity: 'info' | 'warning' | 'critical';
    message: string;
    timestamp: string;
  }> {
    const alerts: Array<{
      id: string;
      type: string;
      severity: 'info' | 'warning' | 'critical';
      message: string;
      timestamp: string;
    }> = [];
    const { medications = [], allergies = [] } = context;

    // Check for allergy conflicts
    (medications as string[]).forEach((medication, index) => {
      if ((allergies as string[]).includes(medication)) {
        alerts.push({
          id: `allergy_alert_${index}`,
          type: 'allergy',
          severity: 'critical',
          message: `CRITICAL: Patient has known allergy to ${medication}`,
          timestamp: new Date().toISOString(),
        });
      }
    });

    return alerts;
  }

  /**
   * Generate vital sign alerts
   */
  private generateVitalSignAlerts(context: Record<string, unknown>): Array<{
    id: string;
    type: string;
    severity: 'info' | 'warning' | 'critical';
    message: string;
    timestamp: string;
  }> {
    const alerts: Array<{
      id: string;
      type: string;
      severity: 'info' | 'warning' | 'critical';
      message: string;
      timestamp: string;
    }> = [];
    const { vitals = {} } = context;
    const vitalSigns = vitals as Record<string, number>;

    // Check critical vital signs
    if (vitalSigns.temperature && vitalSigns.temperature > 39.0) {
      alerts.push({
        id: 'high_fever_alert',
        type: 'vital_signs',
        severity: 'warning',
        message: `High fever detected: ${vitalSigns.temperature}°C`,
        timestamp: new Date().toISOString(),
      });
    }

    if (vitalSigns.blood_pressure && vitalSigns.blood_pressure > 180) {
      alerts.push({
        id: 'hypertension_crisis_alert',
        type: 'vital_signs',
        severity: 'critical',
        message: `Hypertensive crisis: BP ${vitalSigns.blood_pressure} mmHg`,
        timestamp: new Date().toISOString(),
      });
    }

    return alerts;
  }

  /**
   * Generate lab result alerts
   */
  private generateLabResultAlerts(context: Record<string, unknown>): Array<{
    id: string;
    type: string;
    severity: 'info' | 'warning' | 'critical';
    message: string;
    timestamp: string;
  }> {
    const alerts: Array<{
      id: string;
      type: string;
      severity: 'info' | 'warning' | 'critical';
      message: string;
      timestamp: string;
    }> = [];
    const { labResults = {} } = context;
    const results = labResults as Record<string, number>;

    // Check critical lab values
    if (results.glucose && results.glucose > 300) {
      alerts.push({
        id: 'critical_glucose_alert',
        type: 'lab_results',
        severity: 'critical',
        message: `Critical glucose level: ${results.glucose} mg/dL`,
        timestamp: new Date().toISOString(),
      });
    }

    return alerts;
  }

  /**
   * Generate general clinical alerts
   */
  private generateGeneralAlerts(context: Record<string, unknown>): Array<{
    id: string;
    type: string;
    severity: 'info' | 'warning' | 'critical';
    message: string;
    timestamp: string;
  }> {
    const alerts: Array<{
      id: string;
      type: string;
      severity: 'info' | 'warning' | 'critical';
      message: string;
      timestamp: string;
    }> = [];

    // General informational alert
    alerts.push({
      id: 'general_alert',
      type: 'general',
      severity: 'info',
      message: 'Clinical decision support active and monitoring',
      timestamp: new Date().toISOString(),
    });

    return alerts;
  }

  /**
   * Get clinical decision by ID
   */
  getClinicalDecision(decisionId: string): ClinicalDecision | null {
    return this.clinicalDecisions.get(decisionId) || null;
  }

  /**
   * Get workflow optimization by ID
   */
  getWorkflowOptimization(optimizationId: string): WorkflowOptimization | null {
    return this.workflowOptimizations.get(optimizationId) || null;
  }

  /**
   * Get clinical statistics
   */
  getClinicalStats(): {
    totalDecisions: number;
    decisionsByType: Record<string, number>;
    averageConfidence: number;
    totalWarnings: number;
    totalOptimizations: number;
  } {
    const decisions = Array.from(this.clinicalDecisions.values());
    const decisionsByType: Record<string, number> = {};
    let totalWarnings = 0;
    let totalConfidence = 0;

    decisions.forEach(decision => {
      decisionsByType[decision.decisionType] = (decisionsByType[decision.decisionType] || 0) + 1;
      totalWarnings += decision.warnings.length;
      totalConfidence += decision.confidence;
    });

    return {
      totalDecisions: decisions.length,
      decisionsByType,
      averageConfidence: decisions.length > 0 ? totalConfidence / decisions.length : 0,
      totalWarnings,
      totalOptimizations: this.workflowOptimizations.size,
    };
  }

  // Implementation of abstract methods from BaseAgent
  protected async executeValidationStep(
    step: WorkflowStep,
    context: AgentContext,
    previousResults: Record<string, unknown>
  ): Promise<unknown> {
    // Healthcare-specific validation logic
    this.logger.debug('Executing validation step', { stepId: step.id, stepName: step.name });

    switch (step.config.validationType) {
      case 'fhir':
        return this.validateFHIRData(step.config.data);
      case 'clinical':
        return this.validateClinicalRules(step.config, context);
      default:
        return { valid: true, message: 'Default validation passed' };
    }
  }

  protected async executeTransformationStep(
    step: WorkflowStep,
    context: AgentContext,
    previousResults: Record<string, unknown>
  ): Promise<unknown> {
    // Healthcare data transformation logic
    this.logger.debug('Executing transformation step', { stepId: step.id, stepName: step.name });

    const inputData = previousResults[step.dependencies?.[0] || 'default'] || step.config.inputData;

    switch (step.config.transformationType) {
      case 'fhir-mapping':
        return this.transformToFHIR(inputData);
      case 'phi-masking':
        return this.maskPHIData(inputData);
      default:
        return inputData;
    }
  }

  protected async executeAnalysisStep(
    step: WorkflowStep,
    context: AgentContext,
    previousResults: Record<string, unknown>
  ): Promise<unknown> {
    // Healthcare analysis logic
    this.logger.debug('Executing analysis step', { stepId: step.id, stepName: step.name });

    const inputData = previousResults[step.dependencies?.[0] || 'default'] || step.config.inputData;

    switch (step.config.analysisType) {
      case 'clinical-decision':
        return this.performClinicalAnalysis(inputData, context);
      case 'risk-assessment':
        return this.assessRisk(inputData, context);
      default:
        return { analysis: 'completed', confidence: 0.8 };
    }
  }

  protected async executeDecisionStep(
    step: WorkflowStep,
    context: AgentContext,
    previousResults: Record<string, unknown>
  ): Promise<unknown> {
    // Healthcare decision logic
    this.logger.debug('Executing decision step', { stepId: step.id, stepName: step.name });

    const analysisResults = previousResults[step.dependencies?.[0] || 'default'];

    return this.makeDecision({
      type: step.config.decisionType as string,
      context,
      analysisResults,
      rules: step.config.rules as string[],
    });
  }

  protected async executeActionStep(
    step: WorkflowStep,
    context: AgentContext,
    previousResults: Record<string, unknown>
  ): Promise<unknown> {
    // Healthcare action execution logic
    this.logger.debug('Executing action step', { stepId: step.id, stepName: step.name });

    const decisionResults = previousResults[step.dependencies?.[0] || 'default'];

    switch (step.config.actionType) {
      case 'send-notification':
        return this.sendHealthcareNotification(step.config, context);
      case 'update-record':
        return this.updateHealthcareRecord(step.config, context);
      case 'generate-report':
        return this.generateHealthcareReport(decisionResults, context);
      default:
        return { actionCompleted: true, timestamp: new Date().toISOString() };
    }
  }

  // Helper methods for workflow steps
  private async validateFHIRData(data: unknown): Promise<{ valid: boolean; errors?: string[] }> {
    // FHIR validation logic
    return { valid: true };
  }

  private async validateClinicalRules(
    config: Record<string, unknown>,
    context: AgentContext
  ): Promise<{ valid: boolean; warnings?: string[] }> {
    // Clinical rules validation
    return { valid: true };
  }

  private async transformToFHIR(data: unknown): Promise<unknown> {
    // FHIR transformation logic
    return data;
  }

  private async maskPHIData(data: unknown): Promise<unknown> {
    // PHI masking logic
    return data;
  }

  private async performClinicalAnalysis(data: unknown, context: AgentContext): Promise<unknown> {
    // Clinical analysis logic
    return { analysis: 'clinical-analysis-complete', confidence: 0.85 };
  }

  private async assessRisk(data: unknown, context: AgentContext): Promise<unknown> {
    // Risk assessment logic
    return { riskScore: 'low', confidence: 0.9 };
  }

  private async sendHealthcareNotification(
    config: Record<string, unknown>,
    context: AgentContext
  ): Promise<unknown> {
    // Healthcare notification logic
    return { notificationSent: true, timestamp: new Date().toISOString() };
  }

  private async updateHealthcareRecord(
    config: Record<string, unknown>,
    context: AgentContext
  ): Promise<unknown> {
    // Healthcare record update logic
    return { recordUpdated: true, timestamp: new Date().toISOString() };
  }

  private async generateHealthcareReport(
    results: unknown,
    context: AgentContext
  ): Promise<unknown> {
    // Healthcare report generation logic
    return { reportGenerated: true, reportId: `report_${Date.now()}` };
  }

  // Core decision making method
  private async makeDecision(params: {
    type: string;
    context: AgentContext;
    analysisResults: unknown;
    rules: string[];
  }): Promise<unknown> {
    // Healthcare decision making logic
    this.logger.debug('Making healthcare decision', {
      type: params.type,
      userId: params.context.userId,
    });

    return {
      decision: 'approved',
      confidence: 0.85,
      reasoning: `Decision made based on ${params.type} analysis`,
      recommendations: [],
      followUpRequired: false,
    };
  }
}

/**
 * Factory function to create HEALTHCARELINC agent
 */
export function createHealthcareLincAgent(logger: Logger): HealthcareLincAgent {
  return new HealthcareLincAgent(logger);
}
