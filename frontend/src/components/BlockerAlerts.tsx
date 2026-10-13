import React, { useState } from 'react';
import axios from 'axios';
import { DischargeCase, BlockerIssue } from '../types';

interface BlockerAlertsProps {
  currentCase: DischargeCase;
  onCaseUpdated: (c: DischargeCase) => void;
}

export const BlockerAlerts: React.FC<BlockerAlertsProps> = ({ currentCase, onCaseUpdated }) => {
  const [selectedBlocker, setSelectedBlocker] = useState<BlockerIssue | null>(null);
  const [clarifiedDose, setClarifiedDose] = useState('1 Tablet');
  const [clarifiedFollowUpDate, setClarifiedFollowUpDate] = useState('2026-10-16');
  const [clarifiedSosCondition, setClarifiedSosCondition] = useState('गंभीर दर्द या 100°F से अधिक बुखार होने पर (Severe pain or fever > 100°F)');
  const [clarifiedSlots, setClarifiedSlots] = useState<{ slot: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT'; standardTime: string; confirmedByStaff: boolean }[]>([
    { slot: 'MORNING', standardTime: '08:00', confirmedByStaff: true },
    { slot: 'NIGHT', standardTime: '20:00', confirmedByStaff: true },
  ]);
  const [resolutionNote, setResolutionNote] = useState('Confirmed verbally with attending physician via ward intercom');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const unresolved = currentCase.blockers.filter((b) => !b.isResolved);
  if (unresolved.length === 0) {
    return null;
  }

  const handleOpenFix = (blocker: BlockerIssue) => {
    setSelectedBlocker(blocker);
    if (blocker.code === 'PRESCRIBED_DOSE_MISSING') {
      setClarifiedDose('1 Tablet');
    } else if (blocker.code === 'TIME_SLOTS_INCOMPLETE') {
      const targetMed = currentCase.medications.find((m) => m.id === blocker.medicationId);
      const freq = targetMed?.frequency?.value;
      if (freq === 'TDS') {
        setClarifiedSlots([
          { slot: 'MORNING', standardTime: '08:00', confirmedByStaff: true },
          { slot: 'AFTERNOON', standardTime: '13:30', confirmedByStaff: true },
          { slot: 'NIGHT', standardTime: '20:30', confirmedByStaff: true },
        ]);
      } else if (freq === 'QID') {
        setClarifiedSlots([
          { slot: 'MORNING', standardTime: '08:00', confirmedByStaff: true },
          { slot: 'AFTERNOON', standardTime: '13:00', confirmedByStaff: true },
          { slot: 'EVENING', standardTime: '18:00', confirmedByStaff: true },
          { slot: 'NIGHT', standardTime: '22:00', confirmedByStaff: true },
        ]);
      } else {
        setClarifiedSlots([
          { slot: 'MORNING', standardTime: '08:00', confirmedByStaff: true },
          { slot: 'NIGHT', standardTime: '20:00', confirmedByStaff: true },
        ]);
      }
    } else if (blocker.code === 'FOLLOW_UP_DATE_MISSING') {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 7);
      setClarifiedFollowUpDate(targetDate.toISOString().split('T')[0]);
    }
  };

  const handleApplyResolution = async () => {
    if (!selectedBlocker) return;

    try {
      setIsSubmitting(true);
      const res = await axios.post<{ updatedCase: DischargeCase }>(
        `/api/cases/${currentCase.caseId}/clarify`,
        {
          blockerId: selectedBlocker.id,
          medicationId: selectedBlocker.medicationId,
          prescribedDose: selectedBlocker.code === 'PRESCRIBED_DOSE_MISSING' ? clarifiedDose : undefined,
          timeSlots: selectedBlocker.code === 'TIME_SLOTS_INCOMPLETE' ? clarifiedSlots : undefined,
          sosCondition: selectedBlocker.code === 'SOS_CONDITION_REQUIRED' ? clarifiedSosCondition : undefined,
          followUpDate: selectedBlocker.code === 'FOLLOW_UP_DATE_MISSING' ? clarifiedFollowUpDate : undefined,
          nurseName: 'Sister Anjali Sharma (Senior Discharge Nurse)',
          note: resolutionNote,
        }
      );

      onCaseUpdated(res.data.updatedCase);
      setSelectedBlocker(null);
    } catch (e: any) {
      alert('Error updating: ' + (e.response?.data?.error || e.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="space-y-3 mb-6 no-print font-sans">
        {unresolved.map((blk) => (
          <div
            key={blk.id}
            className={`p-4 sm:p-5 rounded-card flex flex-col sm:flex-row sm:items-start justify-between gap-4 transition-all ${
              blk.severity === 'CRITICAL'
                ? 'bg-signal-red/10 border border-signal-red blocker-glow'
                : 'bg-signal-amber/10 border border-signal-amber'
            }`}
          >
            <div className="flex items-start gap-3.5 flex-1 min-w-0">
              <div className="mt-0.5 shrink-0">
                <span className={`w-3 h-3 rounded-full block ${
                  blk.severity === 'CRITICAL' ? 'bg-signal-red animate-ping' : 'bg-signal-amber'
                }`} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-chip uppercase ${
                    blk.severity === 'CRITICAL' ? 'bg-signal-red text-white' : 'bg-signal-amber text-black'
                  }`}>
                    {blk.severity === 'CRITICAL' ? 'RELEASE BLOCKER' : 'ATTENTION REQUIRED'}
                  </span>
                  <span className="font-mono text-xs text-vitals-muted">
                    [{blk.code}]
                  </span>
                </div>
                <p className="text-sm font-bold mt-1.5 text-vitals-ink font-sans">
                  {blk.messageEnglish}
                </p>
                <p className="text-xs sm:text-sm text-vitals-muted mt-0.5 font-hindi">
                  {blk.messageHindi}
                </p>
              </div>
            </div>

            {/* Resolve Button */}
            <button
              type="button"
              onClick={() => handleOpenFix(blk)}
              className="btn-vitals-danger text-xs shrink-0 self-stretch sm:self-auto"
            >
              Resolve & Clarify →
            </button>
          </div>
        ))}
      </div>

      {/* Resolution Modal */}
      {selectedBlocker && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="bg-vitals-surface1 border border-vitals-border rounded-card max-w-lg w-full p-5 sm:p-6 shadow-2xl animate-in fade-in zoom-in-95 font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-vitals-border mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-signal-red" />
                <h3 className="font-display font-bold text-sm text-vitals-ink uppercase tracking-wider">
                  Clinician Clarification Protocol
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBlocker(null)}
                className="text-xs font-mono text-vitals-muted hover:text-vitals-ink"
              >
                [Esc]
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-input bg-vitals-surface2 border border-vitals-border">
                <p className="font-mono text-signal-red font-bold">[{selectedBlocker.code}]</p>
                <p className="text-vitals-ink mt-1 font-semibold">{selectedBlocker.messageEnglish}</p>
                <p className="text-vitals-muted mt-0.5 font-hindi">{selectedBlocker.messageHindi}</p>
              </div>

              {selectedBlocker.code === 'PRESCRIBED_DOSE_MISSING' && (
                <div>
                  <label className="font-mono text-xs text-vitals-ink block mb-1.5">
                    Confirmed Prescribed Dose Quantity:
                  </label>
                  <input
                    type="text"
                    value={clarifiedDose}
                    onChange={(e) => setClarifiedDose(e.target.value)}
                    placeholder="e.g. 1 Tablet (खुराक: 1 गोली)"
                    className="w-full vitals-input text-xs font-semibold"
                  />
                </div>
              )}

              {selectedBlocker.code === 'FOLLOW_UP_DATE_MISSING' && (
                <div>
                  <label className="font-mono text-xs text-vitals-ink block mb-1.5">
                    Confirmed OPD Follow-Up Review Date:
                  </label>
                  <input
                    type="date"
                    value={clarifiedFollowUpDate}
                    onChange={(e) => setClarifiedFollowUpDate(e.target.value)}
                    className="w-full vitals-input text-xs font-mono font-bold"
                  />
                </div>
              )}

              {selectedBlocker.code === 'SOS_CONDITION_REQUIRED' && (
                <div>
                  <label className="font-mono text-xs text-vitals-ink block mb-1.5">
                    Confirmed Trigger Condition for SOS Medication:
                  </label>
                  <input
                    type="text"
                    value={clarifiedSosCondition}
                    onChange={(e) => setClarifiedSosCondition(e.target.value)}
                    className="w-full vitals-input text-xs"
                  />
                </div>
              )}

              {selectedBlocker.code === 'TIME_SLOTS_INCOMPLETE' && (
                <div>
                  <label className="font-mono text-xs text-vitals-ink block mb-1.5">
                    Confirmed Slots:
                  </label>
                  <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                    {clarifiedSlots.map((s, idx) => (
                      <div key={idx} className="p-2 rounded-input bg-vitals-surface2 border border-vitals-border">
                        <span className="font-bold text-pulse-mint">{s.slot}</span>
                        <p className="text-vitals-muted text-[10px] mt-0.5">{s.standardTime}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="font-mono text-xs text-vitals-ink block mb-1.5">
                  Attestation Note:
                </label>
                <input
                  type="text"
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  className="w-full vitals-input text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-vitals-border mt-5">
              <button
                type="button"
                onClick={() => setSelectedBlocker(null)}
                className="btn-vitals-secondary text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyResolution}
                disabled={isSubmitting}
                className="btn-vitals-primary text-xs"
              >
                {isSubmitting ? 'Recording...' : 'Sign & Resolve Blocker'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
