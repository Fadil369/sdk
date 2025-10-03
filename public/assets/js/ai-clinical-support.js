'use strict';

/**
 * AI-Powered Clinical Decision Support System
 * Provides risk assessment, drug interactions, diagnostic assistance, and clinical pathways
 */

class AIClinicalSupport {
  constructor() {
    this.models = {
      riskPrediction: null,
      drugInteraction: null,
      diagnostic: null,
      pathways: null,
    };
    this.clinicalDatabase = this.initializeClinicalData();
  }

  /**
   * Initialize clinical knowledge base
   */
  initializeClinicalData() {
    return {
      diseases: [
        { id: 'D001', name: 'Type 2 Diabetes', icd10: 'E11', prevalence: 0.185 },
        { id: 'D002', name: 'Hypertension', icd10: 'I10', prevalence: 0.321 },
        { id: 'D003', name: 'Coronary Artery Disease', icd10: 'I25', prevalence: 0.094 },
        { id: 'D004', name: 'Chronic Kidney Disease', icd10: 'N18', prevalence: 0.152 },
        { id: 'D005', name: 'Asthma', icd10: 'J45', prevalence: 0.118 },
      ],
      medications: [
        { id: 'M001', name: 'Metformin', class: 'Antidiabetic', interactions: ['M003'] },
        { id: 'M002', name: 'Amlodipine', class: 'Antihypertensive', interactions: [] },
        { id: 'M003', name: 'Warfarin', class: 'Anticoagulant', interactions: ['M001', 'M005'] },
        { id: 'M004', name: 'Atorvastatin', class: 'Statin', interactions: ['M003'] },
        { id: 'M005', name: 'Aspirin', class: 'Antiplatelet', interactions: ['M003'] },
      ],
      riskFactors: [
        { id: 'RF001', name: 'Age > 65', weight: 1.5 },
        { id: 'RF002', name: 'BMI > 30', weight: 1.3 },
        { id: 'RF003', name: 'Smoking', weight: 2.0 },
        { id: 'RF004', name: 'Family History', weight: 1.4 },
        { id: 'RF005', name: 'Sedentary Lifestyle', weight: 1.2 },
      ],
      clinicalPathways: [
        {
          id: 'CP001',
          condition: 'Acute Myocardial Infarction',
          stages: [
            { step: 1, action: 'ECG within 10 minutes', duration: '10m' },
            { step: 2, action: 'Troponin & cardiac markers', duration: '15m' },
            { step: 3, action: 'Aspirin + P2Y12 inhibitor', duration: '5m' },
            { step: 4, action: 'Cardiology consultation', duration: '30m' },
            { step: 5, action: 'PCI or thrombolysis decision', duration: '20m' },
          ],
        },
        {
          id: 'CP002',
          condition: 'Sepsis Management',
          stages: [
            { step: 1, action: 'Blood cultures x2', duration: '10m' },
            { step: 2, action: 'Broad-spectrum antibiotics', duration: '60m' },
            { step: 3, action: 'Fluid resuscitation 30ml/kg', duration: '180m' },
            { step: 4, action: 'Lactate measurement', duration: '15m' },
            { step: 5, action: 'Vasopressor if hypotensive', duration: 'PRN' },
          ],
        },
      ],
    };
  }

  /**
   * Assess patient risk for various conditions
   */
  async assessPatientRisk(patientData) {
    const {
      age,
      gender,
      bmi,
      smokingStatus,
      comorbidities = [],
      familyHistory = [],
      vitals = {},
      labs = {},
    } = patientData;

    // Calculate risk scores
    const risks = {
      cardiovascular: this.calculateCardiovascularRisk(patientData),
      diabetes: this.calculateDiabetesRisk(patientData),
      stroke: this.calculateStrokeRisk(patientData),
      mortality: this.calculateMortalityRisk(patientData),
      readmission: this.calculateReadmissionRisk(patientData),
    };

    // Generate recommendations
    const recommendations = this.generateRiskRecommendations(risks, patientData);

    return {
      patientId: patientData.id,
      assessmentDate: new Date().toISOString(),
      riskScores: risks,
      overallRisk: this.calculateOverallRisk(risks),
      recommendations,
      nextAssessment: this.calculateNextAssessmentDate(risks),
    };
  }

