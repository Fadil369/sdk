'use strict';

/**
 * FHIR Workflow Engine
 * Manages patient journeys, care plans, and clinical workflows
 */

class FHIRWorkflowEngine {
  constructor() {
    this.workflows = new Map();
    this.carePlans = new Map();
    this.tasks = new Map();
    this.templates = this.initializeTemplates();
  }

  /**
   * Initialize workflow templates
   */
  initializeTemplates() {
    return {
      admissionWorkflow: {
        id: 'wf_admission',
        name: 'Patient Admission Workflow',
        steps: [
          { id: 1, name: 'Registration', resource: 'Patient', status: 'pending' },
          { id: 2, name: 'Insurance Verification', resource: 'Coverage', status: 'pending' },
          { id: 3, name: 'Admission Orders', resource: 'ServiceRequest', status: 'pending' },
          { id: 4, name: 'Bed Assignment', resource: 'Location', status: 'pending' },
          { id: 5, name: 'Initial Assessment', resource: 'Observation', status: 'pending' },
        ],
      },
      dischargeWorkflow: {
        id: 'wf_discharge',
        name: 'Patient Discharge Workflow',
        steps: [
          { id: 1, name: 'Discharge Order', resource: 'ServiceRequest', status: 'pending' },
          { id: 2, name: 'Discharge Summary', resource: 'DocumentReference', status: 'pending' },
          { id: 3, name: 'Prescriptions', resource: 'MedicationRequest', status: 'pending' },
          { id: 4, name: 'Follow-up Appointment', resource: 'Appointment', status: 'pending' },
          { id: 5, name: 'Patient Education', resource: 'Communication', status: 'pending' },
        ],
      },
      medicationWorkflow: {
        id: 'wf_medication',
        name: 'Medication Management Workflow',
        steps: [
          { id: 1, name: 'Prescribe', resource: 'MedicationRequest', status: 'pending' },
          { id: 2, name: 'Pharmacy Review', resource: 'Task', status: 'pending' },
          { id: 3, name: 'Dispense', resource: 'MedicationDispense', status: 'pending' },
          { id: 4, name: 'Administer', resource: 'MedicationAdministration', status: 'pending' },
          { id: 5, name: 'Document', resource: 'MedicationStatement', status: 'pending' },
        ],
      },
      labWorkflow: {
        id: 'wf_lab',
        name: 'Laboratory Test Workflow',
        steps: [
          { id: 1, name: 'Order', resource: 'ServiceRequest', status: 'pending' },
          { id: 2, name: 'Specimen Collection', resource: 'Specimen', status: 'pending' },
          { id: 3, name: 'Processing', resource: 'Task', status: 'pending' },
          { id: 4, name: 'Results', resource: 'DiagnosticReport', status: 'pending' },
          { id: 5, name: 'Review & Sign', resource: 'Observation', status: 'pending' },
        ],
      },
    };
  }

  /**
   * Start a new workflow
   */
  async startWorkflow(templateId, patientId, context = {}) {
    const template = this.templates[templateId];
    if (!template) {
      throw new Error(`Workflow template not found: ${templateId}`);
    }

    const workflow = {
      id: `workflow_${Date.now()}`,
      templateId,
      patientId,
      name: template.name,
      status: 'in-progress',
      steps: template.steps.map(step => ({ ...step })),
      currentStep: 1,
      startedAt: new Date().toISOString(),
      context,
      createdBy: context.userId || 'system',
    };

    this.workflows.set(workflow.id, workflow);

    return workflow;
  }

