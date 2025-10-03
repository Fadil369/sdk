'use strict';

/**
 * Advanced Reporting & Export System
 * Generate PDFs, Excel exports, customizable dashboards, and compliance reports
 */

class ReportingEngine {
  constructor() {
    this.reports = new Map();
    this.templates = this.initializeTemplates();
    this.scheduledReports = new Map();
  }

  /**
   * Initialize report templates
   */
  initializeTemplates() {
    return {
      patientSummary: {
        id: 'patient_summary',
        name: 'Patient Summary Report',
        sections: ['demographics', 'vitals', 'medications', 'diagnoses', 'procedures'],
        format: 'pdf',
      },
      clinicalQuality: {
        id: 'clinical_quality',
        name: 'Clinical Quality Metrics',
        sections: ['outcomes', 'safety', 'efficiency', 'patientExperience'],
        format: 'pdf',
      },
      financialSummary: {
        id: 'financial_summary',
        name: 'Financial Summary',
        sections: ['revenue', 'expenses', 'billing', 'collections'],
        format: 'excel',
      },
      complianceAudit: {
        id: 'compliance_audit',
        name: 'HIPAA Compliance Audit',
        sections: ['accessLogs', 'dataBreaches', 'phiAccess', 'training'],
        format: 'pdf',
      },
      vision2030Progress: {
        id: 'vision2030_progress',
        name: 'Vision 2030 Progress Report',
        sections: ['digitalTransformation', 'aiIntegration', 'qualityMetrics', 'innovation'],
        format: 'pdf',
      },
    };
  }

  /**
   * Generate patient summary report
   */
  async generatePatientSummary(patientId, dateRange = null) {
    const report = {
      id: `report_${Date.now()}`,
      type: 'patient_summary',
      patientId,
      generatedAt: new Date().toISOString(),
      generatedBy: 'system',
      data: {
        patient: {
          id: patientId,
          name: 'أحمد محمد العلي',
          nameEn: 'Ahmed Mohammed Al-Ali',
          nationalId: '1234567890',
          age: 38,
          gender: 'male',
        },
        vitals: [
          {
            date: '2025-10-01',
            bloodPressure: '128/82',
            heartRate: 74,
            temperature: 36.8,
            weight: 78.5,
            height: 175,
            bmi: 25.6,
          },
        ],
        medications: [
          {
            name: 'Metformin 500mg',
            dosage: '500mg twice daily',
            startDate: '2025-01-15',
            prescriber: 'Dr. Sarah Ahmed',
          },
          {
            name: 'Amlodipine 5mg',
            dosage: '5mg once daily',
            startDate: '2025-03-20',
            prescriber: 'Dr. Sarah Ahmed',
          },
        ],
        diagnoses: [
          {
            code: 'E11',
            description: 'Type 2 Diabetes Mellitus',
            diagnosedDate: '2024-12-10',
          },
          {
            code: 'I10',
            description: 'Essential Hypertension',
            diagnosedDate: '2025-03-15',
          },
        ],
        labs: [
          {
            test: 'HbA1c',
            result: '6.8%',
            reference: '< 7.0%',
            date: '2025-09-15',
            status: 'good',
          },
          {
            test: 'Lipid Panel',
            result: 'Total: 195, LDL: 120, HDL: 45',
            date: '2025-09-15',
            status: 'borderline',
          },
        ],
      },
    };

    this.reports.set(report.id, report);
    return report;
  }

  /**
   * Generate clinical quality report
   */
  async generateQualityReport(facilityId, period) {
    const report = {
      id: `report_${Date.now()}`,
      type: 'clinical_quality',
      facilityId,
      period,
      generatedAt: new Date().toISOString(),
      data: {
        outcomes: {
          mortalityRate: 2.1,
          mortalityRateTarget: 2.5,
          readmissionRate: 8.4,
          readmissionRateTarget: 10.0,
          infectionRate: 1.2,
          infectionRateTarget: 2.0,
        },
        safety: {
          adverseEvents: 12,
          medicationErrors: 5,
          fallsWithInjury: 3,
          pressureUlcers: 2,
        },
        efficiency: {
          avgLengthOfStay: 4.2,
          bedUtilization: 87,
          emergencyWaitTime: 28,
          surgeryOnTime: 94,
        },
        patientExperience: {
          satisfactionScore: 88.5,
          recommendationRate: 92.0,
          complaintResolutionTime: 2.3,
        },
      },
    };

    this.reports.set(report.id, report);
    return report;
  }

