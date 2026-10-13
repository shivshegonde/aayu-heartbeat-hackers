import React, { useState, useRef, useEffect } from 'react';
import { DischargeCase, CaseListItem } from '../types';

interface NavbarProps {
  activeTab: 'cockpit' | 'family' | 'upload' | 'deck';
  setActiveTab: (tab: 'cockpit' | 'family' | 'upload' | 'deck') => void;
  language: 'hi' | 'en';
  setLanguage: (lang: 'hi' | 'en') => void;
  currentCase: DischargeCase | null;
  caseList?: CaseListItem[];
  onSelectCase?: (caseId: string) => void;
  onOpenCalendar: () => void;
  onOpenPharmacy: () => void;
  onPrint: () => void;
  onNewUpload: () => void;
  onOpenDeck?: () => void;
  onOpenCommandPalette?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  language,
  setLanguage,
  currentCase,
  caseList = [],
  onSelectCase,
  onOpenCalendar,
  onOpenPharmacy,
  onPrint,
  onNewUpload,
  onOpenCommandPalette,
}) => {
  const [isPatientPopoverOpen, setIsPatientPopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsPatientPopoverOpen(false);
      }
    };
    if (isPatientPopoverOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isPatientPopoverOpen]);

  const unresolvedCritical =
    currentCase?.blockers.filter((b) => b.severity === 'CRITICAL' && !b.isResolved).length || 0;
  const isApproved = currentCase?.status === 'APPROVED_LOCKED';

  return (
    <>
      <header className="sticky top-0 z-40 bg-vitals-base/90 backdrop-blur-xl border-b border-vitals-border no-print select-none">
        <div className="max-w-[1560px] 2xl:max-w-[1680px] w-full mx-auto px-3 sm:px-6">
          <div className="flex items-center justify-between h-15 sm:h-[68px] gap-3">
            
            {/* Left Zone: Brand Mark & Sticky Patient Pill */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Brand Logo with Continuous Pulse Dot */}
              <div
                onClick={onNewUpload}
                className="flex items-center gap-2.5 cursor-pointer group"
                title="GharCare — Live Vitals Clinical Handover"
              >
                <div className="w-8.5 h-8.5 rounded-card bg-vitals-surface2 border border-vitals-border flex items-center justify-center text-pulse-mint shadow-[0_0_12px_rgba(59,245,137,0.15)] group-hover:border-pulse-mint transition-colors">
                  {/* ECG Heartbeat Icon (with top headroom and subtle downside offset so upper peak is fully visible) */}
                  <svg className="w-5 h-5 translate-y-0.5" viewBox="0 -2.5 24 29" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                </div>

                <div className="flex flex-col justify-center leading-none">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-display font-bold text-xl sm:text-[22px] text-vitals-ink tracking-tight">
                      GharCare
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-mono text-pulse-mint uppercase tracking-widest font-semibold">
                      LIVE
                    </span>
                  </div>
                </div>
              </div>

              {/* Sticky "Patient Pill" with Popover */}
              {currentCase && (
                <div className="relative" ref={popoverRef}>
                  <button
                    type="button"
                    onClick={() => setIsPatientPopoverOpen(!isPatientPopoverOpen)}
                    className="flex items-center gap-2.5 h-9.5 px-3 sm:px-3.5 rounded-chip bg-vitals-surface1 hover:bg-vitals-surface2 border border-vitals-border transition-all cursor-pointer group"
                    title="Switch Patient Dossier"
                  >
                    <div className="w-6.5 h-6.5 rounded-full bg-pulse-mint/20 text-pulse-mint flex items-center justify-center font-display font-bold text-xs shrink-0">
                      {currentCase.patientDisplayName.charAt(0)}
                    </div>
                    <div className="text-left leading-tight">
                      <div className="flex items-center gap-1.5">
                        <span className="font-sans font-bold text-xs sm:text-[13.5px] text-vitals-ink truncate max-w-[120px] sm:max-w-[160px]">
                          {currentCase.patientDisplayName}
                        </span>
                        <span className="pulsing-dot" />
                      </div>
                      <span className="font-mono text-[9.5px] sm:text-[10.5px] text-vitals-muted">
                        ABHA: {currentCase.abhaNumber?.slice(0, 7) || '91-4920'}...
                      </span>
                    </div>
                    <svg className="w-3.5 h-3.5 text-vitals-muted ml-0.5 group-hover:text-vitals-ink transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {/* Patient Switcher Popover */}
                  {isPatientPopoverOpen && caseList.length > 0 && (
                    <div className="absolute left-0 mt-2 w-80 bg-vitals-surface1 border border-vitals-border rounded-card shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 font-sans">
                      <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-vitals-faint border-b border-vitals-border mb-1">
                        Active Hospital Patients
                      </div>
                      <div className="max-h-64 overflow-y-auto space-y-1">
                        {caseList.map((c) => (
                          <button
                            key={c.caseId}
                            type="button"
                            onClick={() => {
                              if (onSelectCase) onSelectCase(c.caseId);
                              setIsPatientPopoverOpen(false);
                            }}
                            className={`w-full flex items-center justify-between p-2.5 rounded-input text-left transition-colors ${
                              c.caseId === currentCase.caseId
                                ? 'bg-vitals-surface2 border border-pulse-mint/40 text-pulse-mint'
                                : 'hover:bg-vitals-surface2 text-vitals-ink'
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-xs sm:text-[13px] truncate">{c.patientDisplayName}</p>
                              <p className="text-[11px] text-vitals-muted truncate">{c.primaryDiagnosis}</p>
                            </div>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-chip shrink-0 ml-2 ${
                              c.isApproved ? 'bg-pulse-mint/10 text-pulse-mint' : 'bg-signal-amber/10 text-signal-amber'
                            }`}>
                              {c.isApproved ? 'VERIFIED' : 'BLOCKERS'}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Center Zone: Mission Control View Selector */}
            <nav className="hidden md:flex items-center gap-1 bg-vitals-surface1 p-1 rounded-card border border-vitals-border">
              <button
                type="button"
                onClick={onNewUpload}
                className={`h-9 px-4 flex items-center gap-2 text-xs sm:text-[13.5px] font-semibold rounded-input transition-all cursor-pointer ${
                  activeTab === 'upload'
                    ? 'bg-vitals-surface2 text-pulse-mint border border-pulse-mint/30 shadow-[0_0_12px_rgba(59,245,137,0.1)] font-bold'
                    : 'text-vitals-muted hover:text-vitals-ink'
                }`}
              >
                <span>Ingestion Studio</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('cockpit')}
                className={`h-9 px-4 flex items-center gap-2 text-xs sm:text-[13.5px] font-semibold rounded-input transition-all cursor-pointer relative ${
                  activeTab === 'cockpit'
                    ? 'bg-vitals-surface2 text-pulse-mint border border-pulse-mint/30 shadow-[0_0_12px_rgba(59,245,137,0.1)] font-bold'
                    : 'text-vitals-muted hover:text-vitals-ink'
                }`}
              >
                <span>Nurse Cockpit</span>
                {unresolvedCritical > 0 && (
                  <span className="w-2 h-2 rounded-full bg-signal-red animate-pulse" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('family')}
                className={`h-9 px-4 flex items-center gap-2 text-xs sm:text-[13.5px] font-semibold rounded-input transition-all cursor-pointer ${
                  activeTab === 'family'
                    ? 'bg-vitals-surface2 text-pulse-mint border border-pulse-mint/30 shadow-[0_0_12px_rgba(59,245,137,0.1)] font-bold'
                    : 'text-vitals-muted hover:text-vitals-ink'
                }`}
              >
                <span>Family Care Plan</span>
                {isApproved && (
                  <span className="text-[11px] font-mono text-pulse-mint">✓</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('deck')}
                className={`h-9 px-3.5 flex items-center gap-1.5 text-xs sm:text-[13.5px] font-semibold rounded-input transition-all cursor-pointer ${
                  activeTab === 'deck'
                    ? 'bg-vitals-surface2 text-vitals-ink border border-vitals-border font-bold'
                    : 'text-vitals-muted hover:text-vitals-ink'
                }`}
                title="View Pitch Deck & Project Info (Route: /info)"
              >
                <span>Pitch Deck</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-pulse-amber/15 text-pulse-amber border border-pulse-amber/30 font-bold">
                  /info
                </span>
              </button>
            </nav>

            {/* Right Zone: Cmd+K, Language Toggle, Print */}
            <div className="flex items-center gap-2 shrink-0">
              
              {/* Cmd+K Palette Trigger */}
              <button
                type="button"
                onClick={onOpenCommandPalette}
                className="hidden lg:flex items-center gap-2 h-9 px-3 rounded-input bg-vitals-surface1 hover:bg-vitals-surface2 border border-vitals-border text-xs sm:text-[13px] text-vitals-muted transition-colors cursor-pointer"
                title="Open Command Palette (Cmd/Ctrl+K)"
              >
                <span>Quick Actions</span>
                <kbd className="px-1.5 py-0.5 text-[10.5px] font-mono bg-vitals-surface3 text-vitals-ink rounded border border-vitals-border">
                  ⌘K
                </kbd>
              </button>

              {/* Typographic "EN | हिं" Toggle */}
              <div className="h-9 px-2.5 flex items-center gap-1.5 border border-vitals-border bg-vitals-surface1 rounded-input text-xs sm:text-[13px] font-mono">
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                    language === 'en' ? 'font-bold text-pulse-mint' : 'text-vitals-muted hover:text-vitals-ink'
                  }`}
                >
                  EN
                </button>
                <span className="text-vitals-border select-none">|</span>
                <button
                  type="button"
                  onClick={() => setLanguage('hi')}
                  className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer font-hindi ${
                    language === 'hi' ? 'font-bold text-pulse-mint' : 'text-vitals-muted hover:text-vitals-ink'
                  }`}
                >
                  हिं
                </button>
              </div>

              {/* Calendar & Pharmacy Shortcuts */}
              {currentCase && (
                <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={onOpenCalendar}
                    title="Google Calendar Schedule Sync (RFC 5545)"
                    className="h-9 w-9 flex items-center justify-center rounded-input border border-vitals-border bg-vitals-surface1 hover:bg-vitals-surface2 text-vitals-muted hover:text-vitals-ink transition-colors cursor-pointer"
                  >
                    <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={onOpenPharmacy}
                    title="Nearby 24/7 Pharmacies on Google Maps"
                    className="h-9 w-9 flex items-center justify-center rounded-input border border-vitals-border bg-vitals-surface1 hover:bg-vitals-surface2 text-vitals-muted hover:text-vitals-ink transition-colors cursor-pointer"
                  >
                    <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={onPrint}
                    title="Print Official Handout"
                    className="btn-vitals-primary h-9 px-4 text-xs sm:text-[13.5px]"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                      <polyline points="6 9 6 2 18 2 18 9" />
                      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                      <rect x="6" y="14" width="12" height="8" />
                    </svg>
                    <span>Print Handout</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Signature Continuous ECG Heartbeat Line Divider (with full vertical clearance for pulse peaks) */}
        <div className="w-full h-2.5 relative overflow-hidden bg-vitals-surface1/80 border-t border-vitals-border/40">
          <svg className="w-full h-full text-pulse-mint opacity-90" preserveAspectRatio="none" viewBox="0 0 1200 28">
            <path
              className="ecg-pulse-line"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              d="M0,14 L300,14 L320,14 L330,6 L340,22 L350,4 L360,20 L370,14 L600,14 L620,14 L630,6 L640,22 L650,4 L660,20 L670,14 L900,14 L920,14 L930,6 L940,22 L950,4 L960,20 L970,14 L1200,14"
            />
          </svg>
        </div>
      </header>

      {/* Mobile Floating Bottom Dock */}
      <nav className="fixed bottom-3 left-4 right-4 z-40 bg-vitals-surface1/95 backdrop-blur-xl border border-vitals-border rounded-chip shadow-2xl md:hidden no-print">
        <div className="grid grid-cols-4 h-15">
          <button
            type="button"
            onClick={onNewUpload}
            className={`flex flex-col items-center justify-center gap-0.5 text-xs font-semibold transition-colors ${
              activeTab === 'upload' ? 'text-pulse-mint font-bold' : 'text-vitals-muted'
            }`}
          >
            <span>Intake</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cockpit')}
            className={`flex flex-col items-center justify-center gap-0.5 text-xs font-semibold relative transition-colors ${
              activeTab === 'cockpit' ? 'text-pulse-mint font-bold' : 'text-vitals-muted'
            }`}
          >
            <span>Cockpit</span>
            {unresolvedCritical > 0 && (
              <span className="w-2 h-2 rounded-full bg-signal-red absolute top-2 right-6 animate-pulse" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('family')}
            className={`flex flex-col items-center justify-center gap-0.5 text-xs font-semibold transition-colors ${
              activeTab === 'family' ? 'text-pulse-mint font-bold' : 'text-vitals-muted'
            }`}
          >
            <span>Family</span>
          </button>
          <button
            type="button"
            onClick={onPrint}
            className="flex flex-col items-center justify-center gap-0.5 text-xs font-semibold text-vitals-muted hover:text-vitals-ink"
          >
            <span>Print</span>
          </button>
        </div>
      </nav>
    </>
  );
};
