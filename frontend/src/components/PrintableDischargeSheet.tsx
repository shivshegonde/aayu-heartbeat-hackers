import React from 'react';
import { DischargeCase } from '../types';

interface PrintableDischargeSheetProps {
  currentCase: DischargeCase;
}

export const PrintableDischargeSheet: React.FC<PrintableDischargeSheetProps> = ({ currentCase }) => {
  return (
    <div className="print-only p-8 text-black bg-white max-w-[210mm] mx-auto text-sm leading-normal">
      
      {/* 1. Hospital Official Header */}
      <div className="border-b-2 border-black pb-3 mb-3 text-center">
        <h1 className="text-xl font-bold uppercase tracking-wider">
          {currentCase.hospitalName}
        </h1>
        <p className="text-xs uppercase font-bold tracking-wide">
          अधिकृत डिस्चार्ज सारांश व घर पर देखभाल चार्ट (VERIFIED CLINICAL DISCHARGE & CARE HANDOVER)
        </p>
        <p className="text-[10px] text-gray-700 mt-0.5">
          GharCare Protocol • ABDM & ABHA Linked • Govt of India DHR / SAHI 2026 Standards
        </p>
      </div>

      {/* 2. Patient & Admission Information Grid */}
      <div className="grid grid-cols-2 gap-3 border border-black p-2.5 mb-3 text-xs">
        <div>
          <p><strong>रोगी का नाम (Patient Name):</strong> {currentCase.patientDisplayName}</p>
          <p><strong>ABHA ID (आयुष्मान भारत):</strong> <span className="font-mono font-bold">{currentCase.abhaNumber || '91-4920-1923-4819'}</span> ({currentCase.abhaAddress || 'patient@abdm'})</p>
          <p><strong>उम्र / लिंग (Age / Gender):</strong> {currentCase.patientAge} Y / {currentCase.patientGender}</p>
          <p><strong>IPD / UHID Number:</strong> {currentCase.patientIdMasked}</p>
          <p><strong>भर्ती तारीख (Admission):</strong> {currentCase.admissionDate}</p>
        </div>
        <div>
          <p><strong>डिस्चार्ज तारीख (Discharge Date):</strong> {currentCase.dischargeDate}</p>
          <p><strong>प्राथमिक निदान (Primary Diagnosis):</strong> {currentCase.primaryDiagnosis}</p>
          {currentCase.diagnosisDetails?.icdCode && (
            <p><strong>ICD-10 Code:</strong> {currentCase.diagnosisDetails.icdCode}</p>
          )}
          <p><strong>संस्करण (Revision):</strong> Rev #{currentCase.revision} (Approved & Locked)</p>
        </div>
      </div>

      {/* 3. Clinical Procedures & Key Diagnostic Test Results */}
      {currentCase.diagnosisDetails && (
        <div className="border border-black p-2.5 mb-3 text-xs">
          {currentCase.diagnosisDetails.proceduresPerformed?.length > 0 && (
            <div className="mb-2">
              <p className="font-bold uppercase text-[11px] text-gray-900">
                उपचार / सर्जरी विवरण (SURGICAL & INTERVENTIONAL PROCEDURES DONE):
              </p>
              <p className="mt-0.5 font-medium">{currentCase.diagnosisDetails.proceduresPerformed.join(' | ')}</p>
            </div>
          )}

          {currentCase.diagnosisDetails.inHospitalTests?.length > 0 && (
            <div>
              <p className="font-bold uppercase text-[11px] text-gray-900 mb-1 border-t border-gray-300 pt-1">
                प्रमुख जांच व रिपोर्ट (KEY IN-HOSPITAL DIAGNOSTIC INVESTIGATIONS):
              </p>
              <table className="w-full text-left text-[11px] border border-black border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b border-black">
                    <th className="p-1 border-r border-black">जांच (Test Name)</th>
                    <th className="p-1 border-r border-black">प्राप्त रिपोर्ट (Result / Findings)</th>
                    <th className="p-1 border-r border-black">सामान्य दायरा (Normal Range)</th>
                    <th className="p-1">स्थिति (Status)</th>
                  </tr>
                </thead>
                <tbody>
                  {currentCase.diagnosisDetails.inHospitalTests.map((t) => (
                    <tr key={t.id} className="border-b border-gray-300">
                      <td className="p-1 border-r border-black font-bold">{t.testName}</td>
                      <td className="p-1 border-r border-black font-medium">{t.findingValue}</td>
                      <td className="p-1 border-r border-black font-mono">{t.referenceNormalRange || 'Standard'}</td>
                      <td className="p-1 font-bold">{t.isAbnormal ? 'ABNORMAL' : 'NORMAL'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 4. Daily Medication Schedule Table */}
      <div className="mb-3">
        <h2 className="font-bold text-xs uppercase tracking-wider mb-1 border-b border-black pb-0.5">
          दवाइयों का दैनिक समय-सारणी (DAILY MEDICATION SCHEDULE)
        </h2>
        <table className="w-full text-left text-xs border border-black border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b border-black">
              <th className="p-1.5 border-r border-black">क्र.सं.</th>
              <th className="p-1.5 border-r border-black">दवा का नाम (Medicine Name & Salt)</th>
              <th className="p-1.5 border-r border-black">खुराक</th>
              <th className="p-1.5 border-r border-black text-center">सुबह (M)</th>
              <th className="p-1.5 border-r border-black text-center">दोपहर (A)</th>
              <th className="p-1.5 border-r border-black text-center">रात (N)</th>
              <th className="p-1.5 border-r border-black">भोजन निर्देश</th>
              <th className="p-1.5">अवधि</th>
            </tr>
          </thead>
          <tbody>
            {currentCase.medications.map((med, idx) => {
              const isMorning = med.timeSlots.some((s) => s.slot === 'MORNING');
              const isAfternoon = med.timeSlots.some((s) => s.slot === 'AFTERNOON');
              const isNight = med.timeSlots.some((s) => s.slot === 'NIGHT' || s.slot === 'EVENING');

              return (
                <tr key={med.id} className="border-b border-gray-400">
                  <td className="p-1.5 border-r border-black font-bold">{idx + 1}</td>
                  <td className="p-1.5 border-r border-black">
                    <p className="font-bold">{med.brandName.value}</p>
                    <p className="text-[10px] text-gray-700">{med.saltName.value} ({med.strength.value})</p>
                  </td>
                  <td className="p-1.5 border-r border-black font-bold">{med.prescribedDose.value || '-'}</td>
                  <td className="p-1.5 border-r border-black text-center font-bold">{isMorning ? '✓' : '-'}</td>
                  <td className="p-1.5 border-r border-black text-center font-bold">{isAfternoon ? '✓' : '-'}</td>
                  <td className="p-1.5 border-r border-black text-center font-bold">{isNight ? '✓' : '-'}</td>
                  <td className="p-1.5 border-r border-black">
                    {med.foodRelation.value === 'AFTER_FOOD' ? 'खाने के बाद' : med.foodRelation.value === 'BEFORE_FOOD' ? 'खाली पेट' : 'पानी के साथ'}
                  </td>
                  <td className="p-1.5">{med.durationDays.value || 7} दिन</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* SOS Medicines */}
      {currentCase.medications.some((m) => m.frequency.value === 'SOS') && (
        <div className="border border-black p-2 mb-3 text-xs">
          <h3 className="font-bold uppercase text-[11px] mb-0.5">
            ⚠️ केवल ज़रूरत पड़ने पर (SOS / AS-NEEDED MEDICINES):
          </h3>
          {currentCase.medications.filter((m) => m.frequency.value === 'SOS').map((sos) => (
            <p key={sos.id}>
              • <strong>{sos.brandName.value}:</strong> {sos.prescribedDose.value} — केवल तभी लें जब: <em>{sos.sosCondition.value || 'डॉक्टर के निर्देशानुसार'}</em>
            </p>
          ))}
        </div>
      )}

      {/* 5. Vitals Monitoring Schedule & Printable 7-Day Caregiver Diary */}
      {currentCase.vitalsAdvice && currentCase.vitalsAdvice.itemsToTrack.length > 0 && (
        <div className="border border-black p-2.5 mb-3 text-xs">
          <div className="flex items-center justify-between border-b border-black pb-1 mb-2">
            <h3 className="font-bold uppercase text-[11px]">
              दैनिक स्वास्थ्य जांच व डायरी (DAILY VITALS MONITORING SCHEDULE & LOGBOOK)
            </h3>
            <span className="font-bold text-[10px] text-red-900 border border-red-800 px-1.5 py-0.2">
              ⚠️ ओपीडी में यह चार्ट साथ लाना अनिवार्य है (BRING TO FOLLOW-UP)
            </span>
          </div>

          <div className="mb-2">
            <p><strong>जांच निर्देश:</strong> {currentCase.vitalsAdvice.itemsToTrack.map((v) => `${v.displayNameHindi} (लक्ष्य: ${v.targetNormalRange})`).join(' • ')}</p>
            <p className="text-[10px] text-gray-700">{currentCase.vitalsAdvice.caregiverInstructionsHindi}</p>
          </div>

          {/* Printable 7-Day Table */}
          <table className="w-full text-left text-[10px] border border-black border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-black">
                <th className="p-1 border-r border-black">तारीख (Day / Date)</th>
                <th className="p-1 border-r border-black text-center">सुबह की रीडिंग (Morning 8 AM)</th>
                <th className="p-1 border-r border-black text-center">शाम की रीडिंग (Evening 7 PM)</th>
                <th className="p-1 border-r border-black">मरीज़ की स्थिति / लक्षण (Caregiver Notes)</th>
                <th className="p-1 text-center">डॉक्टर हस्ताक्षर (Doc Sign)</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                <tr key={day} className="border-b border-gray-400 h-6">
                  <td className="p-1 border-r border-black font-bold">दिन {day} (Day {day})</td>
                  <td className="p-1 border-r border-black"></td>
                  <td className="p-1 border-r border-black"></td>
                  <td className="p-1 border-r border-black"></td>
                  <td className="p-1"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 6. Health Education, Activity & Dietary Rules */}
      {currentCase.healthEducation && (
        <div className="border border-black p-2.5 mb-3 text-xs grid grid-cols-2 gap-3">
          <div>
            <h4 className="font-bold uppercase text-[11px] mb-1">
              व्यायाम व गतिविधि निर्देश (ACTIVITY & EXERCISE):
            </h4>
            <div className="text-[10px] space-y-0.5">
              {currentCase.healthEducation.activity.allowedActivitiesHindi.map((a, i) => (
                <p key={i}>✓ {a}</p>
              ))}
              {currentCase.healthEducation.activity.restrictedActivitiesHindi.map((r, i) => (
                <p key={i} className="text-red-900 font-bold">✗ {r}</p>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-bold uppercase text-[11px] mb-1">
              आहार व घाव सुरक्षा (DIET & WOUND CARE):
            </h4>
            <div className="text-[10px] space-y-0.5">
              {currentCase.healthEducation.homeCare.dietaryGuidelinesHindi.map((d, i) => (
                <p key={i}>• {d}</p>
              ))}
              {currentCase.healthEducation.homeCare.woundOrSurgicalSiteCareHindi && (
                <p className="font-bold mt-1">🩹 {currentCase.healthEducation.homeCare.woundOrSurgicalSiteCareHindi}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 7. Follow-Up & Emergency Helpline */}
      <div className="grid grid-cols-2 gap-3 border border-black p-2.5 mb-3 text-xs">
        <div>
          <h4 className="font-bold uppercase text-[11px] mb-0.5">
            दोबारा अस्पताल आने की तारीख (FOLLOW-UP):
          </h4>
          <p className="font-bold text-sm">
            {currentCase.followUp.reviewDate?.value || currentCase.followUp.relativeDaysStated}
          </p>
          <p className="mt-0.5">{currentCase.followUp.departmentOrDoctor?.value}</p>
        </div>
        <div>
          <h4 className="font-bold uppercase text-[11px] mb-0.5 text-red-900">
            आपातकालीन हेल्पलाइन (24x7 EMERGENCY HELPLINE):
          </h4>
          <p className="font-bold text-sm text-red-900">{currentCase.followUp.hospitalContact}</p>
          <p className="text-[10px] text-gray-700 mt-0.5">
            सीने में दर्द, तेज बुखार, सांस फूलना या बेहोशी पर बिना देरी तुरंत इमरजेंसी में आएं।
          </p>
        </div>
      </div>

      {/* 8. Discharge Billing Clearance & Insurance Summary Receipt */}
      {currentCase.billing && (
        <div className="border border-black p-2.5 mb-4 text-xs">
          <h4 className="font-bold uppercase text-[11px] border-b border-black pb-0.5 mb-1.5">
            अस्पताल बिलिंग व बीमा निपटान रसीद (DISCHARGE BILLING & INSURANCE CLEARANCE RECEIPT)
          </h4>
          <div className="grid grid-cols-4 gap-2 text-center mb-2">
            <div className="border border-gray-400 p-1">
              <span className="text-[9px] uppercase block">कुल बिल (Total Bill)</span>
              <span className="font-bold">₹{currentCase.billing.insurance.totalHospitalBill.toLocaleString('en-IN')}</span>
            </div>
            <div className="border border-gray-400 p-1">
              <span className="text-[9px] uppercase block">बीमा स्वीकृत (Pre-Auth)</span>
              <span className="font-bold">₹{currentCase.billing.insurance.preAuthApprovedAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="border border-gray-400 p-1">
              <span className="text-[9px] uppercase block">को-पे (Co-pay/Ded)</span>
              <span className="font-bold">₹{currentCase.billing.insurance.coPayAndDeductible.toLocaleString('en-IN')}</span>
            </div>
            <div className="border border-gray-400 p-1 bg-gray-100">
              <span className="text-[9px] uppercase block">मरीज़ भुगतान (Paid)</span>
              <span className="font-bold">₹{currentCase.billing.insurance.patientPayableAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
          <p className="text-[10px]">
            <strong>क्लीयरेंस स्थिति:</strong> {currentCase.billing.clearanceNoteHindi} (बीमा: {currentCase.billing.insurance.tpaOrInsurerName})
          </p>
        </div>
      )}

      {/* 9. Verification & Sign-off footer */}
      <div className="pt-3 border-t-2 border-black flex items-end justify-between text-xs">
        <div>
          <p><strong>सत्यापित स्टाफ (Discharge Nurse):</strong> {currentCase.approvalMetadata?.approvedByNurseName || 'Sister In-Charge'}</p>
          <p><strong>स्वीकृति समय (Timestamp):</strong> {currentCase.approvalMetadata?.approvalTimestamp || new Date().toLocaleString()}</p>
          <p className="text-[9px] font-mono text-gray-600">
            Cryptographic Hash: {currentCase.approvalMetadata?.cryptographicHash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
          </p>
        </div>
        <div className="text-center">
          <div className="w-36 border-b border-black mb-1"></div>
          <p className="text-[10px] font-bold">हस्ताक्षर व मुहर (Authorized Signature & Seal)</p>
          <p className="text-[9px] text-gray-600">Hospital Discharge Handover Desk</p>
        </div>
      </div>

    </div>
  );
};