  /**
   * Generate financial summary
   */
  async generateFinancialReport(facilityId, period) {
    const report = {
      id: `report_${Date.now()}`,
      type: 'financial_summary',
      facilityId,
      period,
      generatedAt: new Date().toISOString(),
      data: {
        revenue: {
          inpatient: 12500000,
          outpatient: 8750000,
          emergency: 3250000,
          total: 24500000,
        },
        expenses: {
          personnel: 14000000,
          supplies: 6500000,
          equipment: 1800000,
          overhead: 2200000,
          total: 24500000,
        },
        billing: {
          totalClaims: 15420,
          approvedClaims: 14836,
          deniedClaims: 584,
          pendingClaims: 1205,
        },
        collections: {
          collectionRate: 92.5,
          daysSalesOutstanding: 32,
          badDebt: 1.8,
        },
      },
    };

    this.reports.set(report.id, report);
    return report;
  }

  /**
   * Generate compliance audit report
   */
  async generateComplianceReport(facilityId, period) {
    const report = {
      id: `report_${Date.now()}`,
      type: 'compliance_audit',
      facilityId,
      period,
      generatedAt: new Date().toISOString(),
      data: {
        accessLogs: {
          totalAccesses: 124580,
          unauthorizedAttempts: 15,
          afterHoursAccess: 892,
          bulkDataExports: 3,
        },
        dataBreaches: {
          incidents: 0,
          nearMisses: 2,
          investigationsCompleted: 2,
        },
        phiAccess: {
          appropriateAccess: 99.2,
          breakGlassEvents: 8,
          auditTrailComplete: 100,
        },
        training: {
          employeesTrained: 485,
          employeesTotal: 500,
          complianceRate: 97.0,
          retrainingRequired: 15,
        },
        findings: [
          {
            severity: 'low',
            category: 'access-control',
            description: '15 employees require HIPAA retraining',
            recommendation: 'Schedule training sessions within 30 days',
          },
          {
            severity: 'low',
            category: 'documentation',
            description: '2 near-miss incidents require documentation update',
            recommendation: 'Update incident response procedures',
          },
        ],
      },
    };

    this.reports.set(report.id, report);
    return report;
  }

  /**
   * Generate Vision 2030 progress report
   */
  async generateVision2030Report(facilityId, period) {
    const report = {
      id: `report_${Date.now()}`,
      type: 'vision2030_progress',
      facilityId,
      period,
      generatedAt: new Date().toISOString(),
      data: {
        overallScore: 78.3,
        digitalTransformation: {
          score: 82.5,
          ehrAdoption: 98,
          paperlessOperations: 89,
          mobileHealthApps: 76,
          telemedicine: 65,
        },
        aiIntegration: {
          score: 72.1,
          diagnosticAI: 80,
          predictiveAnalytics: 75,
          automatedWorkflows: 68,
          nlpImplementation: 65,
        },
        qualityMetrics: {
          score: 84.7,
          patientSafety: 92,
          clinicalOutcomes: 88,
          patientExperience: 86,
          staffSatisfaction: 73,
        },
        innovation: {
          score: 74.8,
          researchProjects: 12,
          patentApplications: 3,
          startupCollaborations: 5,
          innovationRevenue: 2.4,
        },
        sustainability: {
          score: 76.5,
          energyEfficiency: 82,
          wasteReduction: 78,
          waterConservation: 75,
          greenProcurement: 71,
        },
      },
    };

    this.reports.set(report.id, report);
    return report;
  }

  /**
   * Export report to PDF
   */
  async exportToPDF(reportId) {
    const report = this.reports.get(reportId);
    if (!report) {
      throw new Error('Report not found');
    }

    // In production, use a PDF library like jsPDF
    const pdfData = {
      format: 'pdf',
      title: this.templates[report.type]?.name || 'Report',
      content: report.data,
      generatedAt: report.generatedAt,
      metadata: {
        author: 'BrainSAIT Healthcare SDK',
        subject: report.type,
        keywords: ['healthcare', 'report', 'fhir'],
      },
    };

    return pdfData;
  }

