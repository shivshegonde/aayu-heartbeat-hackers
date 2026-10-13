/**
 * Clinical Document Classifier & Validation Gate
 * 
 * Standards Reference:
 * - HL7 FHIR DocumentReference & Composition (Type 18842-5: Discharge Summary)
 * - ABDM (Ayushman Bharat Digital Mission) Discharge Summary Health Document Specification
 * - NABH Digital Clinical Safety Guidelines (Zero-Hallucination Ingestion Gate)
 */

export interface DocumentClassificationResult {
  isValidClinicalDocument: boolean;
  documentType: 'DISCHARGE_SUMMARY' | 'OPD_PRESCRIPTION' | 'DIAGNOSTIC_REPORT' | 'BILLING_RECEIPT' | 'NON_CLINICAL_DOCUMENT';
  clinicalConfidenceScore: number; // 0 - 100
  matchedClinicalMarkers: string[];
  detectedNonClinicalIndicators: string[];
  rejectionReason?: string;
  recommendedGuidance?: string;
}

// 1. Inpatient Administrative Markers
const INPATIENT_ADMIN_MARKERS = [
  'discharge',
  'admission',
  'hospital',
  'clinic',
  'nursing home',
  'institute of medical',
  'ipd',
  'opd',
  'uhid',
  'mrn',
  'patient name',
  'patient id',
  'consultant',
  'attending doctor',
  'dr.',
  'ward',
  'bed no',
  'doa', // Date of Admission
  'dod', // Date of Discharge
];

// 2. Clinical Diagnosis & Pathology Markers
const CLINICAL_DIAGNOSIS_MARKERS = [
  'diagnosis',
  'provisional diagnosis',
  'final diagnosis',
  'chief complaints',
  'history of present illness',
  'clinical summary',
  'course in hospital',
  'procedure performed',
  'surgery',
  'operative findings',
  'post-operative',
  'investigations',
  'vitals on discharge',
  'condition at discharge',
  'blood pressure',
  'pulse',
  'spo2',
  'hemoglobin',
  'echo',
  'ecg',
  'x-ray',
  'ct scan',
  'mri',
];

// 3. Pharmacotherapy & Medication Markers
const PHARMACOTHERAPY_MARKERS = [
  'medications on discharge',
  'treatment on discharge',
  'rx',
  'advised medications',
  'tab.',
  'cap.',
  'syp.',
  'inj.',
  'ointment',
  'inhaler',
  'dosage',
  'frequency',
  'oral',
  'od',
  'bd',
  'bid',
  'tds',
  'tid',
  'qid',
  'hs',
  'sos',
  'before food',
  'after food',
  'empty stomach',
  'duration',
  'mg',
  'mcg',
  'gm',
  'ml',
];

// 4. Continuum of Care & Discharge Instructions
const DISCHARGE_CONTINUUM_MARKERS = [
  'follow-up',
  'follow up',
  'review in',
  'review on',
  'opd visit',
  'diet advice',
  'dietary guidelines',
  'activity restrictions',
  'wound care',
  'suture removal',
  'warning signs',
  'red flags',
  'emergency contact',
  'when to seek emergency',
];

// 5. Explicit Non-Clinical Negative Markers (Resumes, invoices, IT code, utilities, etc.)
const NON_CLINICAL_INDICATORS = [
  'curriculum vitae',
  'resume',
  'work experience',
  'employment history',
  'education history',
  'skills summary',
  'bachelor of',
  'master of',
  'github.com',
  'linkedin.com',
  'invoice no',
  'tax invoice',
  'bill to',
  'shipping address',
  'gstin',
  'electricity bill',
  'kwh consumed',
  'meter reading',
  'balance due',
  'terms and conditions of contract',
  'agreement between parties',
  'flight confirmation',
  'boarding pass',
  'pnr number',
  'hotel booking',
  'restaurant bill',
  'food menu',
  'software license',
  'source code',
];

/**
 * Validates whether an uploaded document text or OCR payload qualifies
 * as an authentic clinical medical document before entering the AI pipeline.
 */