  /**
   * Calculate cardiovascular risk (Framingham-style)
   */
  calculateCardiovascularRisk(data) {
    let score = 0;
    
    // Age factor
    if (data.age >= 65) score += 3;
    else if (data.age >= 55) score += 2;
    else if (data.age >= 45) score += 1;

    // BMI factor
    if (data.bmi >= 30) score += 2;
    else if (data.bmi >= 25) score += 1;

    // Smoking
    if (data.smokingStatus === 'current') score += 3;
    else if (data.smokingStatus === 'former') score += 1;

    // Comorbidities
    if (data.comorbidities.includes('hypertension')) score += 2;
    if (data.comorbidities.includes('diabetes')) score += 2;
    if (data.comorbidities.includes('hyperlipidemia')) score += 1;

    // Vitals
    if (data.vitals.systolicBP > 140) score += 2;
    if (data.labs?.cholesterol > 240) score += 2;

    // Convert to percentage risk
    const percentage = Math.min((score / 15) * 100, 100);

    return {
      score,
      percentage: percentage.toFixed(1),
      category: this.getRiskCategory(percentage),
      confidence: 0.87,
    };
  }

  /**
   * Calculate diabetes risk
   */
  calculateDiabetesRisk(data) {
    let score = 0;

    if (data.age >= 45) score += 2;
    if (data.bmi >= 30) score += 3;
    if (data.bmi >= 25) score += 1;
    if (data.familyHistory.includes('diabetes')) score += 3;
    if (data.labs?.glucose > 100) score += 2;
    if (data.labs?.hba1c > 5.7) score += 3;

    const percentage = Math.min((score / 13) * 100, 100);

    return {
      score,
      percentage: percentage.toFixed(1),
      category: this.getRiskCategory(percentage),
      confidence: 0.91,
    };
  }

  /**
   * Calculate stroke risk
   */
  calculateStrokeRisk(data) {
    let score = 0;

    if (data.age >= 75) score += 3;
    else if (data.age >= 65) score += 2;
    if (data.comorbidities.includes('hypertension')) score += 2;
    if (data.comorbidities.includes('diabetes')) score += 1;
    if (data.comorbidities.includes('atrial-fibrillation')) score += 3;
    if (data.smokingStatus === 'current') score += 2;

    const percentage = Math.min((score / 11) * 100, 100);

    return {
      score,
      percentage: percentage.toFixed(1),
      category: this.getRiskCategory(percentage),
      confidence: 0.84,
    };
  }

  /**
   * Calculate 30-day mortality risk
   */
  calculateMortalityRisk(data) {
    let score = 0;

    if (data.age >= 85) score += 4;
    else if (data.age >= 75) score += 3;
    else if (data.age >= 65) score += 2;

    if (data.comorbidities.length >= 3) score += 3;
    else if (data.comorbidities.length >= 2) score += 2;

    if (data.vitals?.systolicBP < 90) score += 3;
    if (data.vitals?.heartRate > 120) score += 2;
    if (data.labs?.creatinine > 2.0) score += 2;

    const percentage = Math.min((score / 14) * 100, 100);

    return {
      score,
      percentage: percentage.toFixed(1),
      category: this.getRiskCategory(percentage),
      confidence: 0.88,
    };
  }

  /**
   * Calculate 30-day readmission risk
   */
  calculateReadmissionRisk(data) {
    let score = 0;

    if (data.age >= 65) score += 2;
    if (data.comorbidities.length >= 3) score += 3;
    if (data.previousAdmissions >= 2) score += 2;
    if (data.socialSupport === 'low') score += 2;
    if (data.medicationCompliance === 'poor') score += 2;

    const percentage = Math.min((score / 11) * 100, 100);

    return {
      score,
      percentage: percentage.toFixed(1),
      category: this.getRiskCategory(percentage),
      confidence: 0.79,
    };
  }

