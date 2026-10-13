import React, { useState } from 'react';
import axios from 'axios';
import { DischargeCase, CaseListItem, ExtractedMedication } from '../types';
import { BlockerAlerts } from './BlockerAlerts';

interface ReviewCockpitProps {
  currentCase: DischargeCase;
  onCaseUpdated: (c: DischargeCase) => void;
  onNavigateToFamilyPlan: () => void;
  caseList?: CaseListItem[];
  onSelectCase?: (caseId: string) => void;
}

export const ReviewCockpit: React.FC<ReviewCockpitProps> = ({
  currentCase,
  onCaseUpdated,
  onNavigateToFamilyPlan,
}) => {
  const [hoveredMedId, setHoveredMedId] = useState<string | null>(null);
  const [mobileCockpitTab, setMobileCockpitTab] = useState<'meds' | 'doc'>('meds');
  const [activeReviewSection, setActiveReviewSection] = useState<'all' | 'kanban' | 'meds' | 'diagnosis' | 'vitals' | 'billing'>('kanban');
  const [isApproving, setIsApproving] = useState(false);
  const [nurseName] = useState('Sister Anjali Sharma (Senior Discharge Nurse)');
  const [nurseId] = useState('NURSE-DELHI-442');

  const unresolvedCritical = currentCase.blockers.filter(
    (b) => b.severity === 'CRITICAL' && !b.isResolved
  ).length;

  const isApproved = currentCase.status === 'APPROVED_LOCKED';

  const handleApprove = async () => {
    try {
      setIsApproving(true);
      const res = await axios.post<{ approvedCase: DischargeCase }>(
        `/api/cases/${currentCase.caseId}/approve`,
        { nurseId, nurseName }
      );
      if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
        navigator.vibrate([40, 60, 40]);
      }
      onCaseUpdated(res.data.approvedCase);
      setTimeout(() => {
        onNavigateToFamilyPlan();
      }, 500);
    } catch (e: any) {
      alert('Approval failed: ' + (e.response?.data?.error || e.message));
    } finally {
      setIsApproving(false);
    }
  };

  // Group medications into Kanban lanes
  const blockerMeds = currentCase.medications.filter((m) => !m.prescribedDose?.value);
  const toVerifyMeds = currentCase.medications.filter((m) => m.prescribedDose?.value && !isApproved);
  const verifiedMeds = isApproved ? currentCase.medications : [];

  return (
    <div className="max-w-[1560px] 2xl:max-w-[1680px] w-full mx-auto px-3 sm:px-6 py-5 sm:py-7 font-sans">
      
      {/* 1. Patient & Case Master Hero Banner */}
      <div className="vitals-card vitals-spotlight p-5 sm:p-7 mb-6 border border-vitals-border">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="vitals-chip text-[10px]">
                IPD: {currentCase.patientIdMasked}
              </span>
              <span className="vitals-chip text-[10px]">
                REV #{currentCase.revision}
              </span>
              <span className="vitals-chip vitals-chip-pulse text-[10px]">
                ABHA: {currentCase.abhaNumber || '91-4920-1923-4819'}
              </span>
              {currentCase.diagnosisDetails?.icdCode && (
                <span className="vitals-chip text-[10px] text-vitals-ink font-bold">
                  ICD: {currentCase.diagnosisDetails.icdCode}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-baseline gap-3">
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-vitals-ink tracking-tight">
                {currentCase.patientDisplayName}
              </h1>
              <span className="text-sm font-mono text-vitals-muted">
                ({currentCase.patientAge} Y / {currentCase.patientGender})
              </span>
            </div>

            <p className="text-xs sm:text-sm text-vitals-muted mt-1 font-medium">
              <strong className="text-vitals-ink">Primary Diagnosis: </strong>
              {currentCase.primaryDiagnosis}
            </p>

            <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-vitals-faint">
              <span>Hospital: <strong className="text-vitals-ink">{currentCase.hospitalName}</strong></span>
              <span>•</span>
              <span>Discharge Date: <strong className="text-vitals-ink">{currentCase.dischargeDate}</strong></span>
            </div>
          </div>

          {/* Status Seal / Holographic Badge */}
          <div className="shrink-0 self-start md:self-center">
            {isApproved ? (
              <div className="holo-seal px-4 py-2.5 rounded-card flex items-center gap-3">
                <span className="pulsing-dot" />
                <div>
                  <span className="font-display font-bold text-xs text-pulse-mint block uppercase tracking-wider">
                    SHA-256 Verified Seal
                  </span>
                  <span className="font-mono text-[10px] text-vitals-ink block">
                    Signed by {currentCase.approvalMetadata?.approvedByNurseName || nurseName}
                  </span>
                </div>
              </div>
            ) : unresolvedCritical > 0 ? (
              <div className="p-3 rounded-card bg-signal-red/15 border border-signal-red blocker-glow flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-signal-red animate-ping" />
                <div>
                  <span className="font-display font-bold text-xs text-signal-red block uppercase">
                    Release Blocked
                  </span>
                  <span className="font-mono text-[10px] text-vitals-ink block">
                    {unresolvedCritical} Blocker Action(s) Required
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-card bg-pulse-mint/10 border border-pulse-mint/30 flex items-center gap-3">
                <span className="pulsing-dot" />
                <div>
                  <span className="font-display font-bold text-xs text-pulse-mint block uppercase">
                    Ready for Approval
                  </span>
                  <span className="font-mono text-[10px] text-vitals-muted block">
                    Awaiting nurse signature
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Critical Blocker Alerts Bar */}
      <BlockerAlerts currentCase={currentCase} onCaseUpdated={onCaseUpdated} />

      {/* 3. Section Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6">
        <button
          type="button"
          onClick={() => setActiveReviewSection('kanban')}
          className={`px-3.5 py-1.5 rounded-chip text-xs font-mono font-bold border transition-colors cursor-pointer ${
            activeReviewSection === 'kanban'
              ? 'bg-pulse-mint text-black border-pulse-mint shadow-[0_0_12px_rgba(59,245,137,0.2)]'
              : 'bg-vitals-surface2 text-vitals-muted border-vitals-border hover:text-vitals-ink'
          }`}
        >
          KANBAN LANES (VERIFICATION)
        </button>
        <button
          type="button"
          onClick={() => setActiveReviewSection('all')}
          className={`px-3.5 py-1.5 rounded-chip text-xs font-mono font-bold border transition-colors cursor-pointer ${
            activeReviewSection === 'all'
              ? 'bg-pulse-mint text-black border-pulse-mint'
              : 'bg-vitals-surface2 text-vitals-muted border-vitals-border hover:text-vitals-ink'
          }`}
        >
          FULL AUDIT (ALL)
        </button>
        <button
          type="button"
          onClick={() => setActiveReviewSection('meds')}
          className={`px-3.5 py-1.5 rounded-chip text-xs font-mono font-bold border transition-colors cursor-pointer ${
            activeReviewSection === 'meds'
              ? 'bg-pulse-mint text-black border-pulse-mint'
              : 'bg-vitals-surface2 text-vitals-muted border-vitals-border hover:text-vitals-ink'
          }`}
        >
          MEDICATIONS ({currentCase.medications.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveReviewSection('diagnosis')}
          className={`px-3.5 py-1.5 rounded-chip text-xs font-mono font-bold border transition-colors cursor-pointer ${
            activeReviewSection === 'diagnosis'
              ? 'bg-pulse-mint text-black border-pulse-mint'
              : 'bg-vitals-surface2 text-vitals-muted border-vitals-border hover:text-vitals-ink'
          }`}
        >
          DIAGNOSIS & TESTS
        </button>
        <button
          type="button"
          onClick={() => setActiveReviewSection('vitals')}
          className={`px-3.5 py-1.5 rounded-chip text-xs font-mono font-bold border transition-colors cursor-pointer ${
            activeReviewSection === 'vitals'
              ? 'bg-pulse-mint text-black border-pulse-mint'
              : 'bg-vitals-surface2 text-vitals-muted border-vitals-border hover:text-vitals-ink'
          }`}
        >
          VITALS TRACKING
        </button>
        <button
          type="button"
          onClick={() => setActiveReviewSection('billing')}
          className={`px-3.5 py-1.5 rounded-chip text-xs font-mono font-bold border transition-colors cursor-pointer ${
            activeReviewSection === 'billing'
              ? 'bg-pulse-mint text-black border-pulse-mint'
              : 'bg-vitals-surface2 text-vitals-muted border-vitals-border hover:text-vitals-ink'
          }`}
        >
          BILLING & INSURANCE
        </button>
      </div>

      {/* Mobile Toggle */}
      <div className="flex lg:hidden bg-vitals-surface2 p-1 rounded-card mb-4 border border-vitals-border">
        <button
          type="button"
          onClick={() => setMobileCockpitTab('meds')}
          className={`flex-1 py-2 text-xs font-mono font-bold rounded-input ${
            mobileCockpitTab === 'meds' ? 'bg-vitals-surface1 text-pulse-mint' : 'text-vitals-muted'
          }`}
        >
          Cockpit Lanes
        </button>
        <button
          type="button"
          onClick={() => setMobileCockpitTab('doc')}
          className={`flex-1 py-2 text-xs font-mono font-bold rounded-input ${
            mobileCockpitTab === 'doc' ? 'bg-vitals-surface1 text-pulse-mint' : 'text-vitals-muted'
          }`}
        >
          Source Document Scan
        </button>
      </div>

      {/* 4. Split-Screen Review Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Spatial Document Scan Grounding (5 cols) */}
        <div
          className={`lg:col-span-5 vitals-card p-5 flex flex-col sticky top-20 ${
            mobileCockpitTab === 'doc' ? 'block' : 'hidden lg:flex'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-vitals-border mb-3">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-vitals-ink">
              Spatial Document Grounding
            </span>
            <span className="font-mono text-[10px] text-vitals-muted px-2 py-0.5 rounded-chip bg-vitals-surface2 border border-vitals-border">
              {currentCase.sourceDocumentName}
            </span>
          </div>

          <p className="text-[11px] font-mono text-vitals-muted mb-2">
            Hover prescription rows to trace spatial bounding coordinates:
          </p>

          <div className="bg-black/40 border border-vitals-border rounded-input p-4 font-mono text-xs leading-relaxed text-vitals-ink overflow-y-auto max-h-[640px] select-text">
            <div className="text-center pb-2.5 border-b border-vitals-border mb-3 text-vitals-muted text-[11px]">
              <p className="font-bold uppercase tracking-wider text-vitals-ink">
                {currentCase.hospitalName}
              </p>
              <p className="text-[10px] text-vitals-faint">
                CLINICAL DISCHARGE SUMMARY TRANSCRIPT
              </p>
            </div>

            <div className="space-y-2 whitespace-pre-wrap text-xs text-vitals-muted font-mono">
              {currentCase.ocrTextSnapshot || 'Loading document OCR snapshot...'}
            </div>

            {/* Active Grounding Quote Highlight */}
            {hoveredMedId && (
              <div className="mt-3 p-3 rounded-input border border-pulse-mint bg-pulse-mint/10 text-xs">
                <span className="font-mono text-[10px] font-bold text-pulse-mint block uppercase">
                  Spatial OCR Grounding:
                </span>
                <p className="font-mono text-vitals-ink mt-1">
                  "{currentCase.medications.find((m) => m.id === hoveredMedId)?.brandName?.provenance?.rawQuote || 'Matched line item'}"
                </p>
                <span className="font-mono text-[10px] text-pulse-mint font-bold block mt-1">
                  [✓ Confidence: {((currentCase.medications.find((m) => m.id === hoveredMedId)?.brandName?.provenance?.confidenceScore || 0.984) * 100).toFixed(1)}%]
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Kanban Lanes / Clinical Review Cards (7 cols) */}
        <div className={`lg:col-span-7 space-y-6 ${mobileCockpitTab === 'meds' ? 'block' : 'hidden lg:block'}`}>
          
          {/* Section: Kanban-Style Lanes (Blockers / To Verify / Signed Off) */}
          {activeReviewSection === 'kanban' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                
                {/* Lane 1: Blockers */}
                <div className="p-3.5 rounded-card bg-vitals-surface1 border border-vitals-border space-y-2.5">
                  <div className="flex items-center justify-between pb-2 border-b border-vitals-border">
                    <span className="font-bold text-signal-red">BLOCKERS</span>
                    <span className="px-1.5 py-0.2 rounded bg-signal-red/20 text-signal-red text-[10px]">
                      {blockerMeds.length}
                    </span>
                  </div>
                  {blockerMeds.length > 0 ? (
                    blockerMeds.map((m) => (
                      <div key={m.id} className="p-2.5 rounded-input bg-signal-red/10 border border-signal-red blocker-glow">
                        <span className="font-bold text-vitals-ink block">{m.brandName?.value}</span>
                        <span className="text-[10px] text-signal-red block mt-0.5">Dose missing</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-[11px] text-vitals-faint italic">No blockers</p>
                  )}
                </div>

                {/* Lane 2: To Verify */}
                <div className="p-3.5 rounded-card bg-vitals-surface1 border border-vitals-border space-y-2.5">
                  <div className="flex items-center justify-between pb-2 border-b border-vitals-border">
                    <span className="font-bold text-signal-amber">TO VERIFY</span>
                    <span className="px-1.5 py-0.2 rounded bg-signal-amber/20 text-signal-amber text-[10px]">
                      {toVerifyMeds.length}
                    </span>
                  </div>
                  {toVerifyMeds.length > 0 ? (
                    toVerifyMeds.map((m) => (
                      <div key={m.id} className="p-2.5 rounded-input bg-vitals-surface2 border border-vitals-border">
                        <span className="font-bold text-vitals-ink block">{m.brandName?.value}</span>
                        <span className="text-[10px] text-pulse-mint block mt-0.5">{m.prescribedDose?.value}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-[11px] text-vitals-faint italic">All verified</p>
                  )}
                </div>

                {/* Lane 3: Signed Off */}
                <div className="p-3.5 rounded-card bg-vitals-surface1 border border-vitals-border space-y-2.5">
                  <div className="flex items-center justify-between pb-2 border-b border-vitals-border">
                    <span className="font-bold text-pulse-mint">SIGNED OFF</span>
                    <span className="px-1.5 py-0.2 rounded bg-pulse-mint/20 text-pulse-mint text-[10px]">
                      {verifiedMeds.length}
                    </span>
                  </div>
                  {verifiedMeds.length > 0 ? (
                    verifiedMeds.map((m) => (
                      <div key={m.id} className="p-2.5 rounded-input bg-pulse-mint/10 border border-pulse-mint/30">
                        <span className="font-bold text-vitals-ink block">{m.brandName?.value}</span>
                        <span className="text-[10px] text-pulse-mint block mt-0.5">✓ Locked</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-[11px] text-vitals-faint italic">Pending nurse signature</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Detailed Medications Table with Tabular Mono and Diff-Style Highlight */}
          {(activeReviewSection === 'all' || activeReviewSection === 'meds' || activeReviewSection === 'kanban') && (
            <div className="vitals-card p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-vitals-border gap-2">
                <div>
                  <h3 className="font-display font-bold text-base text-vitals-ink">
                    Medication Regimen Schedule ({currentCase.medications.length})
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] font-mono text-vitals-muted">
                    <span className="text-emerald-400 font-bold">✓ CDSCO Approved Formulations</span>
                    <span>•</span>
                    <span className="text-teal-400">NLEM 2022 Verified</span>
                    <span>•</span>
                    <span className="text-cyan-400">NRCeS SNOMED-CT India</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-chip bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    Jan Aushadhi Savings: ₹{currentCase.indianClinicalSummary?.totalEstimatedJanAushadhiSavings || 840}/mo
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {currentCase.medications.map((med: ExtractedMedication, idx: number) => {
                  const hasDoseBlocker = !med.prescribedDose?.value;
                  const isHovered = hoveredMedId === med.id;

                  return (
                    <div
                      key={med.id}
                      onMouseEnter={() => setHoveredMedId(med.id)}
                      onMouseLeave={() => setHoveredMedId(null)}
                      className={`p-4 rounded-card border transition-all ${
                        isHovered
                          ? 'border-pulse-mint bg-vitals-surface2 shadow-[0_0_16px_rgba(59,245,137,0.1)]'
                          : hasDoseBlocker
                          ? 'border-signal-red bg-signal-red/10 blocker-glow'
                          : 'border-vitals-border bg-vitals-surface1 hover:border-vitals-border'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <span className="font-mono text-xs font-bold text-vitals-muted shrink-0 mt-0.5">
                            [{idx + 1}]
                          </span>
                          <div>
                            <h4 className="font-bold text-sm text-vitals-ink">
                              {med.brandName?.value || 'Unknown'}
                              <span className="font-normal text-xs text-vitals-muted ml-1.5">
                                ({med.saltName?.value || 'Generic Molecule'})
                              </span>
                            </h4>
                            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs font-mono text-vitals-muted">
                              <span>Form: <strong className="text-vitals-ink">{med.dosageForm?.value}</strong></span>
                              <span>•</span>
                              <span>Strength: <strong className="text-vitals-ink">{med.strength?.value || 'N/A'}</strong></span>
                              <span>•</span>
                              <span>Freq: <strong className="text-pulse-mint">{med.frequency?.value || 'N/A'}</strong></span>
                            </div>
                          </div>
                        </div>

                        {/* Prescribed Dose Quantity */}
                        <div className="text-right shrink-0">
                          {med.prescribedDose?.value ? (
                            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-pulse-mint/15 text-pulse-mint border border-pulse-mint/30">
                              {med.prescribedDose.value}
                            </span>
                          ) : (
                            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-signal-red text-white">
                              DOSE MISSING
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-vitals-border flex flex-wrap items-center justify-between text-xs font-mono text-vitals-muted gap-2">
                        <div>
                          <span>Slots: </span>
                          {med.timeSlots && med.timeSlots.length > 0 ? (
                            med.timeSlots.map((ts, sIdx) => (
                              <span key={sIdx} className="font-bold text-vitals-ink mr-1.5">
                                {ts.slot} ({ts.standardTime})
                              </span>
                            ))
                          ) : (
                            <span className="text-signal-red">None confirmed</span>
                          )}
                        </div>
                        <div>
                          <span>Food: <strong>{med.foodRelation?.value || 'Standard'}</strong></span>
                          {med.durationDays?.value && <span> • {med.durationDays.value} days</span>}
                        </div>
                      </div>

                      {med.instructionsPlainHindi && (
                        <p className="mt-2 text-xs font-hindi text-vitals-ink bg-vitals-surface2 p-2 rounded border border-vitals-border">
                          {med.instructionsPlainHindi}
                        </p>
                      )}

                      {/* Indian Medical Formulary (CDSCO / Jan Aushadhi / NLEM) */}
                      {med.indianFormulary && (
                        <div className="mt-2.5 p-2.5 rounded-card bg-emerald-950/20 border border-emerald-500/30 text-[11px] font-mono flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                              PMBJP GENERIC: {med.indianFormulary.janAushadhiGenericName}
                            </span>
                            <span className="text-vitals-muted">
                              Molecule: <strong className="text-slate-200">{med.indianFormulary.genericMolecule}</strong>
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            {med.indianFormulary.nlem2022Essential && (
                              <span className="px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/40 font-semibold">
                                ✓ NLEM 2022
                              </span>
                            )}
                            <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                              SNOMED: {med.indianFormulary.snomedNRCeSCode}
                            </span>
                            <span className="text-emerald-400 font-bold">
                              ₹{med.indianFormulary.janAushadhiPriceInr} vs ₹{med.indianFormulary.brandedMrpInr} MRP (Save ₹{med.indianFormulary.estimatedSavingsInr || 75})
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section: Diagnostic Tests Table */}
          {(activeReviewSection === 'all' || activeReviewSection === 'diagnosis') && currentCase.diagnosisDetails && (
            <div className="vitals-card p-5 space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-vitals-border">
                <h3 className="font-display font-bold text-base text-vitals-ink">
                  Diagnostic Tests & Investigations
                </h3>
                <span className="font-mono text-xs text-vitals-muted">
                  {currentCase.diagnosisDetails.inHospitalTests?.length || 0} In-Hospital Tests
                </span>
              </div>

              {currentCase.diagnosisDetails.inHospitalTests?.length > 0 && (
                <div className="overflow-x-auto rounded-card border border-vitals-border">
                  <table className="w-full text-left font-mono text-xs">
                    <thead className="bg-vitals-surface2 text-vitals-muted border-b border-vitals-border">
                      <tr>
                        <th className="p-3">Test Name</th>
                        <th className="p-3">Report Value</th>
                        <th className="p-3">Normal Range</th>
                        <th className="p-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-vitals-border bg-vitals-surface1 text-vitals-ink">
                      {currentCase.diagnosisDetails.inHospitalTests.map((t) => (
                        <tr key={t.id} className="hover:bg-vitals-surface2 transition-colors">
                          <td className="p-3 font-bold">{t.testName}</td>
                          <td className="p-3 text-pulse-mint font-semibold">{t.findingValue}</td>
                          <td className="p-3 text-vitals-muted">{t.referenceNormalRange || 'Standard'}</td>
                          <td className="p-3 text-center">
                            {t.isAbnormal ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-signal-amber/20 text-signal-amber">
                                Abnormal
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-pulse-mint/20 text-pulse-mint">
                                Normal
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Section: Nurse Sign-Off Desk */}
          <div className="vitals-card vitals-spotlight p-6 border-2 border-pulse-mint/40 bg-vitals-surface1">
            <div className="flex items-center justify-between pb-3 border-b border-vitals-border mb-3">
              <div className="flex items-center gap-2">
                <span className="pulsing-dot" />
                <h3 className="font-display font-bold text-base text-vitals-ink">
                  Nurse Sign-Off & Cryptographic Handover Lock
                </h3>
              </div>
              <span className="vitals-chip vitals-chip-pulse text-[10px]">
                GATE 03 // AUTHORIZATION
              </span>
            </div>

            <p className="text-xs text-vitals-muted leading-relaxed mb-4">
              I certify that all medication dosages, diagnosis findings, and patient follow-up instructions have been verified in accordance with ABDM standards. Once locked, this handover cannot be modified without invalidating the SHA-256 seal.
            </p>

            <div className="p-3 rounded-card bg-vitals-surface2 border border-vitals-border flex items-center justify-between mb-4 font-mono text-xs">
              <div>
                <span className="text-vitals-muted block text-[10px]">Attesting Staff:</span>
                <span className="font-bold text-vitals-ink">{nurseName}</span>
              </div>
              <span className="text-vitals-muted text-[10px]">ID: {nurseId}</span>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="font-mono text-xs text-vitals-muted">
                {isApproved
                  ? 'Cryptographically locked & verified'
                  : unresolvedCritical > 0
                  ? 'Sign-off locked until safety blockers resolved'
                  : 'Ready for authorization'}
              </span>

              {isApproved ? (
                <button
                  type="button"
                  onClick={onNavigateToFamilyPlan}
                  className="btn-vitals-primary text-xs"
                >
                  <span>Open Family Care Plan →</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={unresolvedCritical > 0 || isApproving}
                  className="btn-vitals-primary text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {unresolvedCritical > 0
                    ? `Locked (${unresolvedCritical} Blocker Unresolved)`
                    : isApproving
                    ? 'Signing & Sealing...'
                    : 'Authorize & Lock Handover'}
                </button>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
