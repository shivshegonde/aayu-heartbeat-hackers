import { DischargeCase } from '../types';
import { generateFallbackCase } from '../services/geminiExtractor';

export const SAMPLE_CASES: Record<string, DischargeCase> = {
  'case-kamla-devi': generateFallbackCase(''),
  'case-ratan-lal': {
    caseId: 'case-ratan-lal',
    hospitalId: 'HOSP-MAX-DELHI-01',
    hospitalName: 'Apollo & Max Multispeciality Hospital, Saket, New Delhi',
    patientIdMasked: 'PT-993812',
    patientDisplayName: 'Ratan Lal Sharma',
    patientAge: 54,
    patientGender: 'Male',
    primaryDiagnosis: 'Acute Calculous Cholecystitis / Post Laparoscopic Cholecystectomy (POD-2)',
    admissionDate: '2026-10-06',
    dischargeDate: '2026-10-09',
    primaryLanguage: 'hi',
    status: 'APPROVED_LOCKED',
    revision: 1,
    sourceDocumentName: 'Discharge_Surgical_RatanLal.pdf',
    ocrTextSnapshot: `
DEPARTMENT OF GENERAL & MINIMAL ACCESS SURGERY
Patient: Ratan Lal Sharma, 54/M | IPD: 993812 | Consultant: Dr. A. Mathur, MS, FMAS
Operated: Four-Port Laparoscopic Cholecystectomy under GA on 07/10/2026.
Uneventful post-op recovery. Surgical drain removed on 09/10/2026. Tolerating soft oral diet.
Diagnosis: Acute Calculous Cholecystitis (ICD-10: K80.00).

DISCHARGE MEDICATIONS:
1. Tab. Augmentin 625 mg (Amoxicillin + Clavulanic Acid) - 1 Tab TDS - PC x 5 days
2. Tab. Pan 40 mg (Pantoprazole) - 1 Tab OD - AC (Before breakfast) x 7 days
3. Tab. Zerodol-SP (Aceclofenac + Paracetamol + Serratiopeptidase) - 1 Tab BD - PC x 3 days
4. Syp. Duphalac 15 ml - HS (At bedtime in warm water) x 5 days
5. Tab. Ultracet - SOS for severe surgical pain only (Max 2 tabs in 24 hrs)

SURGICAL WOUND CARE & FOLLOW-UP:
- Keep port dressing dry for 5 days. Sponge bath permitted.
- OPD Review on 14/10/2026 for suture removal and histopathology review.
- Daily temperature monitoring (Morning 8 AM & Evening 8 PM). Target < 99°F.
- Bring vitals & wound observation log to OPD.

BILLING & INSURANCE:
Total Bill: Rs 1,17,750 | HDFC ERGO Cashless TPA Approved: Rs 1,15,000 | Co-pay: Rs 2,750.
Own medicine credit: Rs 350.
Emergency Helpline: 011-26515050 / Ext 204
`,
    medications: [
      {
        id: 'med-rl-1',
        brandName: { value: 'Augmentin', provenance: { origin: 'SOURCE_DOCUMENT', rawQuote: 'Tab. Augmentin 625 mg - 1 Tab TDS - PC', confidenceScore: 0.99, boundingBox: { pageNumber: 1, top: 0.32, left: 0.1, bottom: 0.36, right: 0.85 } } },
        saltName: { value: 'Amoxicillin + Clavulanate', provenance: { origin: 'SOURCE_DOCUMENT', rawQuote: 'Amoxicillin + Clavulanate', confidenceScore: 0.96 } },
        dosageForm: { value: 'TABLET', provenance: null },
        strength: { value: '625 mg', provenance: { origin: 'SOURCE_DOCUMENT', rawQuote: '625 mg', confidenceScore: 0.99 } },
        prescribedDose: { value: '1 Tablet', provenance: { origin: 'SOURCE_DOCUMENT', rawQuote: '1 Tab', confidenceScore: 0.98 } },
        frequency: { value: 'TDS', provenance: { origin: 'SOURCE_DOCUMENT', rawQuote: 'TDS', confidenceScore: 0.99 } },
        route: { value: 'ORAL', provenance: null },
        durationDays: { value: 5, provenance: null },
        foodRelation: { value: 'AFTER_FOOD', provenance: null },
        sosCondition: { value: null, provenance: null },
        timeSlots: [
          { slot: 'MORNING', standardTime: '08:00', confirmedByStaff: true },
          { slot: 'AFTERNOON', standardTime: '14:00', confirmedByStaff: true },
          { slot: 'NIGHT', standardTime: '20:30', confirmedByStaff: true },
        ],
        instructionsPlainHindi: 'दिन में 3 बार (सुबह 8, दोपहर 2, रात 8:30): 1 गोली खाने के बाद लें (एंटीबायोटिक का 5 दिन का पूरा कोर्स)।',
        instructionsPlainEnglish: 'Thrice daily: 1 tablet after meals for 5 complete days (Antibiotic course).',
        isHighAlertDrug: false,
      },
      {
        id: 'med-rl-2',
        brandName: { value: 'Pan', provenance: { origin: 'SOURCE_DOCUMENT', rawQuote: 'Tab. Pan 40 mg - 1 Tab OD - AC', confidenceScore: 0.98, boundingBox: { pageNumber: 1, top: 0.37, left: 0.1, bottom: 0.41, right: 0.85 } } },
        saltName: { value: 'Pantoprazole', provenance: { origin: 'SOURCE_DOCUMENT', rawQuote: 'Pantoprazole', confidenceScore: 0.96 } },
        dosageForm: { value: 'TABLET', provenance: null },
        strength: { value: '40 mg', provenance: { origin: 'SOURCE_DOCUMENT', rawQuote: '40 mg', confidenceScore: 0.99 } },
        prescribedDose: { value: '1 Tablet', provenance: { origin: 'SOURCE_DOCUMENT', rawQuote: '1 Tab', confidenceScore: 0.99 } },
        frequency: { value: 'OD', provenance: { origin: 'SOURCE_DOCUMENT', rawQuote: 'OD', confidenceScore: 0.99 } },
        route: { value: 'ORAL', provenance: null },
        durationDays: { value: 7, provenance: null },
        foodRelation: { value: 'BEFORE_FOOD', provenance: null },
        sosCondition: { value: null, provenance: null },
        timeSlots: [{ slot: 'MORNING', standardTime: '07:30', confirmedByStaff: true }],
        instructionsPlainHindi: 'सुबह 7:30 बजे: 1 गोली खाली पेट (नाश्ते से आधा घंटा पहले) लें (गैस व पेट की सुरक्षा के लिए)।',
        instructionsPlainEnglish: 'Morning 7:30 AM: 1 tablet on empty stomach before breakfast (antacid).',
        isHighAlertDrug: false,
      },
      {
        id: 'med-rl-3',
        brandName: { value: 'Zerodol-SP', provenance: { origin: 'SOURCE_DOCUMENT', rawQuote: 'Tab. Zerodol-SP - 1 Tab BD - PC', confidenceScore: 0.97, boundingBox: { pageNumber: 1, top: 0.42, left: 0.1, bottom: 0.46, right: 0.85 } } },
        saltName: { value: 'Aceclofenac + Paracetamol + Serratiopeptidase', provenance: { origin: 'SOURCE_DOCUMENT', rawQuote: 'Aceclofenac + Paracetamol + Serratiopeptidase', confidenceScore: 0.94 } },
        dosageForm: { value: 'TABLET', provenance: null },
        strength: { value: 'Standard Combo', provenance: { origin: 'SOURCE_DOCUMENT', rawQuote: 'Standard Combo', confidenceScore: 0.90 } },
        prescribedDose: { value: '1 Tablet', provenance: { origin: 'SOURCE_DOCUMENT', rawQuote: '1 Tab', confidenceScore: 0.98 } },
        frequency: { value: 'BD', provenance: { origin: 'SOURCE_DOCUMENT', rawQuote: 'BD', confidenceScore: 0.98 } },
        route: { value: 'ORAL', provenance: null },
        durationDays: { value: 3, provenance: null },
        foodRelation: { value: 'AFTER_FOOD', provenance: null },
        sosCondition: { value: null, provenance: null },
        timeSlots: [
          { slot: 'MORNING', standardTime: '08:30', confirmedByStaff: true },
          { slot: 'NIGHT', standardTime: '20:30', confirmedByStaff: true },
        ],
        instructionsPlainHindi: 'दिन में 2 बार (सुबह 8:30, रात 8:30): 1 गोली खाने के बाद (दर्द व सूजन कम करने के लिए केवल 3 दिन)।',
        instructionsPlainEnglish: 'Twice daily after meals for 3 days (pain relief & swelling reduction).',
        isHighAlertDrug: false,
      },
    ],
    followUp: {
      reviewDate: { value: '2026-10-14', provenance: { origin: 'SOURCE_DOCUMENT', rawQuote: 'OPD Review on 14/10/2026', confidenceScore: 0.98 } },
      departmentOrDoctor: { value: 'Surgical OPD Room 12, Dr. A. Mathur', provenance: { origin: 'SOURCE_DOCUMENT', rawQuote: 'Surgical OPD', confidenceScore: 0.97 } },
      relativeDaysStated: '5 days post-discharge (14/10/2026)',
      hospitalContact: '011-26515050 / Ext 204 (Surgical Desk)',
    },
    warningSigns: [
      {
        id: 'warn-rl-1',
        symptomEnglish: 'High spiking fever (> 101°F) or persistent chills',
        symptomHindi: 'तेज़ बुखार (101°F से ऊपर) या लगातार कंपकंपी छूटना',
        urgency: 'IMMEDIATE_EMERGENCY',
        actionEnglish: 'Contact surgical emergency immediately.',
        actionHindi: 'तुरंत सर्जरी विभाग या इमरजेंसी में संपर्क करें।',
        evidenceQuote: 'High fever > 101F',
      },
      {
        id: 'warn-rl-2',
        symptomEnglish: 'Increasing abdominal swelling, severe pain or yellowing of eyes (Jaundice)',
        symptomHindi: 'पेट में अचानक सूजन, असहनीय दर्द या आँखों में पीलापन (पीलिया)',
        urgency: 'IMMEDIATE_EMERGENCY',
        actionEnglish: 'Rush to emergency immediately with discharge summary.',
        actionHindi: 'तुरंत मरीज़ को अस्पताल की इमरजेंसी में लाएं।',
        evidenceQuote: 'persistent vomiting, increasing abdominal distension or jaundice',
      },
    ],
    // Universal Clinical Diagnosis & Diagnostic Tests
    diagnosisDetails: {
      primaryDiagnosis: 'Acute Calculous Cholecystitis / Status Post Laparoscopic Cholecystectomy (POD-2)',
      icdCode: 'K80.00',
      secondaryDiagnoses: ['Grade-I Fatty Liver', 'Mild Gastritis'],
      proceduresPerformed: [
        'Four-Port Laparoscopic Cholecystectomy under General Anesthesia (07/10/2026)',
        'Abdominal Subhepatic Drain Removal (09/10/2026)',
      ],
      dischargeConditionSummary: 'Afebrile, hemodynamically stable, abdomen soft and non-tender, all port dressings clean and dry.',
      inHospitalTests: [
        {
          id: 'test-usg',
          testName: 'Whole Abdomen Ultrasound (USG)',
          category: 'RADIOLOGY_IMAGING',
          performedDate: '2026-10-06',
          findingValue: 'Distended gallbladder with thickened wall (4.2 mm) and multiple calculi (largest 12 mm). CBD diameter 5.1 mm (Normal).',
          referenceNormalRange: 'Wall thickness < 3 mm, CBD < 6 mm',
          isAbnormal: true,
          clinicalSummary: 'Confirmed acute calculous cholecystitis without choledocholithiasis.',
        },
        {
          id: 'test-tlc',
          testName: 'Total Leucocyte Count (TLC / CBC)',
          category: 'LAB_BLOOD_BIOCHEM',
          performedDate: '2026-10-08',
          findingValue: '7,800 /cu.mm (Normalized from admission value of 13,200 /cu.mm)',
          referenceNormalRange: '4,000 - 11,000 /cu.mm',
          isAbnormal: false,
          clinicalSummary: 'Systemic inflammation resolved following surgical source control.',
        },
        {
          id: 'test-lft',
          testName: 'Liver Function Test (Serum Bilirubin)',
          category: 'LAB_BLOOD_BIOCHEM',
          performedDate: '2026-10-08',
          findingValue: 'Total Bilirubin 0.9 mg/dL, Direct 0.2 mg/dL, SGPT 38 U/L',
          referenceNormalRange: 'Total Bilirubin < 1.2 mg/dL',
          isAbnormal: false,
          clinicalSummary: 'Normal hepatic clearance; no biliary ductal obstruction.',
        },
      ],
      advisedFollowUpTests: [
        {
          testName: 'Histopathology Examination (HPE) Report Review',
          targetDueTimeline: 'On suture removal OPD visit (14/10/2026)',
          instructions: 'Collect formal biopsy slide report from pathology laboratory.',
        },
      ],
    },
    // Universal Vitals & Biometric Tracking Schedule
    vitalsAdvice: {
      itemsToTrack: [
        {
          id: 'vital-temp',
          parameterType: 'BODY_TEMPERATURE',
          displayNameEnglish: 'Body Temperature',
          displayNameHindi: 'शरीर का तापमान (बुखार जांच)',
          unit: '°F',
          targetNormalRange: '98.0 - 99.0 °F',
          alertThreshold: '> 100.5 °F (High Fever)',
          frequencyDescription: 'Twice daily for 7 days (Morning 8 AM & Evening 8 PM)',
          scheduledSlots: [
            { timeLabel: '08:00 AM (सुबह)', slot: 'MORNING' },
            { timeLabel: '08:00 PM (रात)', slot: 'NIGHT' },
          ],
          patientInstructionsHindi: 'डिजिटल थर्मामीटर से सुबह और रात तापमान नापें। 100.5°F से अधिक होने पर तुरंत डॉक्टर को सूचित करें।',
          patientInstructionsEnglish: 'Check oral or axillary temperature twice daily. Report if temperature exceeds 100.5°F.',
          bringToFollowUpRequired: true,
        },
        {
          id: 'vital-drain',
          parameterType: 'SURGICAL_DRAIN_OUTPUT',
          displayNameEnglish: 'Port Wound & Dressing Inspection',
          displayNameHindi: 'चीरों व ड्रेसिंग की स्थिति',
          unit: 'observation',
          targetNormalRange: 'Clean, dry, no active soakage',
          alertThreshold: 'Redness, pus, foul odor, or active blood soakage',
          frequencyDescription: 'Once daily morning inspection',
          scheduledSlots: [
            { timeLabel: '09:00 AM (सुबह)', slot: 'MORNING' },
          ],
          patientInstructionsHindi: 'रोजाना सुबह पट्टी को देखें। पट्टी सूखी रहनी चाहिए।',
          patientInstructionsEnglish: 'Inspect port dressings daily. Ensure they remain dry and intact.',
          bringToFollowUpRequired: true,
        },
      ],
      caregiverInstructionsHindi: 'दैनिक तापमान और ड्रेसिंग स्थिति चार्ट में दर्ज करें और 14 तारीख को ओपीडी में साथ लाएं।',
      caregiverInstructionsEnglish: 'Record temperature and wound status daily; bring logbook to surgical OPD review on 14th Oct.',
    },
    // Multi-Specialty Health Education & Recovery Guidance
    healthEducation: {
      pathology: {
        conditionNameEnglish: 'Gallstones & Laparoscopic Cholecystectomy Recovery',
        conditionNameHindi: 'पित्ताशय की पथरी व दूरबीन द्वारा ऑपरेशन (पित्ताशय निकालना)',
        specialty: 'GENERAL_SURGERY',
        howItArisesEnglish: 'Gallstones formed from hardened digestive bile deposits, causing acute inflammation and pain. Through minimally invasive laparoscopy, the diseased gallbladder and stones were excised. The liver continues producing bile directly into the small intestine.',
        howItArisesHindi: 'पित्त की थैली में कोलेस्ट्रॉल और लवण जमने से पथरी बन गई थी, जिससे असहनीय दर्द और सूजन हुई थी। दूरबीन (लेप्रोस्कोपी) तकनीक द्वारा पित्त की थैली को सुरक्षित निकाल दिया गया है। अब लिवर का पित्त सीधे आंतों में सामान्य रूप से पहुंचेगा।',
        keyUnderlyingFactors: ['Fatty food diet', 'Bile stasis', 'Metabolic factors'],
      },
      activity: {
        allowedActivitiesEnglish: [
          'Gentle walking indoors and in garden starting day of discharge',
          'Sitting upright in comfortable chair and light domestic mobility',
          'Gentle ankle and deep breathing exercises to prevent lung atelectasis',
        ],
        allowedActivitiesHindi: [
          'घर में और आंगन में आराम से हल्की सैर करें',
          'कुर्सी पर आराम से बैठें और हल्का घरेलू काम करें',
          'गहरे सांस लेने का हल्का अभ्यास करें',
        ],
        restrictedActivitiesEnglish: [
          'Strictly avoid lifting heavy objects (> 4 kg) for 3 weeks',
          'Avoid sudden bending at waist or straining abdominal muscles',
          'No driving motorized vehicles until suture removal is complete',
        ],
        restrictedActivitiesHindi: [
          '3 सप्ताह तक 4 किलो से अधिक भारी वजन बिल्कुल न उठाएं',
          'कमर से आगे झुकने या पेट पर जोर डालने से बचें',
          'टांके कटने तक दोपहिया या कार न चलाएं',
        ],
        recommendedDailyWalkingMinutes: 15,
        whenToStopExertionHindi: 'पेट में खिंचाव या तेज दर्द महसूस होते ही तुरंत लेटकर आराम करें।',
        whenToStopExertionEnglish: 'Stop exertion and rest immediately if you experience sharp abdominal pulling pain.',
      },
      homeCare: {
        dietaryGuidelinesHindi: [
          'शुरुआती 7 दिन बिल्कुल हल्का, नरम व सुपाच्य भोजन लें (दलिया, मूंग दाल खिचड़ी, उबली सब्जियां)',
          'तला-भुना, मसालेदार, समोसा, पूरी और अधिक तेल/घी बिल्कुल बंद रखें',
          'एक साथ भारी भोजन करने के बजाय दिन में 4-5 बार थोड़ा-थोड़ा खाएं',
        ],
        dietaryGuidelinesEnglish: [
          'Consume light, easily digestible meals for first week (porridge, moong dal khichdi, boiled vegetables)',
          'Strictly avoid deep-fried, oily, and heavy spicy foods',
          'Eat small, frequent meals rather than large heavy portions',
        ],
        woundOrSurgicalSiteCareHindi: 'नाभि और पेट के चारों चीरों (पोर्ट्स) पर लगी पट्टी को सूखा रखें। 5 दिन तक केवल गीले कपड़े से स्पंज बाथ करें, सीधा पानी न डालें।',
        woundOrSurgicalSiteCareEnglish: 'Keep all four laparoscopic port dressings dry. Sponge bath permitted for 5 days; avoid direct shower until sutures removed.',
        lifestyleAndHygieneHindi: 'कब्ज से बचने के लिए भरपूर पानी पिएं और रात को सिरप ड्युफालाक लें। शौच के समय जोर न लगाएं।',
        lifestyleAndHygieneEnglish: 'Ensure plenty of oral fluids to avoid constipation. Take Duphalac laxative at bedtime; do not strain.',
      },
      primaryCareVersusEmergency: {
        routineReliefStepsHindi: [
          'हल्का ऑपरेशन का दर्द होने पर खाने के बाद जीरोडोल-एसपी लें',
          'पेट में लेप्रोस्कोपी की गैस महसूस होने पर कमरे में धीरे-धीरे टहलें',
        ],
        routineReliefStepsEnglish: [
          'Take Zerodol-SP tablet after meals if experiencing surgical wound soreness',
          'Slow walking helps disperse residual laparoscopic carbon dioxide gas discomfort',
        ],
        emergencyActionStepsHindi: [
          '101°F से अधिक तेज बुखार, लगातार उल्टियां, या आँखों में पीलापन आने पर तुरंत इमरजेंसी आएं',
          'चीरे से खून का रिसाव होने पर अस्पताल की हेल्पलाइन पर संपर्क करें',
        ],
        emergencyActionStepsEnglish: [
          'Report immediately to emergency if fever > 101°F, intractable vomiting, or yellowing of eyes/jaundice occurs',
          'Contact surgical desk if active bleeding or soakage occurs from port dressings',
        ],
      },
    },
    // Universal Discharge Billing & Insurance Clearance
    billing: {
      items: [
        {
          id: 'b-rl-1',
          category: 'ROOM_AND_NURSING',
          description: 'Single Room & Inpatient Nursing Care (3 Days)',
          amount: 21000,
          isCoveredByInsurance: true,
        },
        {
          id: 'b-rl-2',
          category: 'SURGERY_OT_PROCEDURE',
          description: 'Laparoscopic Cholecystectomy OT Charges & Surgical Team Fees',
          amount: 55000,
          isCoveredByInsurance: true,
        },
        {
          id: 'b-rl-3',
          category: 'IMPLANTS_AND_CONSUMABLES',
          description: 'Laparoscopic Disposable Trocars, Titanium Clips & Harmonic Shears Kit',
          amount: 18500,
          isCoveredByInsurance: true,
        },
        {
          id: 'b-rl-4',
          category: 'DOCTOR_CONSULTATION',
          description: 'Senior Laparoscopic Surgeon Dr. A. Mathur Pre & Post-Op Visits',
          amount: 8000,
          isCoveredByInsurance: true,
        },
        {
          id: 'b-rl-5',
          category: 'INVESTIGATIONS_LAB_RAD',
          description: 'Pre-op Ultrasound Abdomen, Liver Function Series, CBC & Pre-anesthetic Workup',
          amount: 9200,
          isCoveredByInsurance: true,
        },
        {
          id: 'b-rl-6',
          category: 'HOSPITAL_PHARMACY',
          description: 'Inpatient IV Antibiotics, Analgesics & Sterile Dressings',
          amount: 6400,
          isCoveredByInsurance: true,
        },
        {
          id: 'b-rl-7',
          category: 'OWN_MEDICINE_RECONCILIATION',
          description: 'Credit: Patient Brought Pantoprazole Strip Reconciled & Returned',
          amount: -350,
          isCoveredByInsurance: false,
          notes: 'Credit adjusted in final settlement',
        },
      ],
      insurance: {
        tpaOrInsurerName: 'HDFC ERGO General Insurance (Cashless TPA)',
        policyOrClaimNumber: 'HDFC-SURG-2026-8819',
        preAuthApprovedAmount: 115000,
        totalHospitalBill: 117750,
        coPayAndDeductible: 2750,
        nonMedicalDeductions: 0,
        patientPayableAmount: 2750,
        settlementStatus: 'CLAIM_SETTLED_CASHLESS',
        tpaHelpdeskContact: 'Hospital TPA Counter Desk 3: 011-26515050 / Ext 110',
      },
      hasOwnMedicineCredits: true,
      clearanceNoteEnglish: 'HDFC ERGO cashless claim of ₹1,15,000 cleared. Co-pay balance ₹2,750 settled at cashier desk. Hospital gate pass issued.',
      clearanceNoteHindi: 'एचडीएफसी एर्गो द्वारा ₹1,15,000 का कैशलेस भुगतान स्वीकृत। बाकी ₹2,750 चुकता कर गेट पास जारी किया गया।',
    },
    blockers: [],
    approvalMetadata: {
      approvedByNurseId: 'NURSE-DELHI-442',
      approvedByNurseName: 'Sister Anjali Sharma (Senior Discharge Nurse)',
      approvalTimestamp: '2026-10-09T18:30:00.000Z',
      cryptographicHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      templateVersion: 'GHARCARE-AAYU-2026-V1.2',
    },
    // ABDM & Ayushman Bharat Integration Rails:
    abhaNumber: '91-9938-1204-7721',
    abhaAddress: 'ratan.lal@abdm',
    abdmComplianceStatus: 'LINKED_VERIFIED',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};