  /**
   * Get risk category
   */
  getRiskCategory(percentage) {
    if (percentage >= 75) return 'critical';
    if (percentage >= 50) return 'high';
    if (percentage >= 25) return 'moderate';
    return 'low';
  }

  /**
   * Calculate overall risk
   */
  calculateOverallRisk(risks) {
    const weights = {
      cardiovascular: 0.25,
      diabetes: 0.20,
      stroke: 0.20,
      mortality: 0.25,
      readmission: 0.10,
    };

    let weightedScore = 0;
    for (const [key, risk] of Object.entries(risks)) {
      weightedScore += parseFloat(risk.percentage) * weights[key];
    }

    return {
      score: weightedScore.toFixed(1),
      category: this.getRiskCategory(weightedScore),
    };
  }

  /**
   * Generate risk-based recommendations
   */
  generateRiskRecommendations(risks, patientData) {
    const recommendations = [];

    // Cardiovascular recommendations
    if (risks.cardiovascular.percentage > 50) {
      recommendations.push({
        category: 'cardiovascular',
        priority: 'high',
        action: 'Cardiology referral recommended',
        details: 'Consider stress test, echocardiogram, and intensive lifestyle modification',
      });
    }

    // Diabetes recommendations
    if (risks.diabetes.percentage > 50) {
      recommendations.push({
        category: 'diabetes',
        priority: 'high',
        action: 'Diabetes screening and management',
        details: 'HbA1c testing, dietary counseling, consider metformin prophylaxis',
      });
    }

    // Stroke prevention
    if (risks.stroke.percentage > 50) {
      recommendations.push({
        category: 'stroke',
        priority: 'high',
        action: 'Stroke prevention protocol',
        details: 'Blood pressure control, antiplatelet therapy, consider anticoagulation if AF',
      });
    }

    // Mortality risk mitigation
    if (risks.mortality.percentage > 50) {
      recommendations.push({
        category: 'critical',
        priority: 'urgent',
        action: 'Intensive monitoring required',
        details: 'ICU evaluation, frequent vital signs, advanced care planning discussion',
      });
    }

    return recommendations;
  }

  /**
   * Check drug-drug interactions
   */
  async checkDrugInteractions(medications) {
    const interactions = [];
    const db = this.clinicalDatabase.medications;

    for (let i = 0; i < medications.length; i++) {
      for (let j = i + 1; j < medications.length; j++) {
        const drug1 = db.find(d => d.name === medications[i]);
        const drug2 = db.find(d => d.name === medications[j]);

        if (drug1 && drug2 && drug1.interactions.includes(drug2.id)) {
          interactions.push({
            drug1: drug1.name,
            drug2: drug2.name,
            severity: 'moderate-to-high',
            mechanism: 'May increase bleeding risk or affect metabolism',
            recommendation: 'Monitor closely, consider dose adjustment or alternative',
            evidence: 'Level A - Strong evidence',
          });
        }
      }
    }

    return {
      totalChecked: medications.length,
      interactionsFound: interactions.length,
      interactions,
      overallRisk: interactions.length > 2 ? 'high' : interactions.length > 0 ? 'moderate' : 'low',
    };
  }

