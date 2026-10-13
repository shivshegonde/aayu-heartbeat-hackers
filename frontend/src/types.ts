export interface BoundingBox {
  pageNumber: number;
  top: number;
  left: number;
  bottom: number;
  right: number;
}

export interface FieldProvenance {
  origin: 'SOURCE_DOCUMENT' | 'CLINICIAN_CLARIFICATION' | 'SYSTEM_DERIVED';
  rawQuote: string;
  confidenceScore: number;
  boundingBox?: BoundingBox;
  clarifiedBy?: string;
  clarificationTimestamp?: string;
}

export interface TrackedField<T> {
  value: T | null;
  provenance?: FieldProvenance | null;
}

export type FrequencyCode =
  | 'OD'
  | 'BD'
  | 'TDS'
  | 'QID'
  | 'Q4H'
  | 'Q6H'
  | 'Q8H'
  | 'Q12H'
  | 'HS'
  | 'SOS'
  | 'STAT'
  | 'WEEKLY'
  | 'CUSTOM';

export type FoodRelation =
  | 'BEFORE_FOOD'
  | 'AFTER_FOOD'
  | 'WITH_FOOD'
  | 'EMPTY_STOMACH'
  | 'NO_RELATION';

export interface TimeSlotAssignment {
  slot: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT';
  standardTime: string;
  confirmedByStaff: boolean;
}

export interface ExtractedMedication {
  id: string;
  brandName: TrackedField<string>;
  saltName: TrackedField<string>;
  dosageForm: TrackedField<'TABLET' | 'CAPSULE' | 'SYRUP' | 'INJECTION' | 'DROPS' | 'OINTMENT' | 'INHALER' | 'PATCH'>;
  strength: TrackedField<string>;
  prescribedDose: TrackedField<string>;
  frequency: TrackedField<FrequencyCode>;
  route: TrackedField<'ORAL' | 'SUBLINGUAL' | 'TOPICAL' | 'INHALATION' | 'IV' | 'IM' | 'SC'>;
  durationDays: TrackedField<number>;
  foodRelation: TrackedField<FoodRelation>;
  sosCondition: TrackedField<string>;
  timeSlots: TimeSlotAssignment[];
  instructionsPlainHindi?: string;
  instructionsPlainEnglish?: string;
  isHighAlertDrug?: boolean;
  indianFormulary?: {
    genericMolecule: string;
    cdscoApproved: boolean;
    nlem2022Essential: boolean;
    janAushadhiGenericName?: string;
    janAushadhiPriceInr?: number;
    brandedMrpInr?: number;
    estimatedSavingsInr?: number;
    snomedNRCeSCode?: string;
    drugCategory?: string;
    fdcStatus?: 'APPROVED_FDC' | 'SINGLE_SALT' | 'RESTRICTED';
  };
}

export interface BlockerIssue {
  id: string;
  code: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  medicationId?: string;
  messageEnglish: string;
  messageHindi: string;
  isResolved: boolean;
  resolvedBy?: string;
  resolutionNote?: string;
}

export interface FollowUpPlan {
  reviewDate: TrackedField<string>;
  departmentOrDoctor: TrackedField<string>;
  relativeDaysStated: string | null;
  hospitalContact: string;
}

export interface WarningSign {
  id: string;
  symptomEnglish: string;
  symptomHindi: string;
  urgency: 'IMMEDIATE_EMERGENCY' | 'CALL_DOCTOR' | 'ROUTINE';
  actionEnglish: string;
  actionHindi: string;
  evidenceQuote: string;
}

export interface ApprovalMetadata {
  approvedByNurseId: string;
  approvedByNurseName: string;
  approvalTimestamp: string;
  cryptographicHash: string;
  templateVersion: string;
}