export function classifyAndValidateClinicalDocument(
  rawText: string,
  filename?: string,
  hasImageBuffer?: boolean
): DocumentClassificationResult {
  const normalized = (rawText || '').toLowerCase();
  const lowerFilename = (filename || '').toLowerCase();

  // Matched arrays
  const matchedAdmin = INPATIENT_ADMIN_MARKERS.filter((m) => normalized.includes(m));
  const matchedDiagnosis = CLINICAL_DIAGNOSIS_MARKERS.filter((m) => normalized.includes(m));
  const matchedPharma = PHARMACOTHERAPY_MARKERS.filter((m) => normalized.includes(m));
  const matchedContinuum = DISCHARGE_CONTINUUM_MARKERS.filter((m) => normalized.includes(m));
  const matchedNegative = NON_CLINICAL_INDICATORS.filter((m) => normalized.includes(m));

  const allMatchedClinical = Array.from(new Set([
    ...matchedAdmin,
    ...matchedDiagnosis,
    ...matchedPharma,
    ...matchedContinuum,
  ]));

  // Calculate weighted clinical score (0 to 100)
  // Discharge summary requires admin + diagnosis + medications
  let score = 0;
  score += Math.min(matchedAdmin.length * 5, 25);
  score += Math.min(matchedDiagnosis.length * 6, 30);
  score += Math.min(matchedPharma.length * 6, 30);
  score += Math.min(matchedContinuum.length * 5, 15);

  // Apply heavy negative penalty for non-clinical indicator matches
  const negativePenalty = matchedNegative.length * 35;
  score = Math.max(0, score - negativePenalty);

  // Filename bonus or penalty
  if (/discharge|summary|hospital|patient|opd|rx|medical|card/i.test(lowerFilename)) {
    score += 15;
  }
  if (/resume|cv|invoice|bill|receipt|ticket|tax|statement/i.test(lowerFilename) && !/discharge|medical|hospital/i.test(lowerFilename)) {
    score = Math.max(0, score - 25);
  }

  score = Math.min(100, Math.max(0, Math.round(score)));

  // Handle scanned physical documents (PDF buffer or photo) where digital text stream is empty or sparse:
  if (hasImageBuffer && normalized.trim().length < 300) {
    if (/resume|cv|invoice|bill|receipt|ticket|tax|statement|salary|contract|agreement/i.test(lowerFilename) && (matchedNegative.length >= 1 || score === 0)) {
      return {
        isValidClinicalDocument: false,
        documentType: 'NON_CLINICAL_DOCUMENT',
        clinicalConfidenceScore: 0,
        matchedClinicalMarkers: [],
        detectedNonClinicalIndicators: matchedNegative.length > 0 ? matchedNegative : ['non_clinical_filename'],
        rejectionReason: `Document Rejected by Clinical Safety Gate: Uploaded file "${filename || 'file'}" appears to be a non-clinical document.`,
        recommendedGuidance: 'Please upload an authentic Hospital Discharge Summary, Discharge Card, or Physician Prescription.',
      };
    }

    // If filename has medical markers or sparse text has hospital/discharge/patient, allow for OCR/Vision processing
    if (/discharge|summary|hospital|patient|opd|rx|medical|card/i.test(lowerFilename) || matchedAdmin.length >= 1 || matchedDiagnosis.length >= 1) {
      return {
        isValidClinicalDocument: true,
        documentType: 'DISCHARGE_SUMMARY',
        clinicalConfidenceScore: Math.max(score, 65),
        matchedClinicalMarkers: allMatchedClinical.length > 0 ? allMatchedClinical : ['scanned_discharge_document'],
        detectedNonClinicalIndicators: [],
      };
    }
  }

  // Threshold evaluation:
  // Non-clinical document: score < 20 OR explicitly matched negative indicators without substantial clinical text
  const isExplicitNonClinical = (matchedNegative.length >= 2 && score < 35) || (score < 20);

  if (isExplicitNonClinical) {
    const primaryReason = matchedNegative.length > 0
      ? `Detected non-clinical indicators: "${matchedNegative.slice(0, 3).join('", "')}".`
      : 'Document lacks essential hospital discharge markers (No Diagnosis, IPD/UHID record, or Medication schedule detected).';

    return {
      isValidClinicalDocument: false,
      documentType: 'NON_CLINICAL_DOCUMENT',
      clinicalConfidenceScore: score,
      matchedClinicalMarkers: allMatchedClinical,
      detectedNonClinicalIndicators: matchedNegative,
      rejectionReason: `Document Rejected by Clinical Safety Gate: ${primaryReason}`,
      recommendedGuidance: 'Please upload an authentic Hospital Discharge Summary, Discharge Card, or Physician Prescription (PDF or Camera Image).',
    };
  }

  // Determine document subtype
  let detectedType: DocumentClassificationResult['documentType'] = 'DISCHARGE_SUMMARY';
  if (matchedPharma.length === 0 && matchedDiagnosis.length >= 2) {
    detectedType = 'DIAGNOSTIC_REPORT';
  } else if (matchedAdmin.length < 2 && matchedPharma.length >= 3) {
    detectedType = 'OPD_PRESCRIPTION';
  } else if (score >= 35) {
    detectedType = 'DISCHARGE_SUMMARY';
  }

  return {
    isValidClinicalDocument: true,
    documentType: detectedType,
    clinicalConfidenceScore: score,
    matchedClinicalMarkers: allMatchedClinical,
    detectedNonClinicalIndicators: matchedNegative,
  };
}