  /**
   * Diagnostic assistance
   */
  async getDiagnosticSuggestions(symptoms, vitals, labs) {
    const suggestions = [];

    // Rule-based diagnostic logic
    if (symptoms.includes('chest-pain') && vitals.heartRate > 100) {
      suggestions.push({
        condition: 'Acute Coronary Syndrome',
        probability: 0.72,
        urgency: 'emergency',
        nextSteps: ['ECG', 'Troponin', 'Cardiology consult'],
        differentials: ['Pulmonary embolism', 'Aortic dissection', 'Pericarditis'],
      });
    }

    if (symptoms.includes('fever') && vitals.temperature > 38.5) {
      suggestions.push({
        condition: 'Infectious Process',
        probability: 0.85,
        urgency: 'urgent',
        nextSteps: ['Blood cultures', 'CRP/ESR', 'Imaging as indicated'],
        differentials: ['Pneumonia', 'UTI', 'Sepsis', 'Viral syndrome'],
      });
    }

    if (labs?.glucose > 300 && symptoms.includes('polyuria')) {
      suggestions.push({
        condition: 'Diabetic Ketoacidosis',
        probability: 0.68,
        urgency: 'emergency',
        nextSteps: ['ABG', 'Ketones', 'Electrolytes', 'Insulin protocol'],
        differentials: ['HHS', 'Uncontrolled diabetes'],
      });
    }

    return {
      count: suggestions.length,
      suggestions,
      confidence: suggestions.length > 0 ? 'moderate' : 'low',
      disclaimer: 'AI-assisted suggestions require clinical judgment and validation',
    };
  }

  /**
   * Get clinical pathway for condition
   */
  getClinicalPathway(condition) {
    const pathway = this.clinicalDatabase.clinicalPathways.find(
      p => p.condition.toLowerCase().includes(condition.toLowerCase())
    );

    if (!pathway) {
      return {
        found: false,
        message: 'No standardized pathway found for this condition',
      };
    }

    return {
      found: true,
      pathway,
      totalDuration: this.calculatePathwayDuration(pathway.stages),
      compliance: {
        tracked: true,
        currentStep: 1,
        completedSteps: [],
      },
    };
  }

  /**
   * Calculate pathway duration
   */
  calculatePathwayDuration(stages) {
    let totalMinutes = 0;
    for (const stage of stages) {
      const duration = stage.duration;
      if (duration.endsWith('m')) {
        totalMinutes += parseInt(duration);
      } else if (duration.endsWith('h')) {
        totalMinutes += parseInt(duration) * 60;
      }
    }
    return `${totalMinutes} minutes`;
  }

  /**
   * Calculate next assessment date
   */
  calculateNextAssessmentDate(risks) {
    const highestRisk = Math.max(...Object.values(risks).map(r => parseFloat(r.percentage)));

    let daysUntilNext;
    if (highestRisk >= 75) daysUntilNext = 7;
    else if (highestRisk >= 50) daysUntilNext = 30;
    else if (highestRisk >= 25) daysUntilNext = 90;
    else daysUntilNext = 180;

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + daysUntilNext);

    return nextDate.toISOString();
  }

  /**
   * Generate clinical summary report
   */
  generateClinicalReport(patientId, assessments) {
    return {
      patientId,
      generatedAt: new Date().toISOString(),
      summary: {
        totalAssessments: assessments.length,
        highRiskFindings: assessments.filter(a => a.overallRisk.category === 'high').length,
        activeRecommendations: assessments.flatMap(a => a.recommendations).length,
      },
      assessments,
      trendAnalysis: this.analyzeTrends(assessments),
    };
  }

  /**
   * Analyze risk trends
   */
  analyzeTrends(assessments) {
    if (assessments.length < 2) {
      return { available: false, message: 'Insufficient data for trend analysis' };
    }

    // Simple trend analysis
    const latest = assessments[assessments.length - 1];
    const previous = assessments[assessments.length - 2];

    const trends = {};
    for (const [key, value] of Object.entries(latest.riskScores)) {
      const latestScore = parseFloat(value.percentage);
      const previousScore = parseFloat(previous.riskScores[key].percentage);
      const change = latestScore - previousScore;

      trends[key] = {
        current: latestScore,
        previous: previousScore,
        change: change.toFixed(1),
        trend: change > 2 ? 'increasing' : change < -2 ? 'decreasing' : 'stable',
      };
    }

    return { available: true, trends };
  }
}

// Export for use in demo.js
window.AIClinicalSupport = AIClinicalSupport;
