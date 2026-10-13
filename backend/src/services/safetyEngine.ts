import { DischargeCase, BlockerIssue, ExtractedMedication } from '../types';

/**
 * High-alert medication list (ISMP & Indian clinical guidelines)
 */
const HIGH_ALERT_KEYWORDS = [
  'warfarin',
  'insulin',
  'digoxin',
  'methotrexate',
  'heparin',
  'clopidogrel',
  'potassium chloride',
  'lithium',
];

export function evaluateClinicalSafetyRules(dischargeCase: DischargeCase): BlockerIssue[] {
  const blockers: BlockerIssue[] = [];

  dischargeCase.medications.forEach((med: ExtractedMedication, idx: number) => {
    const medName = med.brandName?.value || med.saltName?.value || `Medicine #${idx + 1}`;

    // Rule 1: Prescribed dose quantity must exist (Strength is NOT Dose)
    if (!med.prescribedDose?.value || med.prescribedDose.value.trim() === '') {
      blockers.push({
        id: `blk-dose-${med.id}`,
        code: 'PRESCRIBED_DOSE_MISSING',
        severity: 'CRITICAL',
        medicationId: med.id,
        messageEnglish: `Prescribed dose quantity is missing for ${medName} (e.g. "1 Tablet", "5 ml"). Strength "${med.strength?.value || 'N/A'}" alone is not a dose.`,
        messageHindi: `${medName} के लिए खुराक की मात्रा (जैसे 1 गोली, 5 मिली) गायब है। केवल शक्ति ("${med.strength?.value || 'N/A'}") पर्याप्त नहीं है।`,
        isResolved: false,
      });
    }

    // Rule 2: SOS frequency requires explicit clinical trigger condition
    if (med.frequency?.value === 'SOS') {
      if (!med.sosCondition?.value || med.sosCondition.value.trim() === '') {
        blockers.push({
          id: `blk-sos-${med.id}`,
          code: 'SOS_CONDITION_REQUIRED',
          severity: 'CRITICAL',
          medicationId: med.id,
          messageEnglish: `SOS (as-needed) medication ${medName} requires an explicit trigger condition (e.g., "for severe headache" or "for fever > 100°F").`,
          messageHindi: `ज़रूरत पड़ने पर (SOS) ली जाने वाली दवा ${medName} के लिए कारण (जैसे 'तेज़ सिरदर्द होने पर') दर्ज करना अनिवार्य है।`,
          isResolved: false,
        });
      }
    }

    // Rule 3: Confirmed time slots must match explicit frequency notation
    const expectedCounts: Record<string, number> = {
      OD: 1,
      BD: 2,
      TDS: 3,
      QID: 4,
    };

    const freq = med.frequency?.value;
    if (freq && expectedCounts[freq]) {
      const requiredSlots = expectedCounts[freq];
      const assignedSlots = med.timeSlots ? med.timeSlots.length : 0;
      if (assignedSlots !== requiredSlots) {
        blockers.push({
          id: `blk-slot-${med.id}`,
          code: 'TIME_SLOTS_INCOMPLETE',
          severity: 'CRITICAL',
          medicationId: med.id,
          messageEnglish: `${medName} is prescribed ${freq} (${requiredSlots} times/day) but has ${assignedSlots} confirmed time slot(s). Staff must designate exact morning/afternoon/night slots.`,
          messageHindi: `${medName} दिन में ${requiredSlots} बार (${freq}) लेनी है, लेकिन केवल ${assignedSlots} समय तय हैं। कृपया सुबह/दोपहर/रात का समय सुनिश्चित करें।`,
          isResolved: false,
        });
      }
    }

    // Rule 4: High-Alert Drug identification
    const lowerName = (med.brandName?.value || '').toLowerCase() + ' ' + (med.saltName?.value || '').toLowerCase();
    const isHighAlert = HIGH_ALERT_KEYWORDS.some((kw) => lowerName.includes(kw));
    if (isHighAlert && !med.isHighAlertDrug) {
      med.isHighAlertDrug = true;
      blockers.push({
        id: `blk-highalert-${med.id}`,
        code: 'HIGH_ALERT_DRUG_CONFIRMATION',
        severity: 'WARNING',
        medicationId: med.id,
        messageEnglish: `High-alert medication detected: ${medName}. Requires explicit double-check with doctor orders and family counseling.`,
        messageHindi: `विशेष सावधानी वाली दवा (High Alert): ${medName}। खुराक और समय की विशेष जांच आवश्यक है।`,
        isResolved: false,
      });
    }
  });

  // Rule 5: Follow-up review date validation
  if (!dischargeCase.followUp?.reviewDate?.value || dischargeCase.followUp.reviewDate.value.trim() === '') {
    blockers.push({
      id: 'blk-followup-missing',
      code: 'FOLLOW_UP_DATE_MISSING',
      severity: 'WARNING',
      messageEnglish: 'Discharge document specifies relative follow-up without confirmed calendar date.',
      messageHindi: 'मरीज़ के लिए दोबारा अस्पताल आने (फॉलो-अप) की निश्चित तारीख दर्ज नहीं है।',
      isResolved: false,
    });
  }

  // Rule 6: Vitals tracking must have scheduled slots if tracking is prescribed
  if (dischargeCase.vitalsAdvice?.itemsToTrack && dischargeCase.vitalsAdvice.itemsToTrack.length > 0) {
    dischargeCase.vitalsAdvice.itemsToTrack.forEach((vital) => {
      if (!vital.scheduledSlots || vital.scheduledSlots.length === 0) {
        blockers.push({
          id: `blk-vital-slot-${vital.id}`,
          code: 'VITALS_SCHEDULE_SLOT_MISSING',
          severity: 'WARNING',
          messageEnglish: `Monitoring for ${vital.displayNameEnglish} is advised but specific measurement time slots (e.g., Morning / Evening) are not set.`,
          messageHindi: `${vital.displayNameHindi} की जांच लिखी गई है परंतु निश्चित समय (सुबह/शाम) तय नहीं है।`,
          isResolved: false,
        });
      }
    });
  }

  // Rule 7: Advised follow-up tests should have clear target timeline
  if (dischargeCase.diagnosisDetails?.advisedFollowUpTests) {
    dischargeCase.diagnosisDetails.advisedFollowUpTests.forEach((test, idx) => {
      if (!test.targetDueTimeline || test.targetDueTimeline.trim() === '') {
        blockers.push({
          id: `blk-test-timeline-${idx}`,
          code: 'FOLLOWUP_TEST_TIMELINE_MISSING',
          severity: 'WARNING',
          messageEnglish: `Follow-up diagnostic test "${test.testName}" requires an explicit due timeline (e.g. "Before 2-week review").`,
          messageHindi: `फॉलो-अप जांच "${test.testName}" के लिए समय सीमा निर्धारित नहीं है।`,
          isResolved: false,
        });
      }
    });
  }

  // Rule 8: Insurance settlement status alert if pending clearance
  if (dischargeCase.billing?.insurance?.settlementStatus === 'PENDING_TPA_CLEARANCE') {
    blockers.push({
      id: 'blk-billing-tpa-pending',
      code: 'INSURANCE_TPA_PENDING',
      severity: 'WARNING',
      messageEnglish: 'Discharge billing shows Cashless TPA settlement is still pending final approval. Verify before final release.',
      messageHindi: 'बीमा टीपीए (TPA) से अंतिम कैशलेस स्वीकृति अभी बाकी है। कृपया रिलीज से पहले पुष्टि करें।',
      isResolved: false,
    });
  }

  return blockers;
}

/**
 * Re-computes case state based on blockers and current status
 */
export function recomputeCaseStatus(dischargeCase: DischargeCase): void {
  if (dischargeCase.status === 'APPROVED_LOCKED') {
    return; // Already approved
  }

  const criticalUnresolved = dischargeCase.blockers.filter(
    (b) => b.severity === 'CRITICAL' && !b.isResolved
  );

  if (criticalUnresolved.length > 0) {
    dischargeCase.status = 'NEEDS_REVIEW';
  } else {
    dischargeCase.status = 'READY_FOR_APPROVAL';
  }
}