  /**
   * Export report to Excel
   */
  async exportToExcel(reportId) {
    const report = this.reports.get(reportId);
    if (!report) {
      throw new Error('Report not found');
    }

    // In production, use a library like SheetJS (xlsx)
    const excelData = {
      format: 'xlsx',
      sheets: this.convertToSheets(report.data),
      fileName: `${report.type}_${Date.now()}.xlsx`,
    };

    return excelData;
  }

  /**
   * Export report to CSV
   */
  async exportToCSV(reportId) {
    const report = this.reports.get(reportId);
    if (!report) {
      throw new Error('Report not found');
    }

    const csvData = this.convertToCSV(report.data);

    return {
      format: 'csv',
      data: csvData,
      fileName: `${report.type}_${Date.now()}.csv`,
    };
  }

  /**
   * Schedule recurring report
   */
  async scheduleReport(config) {
    const schedule = {
      id: `schedule_${Date.now()}`,
      reportType: config.reportType,
      frequency: config.frequency, // 'daily', 'weekly', 'monthly'
      recipients: config.recipients,
      format: config.format,
      parameters: config.parameters,
      active: true,
      lastRun: null,
      nextRun: this.calculateNextRun(config.frequency),
      createdAt: new Date().toISOString(),
    };

    this.scheduledReports.set(schedule.id, schedule);

    return schedule;
  }

  /**
   * Get scheduled reports
   */
  getScheduledReports() {
    return Array.from(this.scheduledReports.values());
  }

  /**
   * Delete scheduled report
   */
  deleteScheduledReport(scheduleId) {
    return this.scheduledReports.delete(scheduleId);
  }

  /**
   * Create custom dashboard
   */
  async createDashboard(config) {
    const dashboard = {
      id: `dashboard_${Date.now()}`,
      name: config.name,
      description: config.description,
      widgets: config.widgets || [],
      layout: config.layout || 'grid',
      refreshInterval: config.refreshInterval || 300,
      createdAt: new Date().toISOString(),
      createdBy: config.userId,
    };

    return dashboard;
  }

  /**
   * Helper: Convert data to Excel sheets
   */
  convertToSheets(data) {
    const sheets = [];

    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'object' && !Array.isArray(value)) {
        sheets.push({
          name: key,
          data: this.flattenObject(value),
        });
      }
    }

    return sheets;
  }

  /**
   * Helper: Flatten object for Excel
   */
  flattenObject(obj, prefix = '') {
    const result = [];

    for (const [key, value] of Object.entries(obj)) {
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        result.push(...this.flattenObject(value, newKey));
      } else {
        result.push({ key: newKey, value: String(value) });
      }
    }

    return result;
  }

  /**
   * Helper: Convert to CSV
   */
  convertToCSV(data) {
    const flat = this.flattenObject(data);
    const headers = ['Key', 'Value'];
    const rows = flat.map(item => [item.key, item.value]);

    return [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');
  }

  /**
   * Helper: Calculate next run time
   */
  calculateNextRun(frequency) {
    const now = new Date();

    switch (frequency) {
      case 'daily':
        now.setDate(now.getDate() + 1);
        break;
      case 'weekly':
        now.setDate(now.getDate() + 7);
        break;
      case 'monthly':
        now.setMonth(now.getMonth() + 1);
        break;
      default:
        now.setDate(now.getDate() + 1);
    }

    return now.toISOString();
  }

  /**
   * Get report
   */
  getReport(reportId) {
    return this.reports.get(reportId);
  }

  /**
   * List all reports
   */
  listReports(filter = {}) {
    let reports = Array.from(this.reports.values());

    if (filter.type) {
      reports = reports.filter(r => r.type === filter.type);
    }

    if (filter.patientId) {
      reports = reports.filter(r => r.patientId === filter.patientId);
    }

    if (filter.facilityId) {
      reports = reports.filter(r => r.facilityId === filter.facilityId);
    }

    return reports;
  }
}

// Export for use in demo.js
window.ReportingEngine = ReportingEngine;