// ==========================================
// 1. BILLING & FINANCIAL CLEARANCE
// ==========================================
export type BillingCategory =
  | 'ROOM_AND_NURSING'
  | 'DOCTOR_CONSULTATION'
  | 'SURGERY_OT_PROCEDURE'
  | 'IMPLANTS_AND_CONSUMABLES'
  | 'INVESTIGATIONS_LAB_RAD'
  | 'HOSPITAL_PHARMACY'
  | 'OWN_MEDICINE_RECONCILIATION'
  | 'OTHER_SERVICES';

export interface BillingLineItem {
  id: string;
  category: BillingCategory;
  description: string;
  amount: number;
  isCoveredByInsurance: boolean;
  notes?: string;
}

export interface InsuranceSettlement {
  tpaOrInsurerName?: string;
  policyOrClaimNumber?: string;
  preAuthApprovedAmount: number;
  totalHospitalBill: number;
  coPayAndDeductible: number;
  nonMedicalDeductions: number;
  patientPayableAmount: number;
  settlementStatus:
    | 'CLAIM_SETTLED_CASHLESS'
    | 'PRE_AUTH_APPROVED'
    | 'REIMBURSEMENT_DOCS_PROVIDED'
    | 'SELF_PAY_FULL'
    | 'PENDING_TPA_CLEARANCE';
  tpaHelpdeskContact?: string;
}

export interface BillingBreakdown {
  items: BillingLineItem[];
  insurance: InsuranceSettlement;
  hasOwnMedicineCredits: boolean;
  clearanceNoteEnglish: string;
  clearanceNoteHindi: string;
}

// ==========================================
// 2. UNIVERSAL VITALS & BIOMETRIC TRACKING
// ==========================================
export type VitalParameterType =
  | 'BLOOD_PRESSURE'
  | 'BLOOD_SUGAR_FASTING'
  | 'BLOOD_SUGAR_PP'
  | 'SPO2_OXYGEN'
  | 'PULSE_HEART_RATE'
  | 'BODY_TEMPERATURE'
  | 'BODY_WEIGHT'
  | 'SURGICAL_DRAIN_OUTPUT'
  | 'PAIN_SCORE'
  | 'CUSTOM';

export interface VitalMeasurementSlot {
  timeLabel: string;
  slot: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT';
  clinicalCondition?: string;
}

export interface UniversalVitalMonitoringItem {
  id: string;
  parameterType: VitalParameterType;
  customParameterName?: string;
  displayNameEnglish: string;
  displayNameHindi: string;
  unit: string;
  targetNormalRange: string;
  alertThreshold: string;
  frequencyDescription: string;
  scheduledSlots: VitalMeasurementSlot[];
  patientInstructionsHindi: string;
  patientInstructionsEnglish: string;
  bringToFollowUpRequired: boolean;
}

export interface VitalsAdvicePlan {
  itemsToTrack: UniversalVitalMonitoringItem[];
  caregiverInstructionsHindi: string;
  caregiverInstructionsEnglish: string;
}

// ==========================================
// 3. MULTI-SPECIALTY HEALTH EDUCATION
// ==========================================
export interface UniversalConditionPathology {
  conditionNameEnglish: string;
  conditionNameHindi: string;
  specialty:
    | 'CARDIOLOGY'
    | 'GENERAL_SURGERY'
    | 'ORTHOPEDICS'
    | 'PULMONOLOGY'
    | 'NEUROLOGY'
    | 'NEPHROLOGY'
    | 'GASTROENTEROLOGY'
    | 'GENERAL_MEDICINE'
    | 'OTHER';
  howItArisesEnglish: string;
  howItArisesHindi: string;
  keyUnderlyingFactors: string[];
}

export interface UniversalActivityProtocol {
  allowedActivitiesEnglish: string[];
  allowedActivitiesHindi: string[];
  restrictedActivitiesEnglish: string[];
  restrictedActivitiesHindi: string[];
  recommendedDailyWalkingMinutes?: number;
  whenToStopExertionHindi: string;
  whenToStopExertionEnglish: string;
}

export interface UniversalHomeCareDietWound {
  dietaryGuidelinesHindi: string[];
  dietaryGuidelinesEnglish: string[];
  woundOrSurgicalSiteCareHindi?: string;
  woundOrSurgicalSiteCareEnglish?: string;
  lifestyleAndHygieneHindi: string;
  lifestyleAndHygieneEnglish: string;
}