  /**
   * Complete workflow step
   */
  async completeStep(workflowId, stepId, data = {}) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error('Workflow not found');
    }

    const step = workflow.steps.find(s => s.id === stepId);
    if (!step) {
      throw new Error('Step not found');
    }

    step.status = 'completed';
    step.completedAt = new Date().toISOString();
    step.data = data;

    // Move to next step
    if (stepId === workflow.currentStep && stepId < workflow.steps.length) {
      workflow.currentStep = stepId + 1;
    }

    // Check if workflow is complete
    const allCompleted = workflow.steps.every(s => s.status === 'completed');
    if (allCompleted) {
      workflow.status = 'completed';
      workflow.completedAt = new Date().toISOString();
    }

    return workflow;
  }

  /**
   * Create a care plan
   */
  async createCarePlan(patientId, condition, goals = []) {
    const carePlan = {
      resourceType: 'CarePlan',
      id: `careplan_${Date.now()}`,
      status: 'active',
      intent: 'plan',
      subject: {
        reference: `Patient/${patientId}`,
      },
      created: new Date().toISOString(),
      period: {
        start: new Date().toISOString(),
        end: this.addMonths(new Date(), 3).toISOString(),
      },
      category: [
        {
          coding: [
            {
              system: 'http://hl7.org/fhir/us/core/CodeSystem/careplan-category',
              code: 'assess-plan',
              display: 'Assessment and Plan of Treatment',
            },
          ],
        },
      ],
      title: `Care Plan for ${condition}`,
      description: `Comprehensive care plan for managing ${condition}`,
      goal: goals.map((goal, idx) => ({
        id: `goal_${idx}`,
        description: { text: goal.description },
        target: goal.target ? [goal.target] : [],
      })),
      activity: [],
    };

    this.carePlans.set(carePlan.id, carePlan);

    return carePlan;
  }

  /**
   * Add activity to care plan
   */
  async addCarePlanActivity(carePlanId, activity) {
    const carePlan = this.carePlans.get(carePlanId);
    if (!carePlan) {
      throw new Error('Care plan not found');
    }

    const activityDetail = {
      id: `activity_${Date.now()}`,
      status: 'not-started',
      scheduledPeriod: activity.scheduledPeriod,
      description: activity.description,
      kind: activity.kind,
      code: activity.code,
    };

    if (!carePlan.activity) {
      carePlan.activity = [];
    }

    carePlan.activity.push({
      detail: activityDetail,
    });

    return carePlan;
  }

  /**
   * Create a clinical task
   */
  async createTask(patientId, taskType, priority = 'routine') {
    const task = {
      resourceType: 'Task',
      id: `task_${Date.now()}`,
      status: 'requested',
      intent: 'order',
      priority,
      code: {
        coding: [
          {
            system: 'http://hl7.org/fhir/CodeSystem/task-code',
            code: taskType,
          },
        ],
      },
      for: {
        reference: `Patient/${patientId}`,
      },
      authoredOn: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      businessStatus: {
        text: 'Waiting for action',
      },
    };

    this.tasks.set(task.id, task);

    return task;
  }

  /**
   * Update task status
   */
  async updateTaskStatus(taskId, status, output = null) {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    task.status = status;
    task.lastModified = new Date().toISOString();

    if (status === 'completed') {
      task.executionPeriod = {
        start: task.authoredOn,
        end: new Date().toISOString(),
      };
    }

    if (output) {
      task.output = output;
    }

    return task;
  }

  /**
   * Create medication order
   */
  async createMedicationOrder(patientId, medicationData) {
    const order = {
      resourceType: 'MedicationRequest',
      id: `medreq_${Date.now()}`,
      status: 'active',
      intent: 'order',
      priority: medicationData.priority || 'routine',
      medicationCodeableConcept: {
        coding: [
          {
            system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
            code: medicationData.rxnormCode,
            display: medicationData.medicationName,
          },
        ],
        text: medicationData.medicationName,
      },
      subject: {
        reference: `Patient/${patientId}`,
      },
      authoredOn: new Date().toISOString(),
      dosageInstruction: [
        {
          text: medicationData.dosageText,
          timing: medicationData.timing,
          route: medicationData.route,
          doseAndRate: [
            {
              doseQuantity: medicationData.doseQuantity,
            },
          ],
        },
      ],
      dispenseRequest: {
        numberOfRepeatsAllowed: medicationData.refills || 0,
        quantity: medicationData.quantity,
        expectedSupplyDuration: medicationData.duration,
      },
    };

    return order;
  }

  /**
   * Create lab order
   */
  async createLabOrder(patientId, tests) {
    const order = {
      resourceType: 'ServiceRequest',
      id: `labreq_${Date.now()}`,
      status: 'active',
      intent: 'order',
      category: [
        {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '108252007',
              display: 'Laboratory procedure',
            },
          ],
        },
      ],
      code: {
        coding: tests.map(test => ({
          system: 'http://loinc.org',
          code: test.loincCode,
          display: test.name,
        })),
      },
      subject: {
        reference: `Patient/${patientId}`,
      },
      authoredOn: new Date().toISOString(),
      requester: {
        reference: 'Practitioner/example',
      },
    };

    return order;
  }

  /**
   * Record lab results
   */
  async recordLabResults(orderId, results) {
    const report = {
      resourceType: 'DiagnosticReport',
      id: `report_${Date.now()}`,
      status: 'final',
      category: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v2-0074',
              code: 'LAB',
              display: 'Laboratory',
            },
          ],
        },
      ],
      code: {
        text: 'Laboratory Results',
      },
      issued: new Date().toISOString(),
      result: results.map(result => ({
        reference: `Observation/${result.id}`,
      })),
    };

    return report;
  }

  /**
   * Schedule appointment
   */
  async scheduleAppointment(patientId, practitionerId, dateTime, duration = 30) {
    const appointment = {
      resourceType: 'Appointment',
      id: `appt_${Date.now()}`,
      status: 'booked',
      serviceType: [
        {
          coding: [
            {
              code: 'general',
              display: 'General Practice',
            },
          ],
        },
      ],
      start: dateTime,
      end: this.addMinutes(new Date(dateTime), duration).toISOString(),
      participant: [
        {
          actor: {
            reference: `Patient/${patientId}`,
          },
          required: 'required',
          status: 'accepted',
        },
        {
          actor: {
            reference: `Practitioner/${practitionerId}`,
          },
          required: 'required',
          status: 'accepted',
        },
      ],
    };

    return appointment;
  }

  /**
   * Get workflow status
   */
  getWorkflowStatus(workflowId) {
    return this.workflows.get(workflowId);
  }

  /**
   * Get active workflows for patient
   */
  getPatientWorkflows(patientId) {
    const workflows = [];
    for (const [, workflow] of this.workflows) {
      if (workflow.patientId === patientId) {
        workflows.push(workflow);
      }
    }
    return workflows;
  }

  /**
   * Get care plan
   */
  getCarePlan(carePlanId) {
    return this.carePlans.get(carePlanId);
  }

  /**
   * Get patient tasks
   */
  getPatientTasks(patientId) {
    const tasks = [];
    for (const [, task] of this.tasks) {
      if (task.for?.reference === `Patient/${patientId}`) {
        tasks.push(task);
      }
    }
    return tasks;
  }

  /**
   * Helper: Add months to date
   */
  addMonths(date, months) {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  }

  /**
   * Helper: Add minutes to date
   */
  addMinutes(date, minutes) {
    const result = new Date(date);
    result.setMinutes(result.getMinutes() + minutes);
    return result;
  }
}

// Export for use in demo.js
window.FHIRWorkflowEngine = FHIRWorkflowEngine;