export interface HealthEducationPlan {
  pathology: UniversalConditionPathology;
  activity: UniversalActivityProtocol;
  homeCare: UniversalHomeCareDietWound;
  primaryCareVersusEmergency: {
    routineReliefStepsHindi: string[];
    routineReliefStepsEnglish: string[];
    emergencyActionStepsHindi: string[];
    emergencyActionStepsEnglish: string[];
  };
}

// ==========================================
// 4. CLINICAL DIAGNOSIS & DIAGNOSTIC TESTS
// ==========================================
export interface UniversalDiagnosticTestResult {
  id: string;
  testName: string;
  category:
    | 'LAB_BLOOD_BIOCHEM'
    | 'MICROBIOLOGY_CULTURE'
    | 'RADIOLOGY_IMAGING'
    | 'CARDIAC_NEURO_DIAGNOSTIC'
    | 'HISTOPATHOLOGY';
  performedDate: string;
  findingValue: string;
  referenceNormalRange?: string;
  isAbnormal: boolean;
  clinicalSummary: string;
  rawQuote?: string;
}

export interface ClinicalDiagnosisDetails {
  primaryDiagnosis: string;
  icdCode?: string;
  secondaryDiagnoses: string[];
  proceduresPerformed: string[];
  dischargeConditionSummary: string;
  inHospitalTests: UniversalDiagnosticTestResult[];
  advisedFollowUpTests: {
    testName: string;
    targetDueTimeline: string;
    instructions: string;
  }[];
}

// ==========================================
// MASTER DISCHARGE CASE
// ==========================================
export interface DischargeCase {
  caseId: string;
  hospitalId: string;
  hospitalName: string;
  patientIdMasked: string;
  patientDisplayName: string;
  patientAge: number;
  patientGender: string;
  primaryDiagnosis: string;
  admissionDate: string;
  dischargeDate: string;
  primaryLanguage: 'hi' | 'en' | 'mr' | 'bn' | 'ta' | 'te';
  status:
    | 'INGESTING'
    | 'NEEDS_REVIEW'
    | 'READY_FOR_APPROVAL'
    | 'APPROVED_LOCKED'
    | 'EXTRACTION_FAILED';
  revision: number;
  sourceDocumentName: string;
  ocrTextSnapshot: string;
  medications: ExtractedMedication[];
  followUp: FollowUpPlan;
  warningSigns: WarningSign[];
  blockers: BlockerIssue[];
  approvalMetadata: ApprovalMetadata | null;
  // New Enhanced Domains:
  diagnosisDetails?: ClinicalDiagnosisDetails;
  vitalsAdvice?: VitalsAdvicePlan;
  healthEducation?: HealthEducationPlan;
  billing?: BillingBreakdown;
  // ABDM & Ayushman Bharat Integration Rails:
  abhaNumber?: string;
  abhaAddress?: string;
  abdmComplianceStatus?: 'LINKED_VERIFIED' | 'CONSENT_PENDING' | 'NOT_LINKED';
  indianClinicalSummary?: {
    totalEstimatedJanAushadhiSavings: number;
    totalPrescriptionsAnalyzed: number;
    nlemEssentialCoveragePercent: number;
    cdscoComplianceVerified: boolean;
    snomedClinicalTerm: string;
    regionalInstructionsAvailable: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface CaseListItem {
  caseId: string;
  patientDisplayName: string;
  patientAge: number;
  patientGender: string;
  primaryDiagnosis: string;
  dischargeDate: string;
  status: string;
  revision: number;
  blockersCount: number;
  criticalBlockersCount: number;
  isApproved: boolean;
}

export interface PharmacyLocation {
  id: string;
  name: string;
  address: string;
  distanceKm: number;
  phoneNumber: string;
  isOpen24x7: boolean;
  latitude: number;
  longitude: number;
  mapsUrl: string;
}
