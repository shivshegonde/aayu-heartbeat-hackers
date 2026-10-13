import React, { useState, useEffect } from 'react';
import { DischargeCase, CaseListItem } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  caseList: CaseListItem[];
  currentCase: DischargeCase | null;
  onSelectCase: (caseId: string) => void;
  onNavigateTab: (tab: 'upload' | 'cockpit' | 'family' | 'deck') => void;
  language: 'hi' | 'en';
  onToggleLanguage: (lang: 'hi' | 'en') => void;
  onPrint: () => void;
  onOpenCalendar: () => void;
  onOpenPharmacy: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  caseList,
  currentCase,
  onSelectCase,
  onNavigateTab,
  language,
  onToggleLanguage,
  onPrint,
  onOpenCalendar,
  onOpenPharmacy,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open triggered by parent if wired
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-start justify-center pt-20 px-4 animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-vitals-surface1 border border-vitals-border rounded-card shadow-2xl overflow-hidden font-sans">
        
        {/* Search Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-vitals-border bg-vitals-surface2">
          <svg className="w-4 h-4 text-vitals-muted mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a clinical command or patient name... (ESC to close)"
            className="w-full bg-transparent text-vitals-ink placeholder:text-vitals-muted focus:outline-none text-sm font-sans"
          />
          <kbd className="px-2 py-0.5 text-[10px] font-mono font-bold text-vitals-muted bg-vitals-surface3 rounded border border-vitals-border">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1 text-xs">
          
          {/* Navigation Section */}
          <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-vitals-faint">
            Views & Instruments
          </div>
          <button
            type="button"
            onClick={() => { onNavigateTab('upload'); onClose(); }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-input hover:bg-vitals-surface2 text-vitals-ink transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-pulse-mint" />
              <span>Ingestion Studio (Document Intake)</span>
            </div>
            <kbd className="font-mono text-[10px] text-vitals-muted">1</kbd>
          </button>
          <button
            type="button"
            onClick={() => { onNavigateTab('cockpit'); onClose(); }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-input hover:bg-vitals-surface2 text-vitals-ink transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-pulse-mint" />
              <span>Nurse Cockpit (Kanban Checklist)</span>
            </div>
            <kbd className="font-mono text-[10px] text-vitals-muted">2</kbd>
          </button>
          <button
            type="button"
            onClick={() => { onNavigateTab('family'); onClose(); }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-input hover:bg-vitals-surface2 text-vitals-ink transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-pulse-mint" />
              <span>Family Care Plan (Elder-First)</span>
            </div>
            <kbd className="font-mono text-[10px] text-vitals-muted">3</kbd>
          </button>

          {/* Clinical Patients */}
          <div className="px-2 py-1 pt-3 text-[10px] font-mono uppercase tracking-wider text-vitals-faint">
            Clinical Patients ({caseList.length})
          </div>
          {caseList.map((c) => (
            <button
              key={c.caseId}
              type="button"
              onClick={() => { onSelectCase(c.caseId); onClose(); }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-input hover:bg-vitals-surface2 transition-colors text-left ${
                c.caseId === currentCase?.caseId ? 'bg-vitals-surface2 text-pulse-mint font-bold' : 'text-vitals-ink'
              }`}
            >
              <div>
                <span className="font-bold">{c.patientDisplayName}</span>
                <span className="text-vitals-muted text-[11px] ml-2">({c.primaryDiagnosis})</span>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-chip ${
                c.isApproved ? 'bg-pulse-mint/10 text-pulse-mint' : 'bg-signal-red/10 text-signal-red'
              }`}>
                {c.isApproved ? 'VERIFIED' : 'BLOCKERS'}
              </span>
            </button>
          ))}

          {/* Quick Actions */}
          <div className="px-2 py-1 pt-3 text-[10px] font-mono uppercase tracking-wider text-vitals-faint">
            System Actions
          </div>
          <button
            type="button"
            onClick={() => { onToggleLanguage(language === 'hi' ? 'en' : 'hi'); onClose(); }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-input hover:bg-vitals-surface2 text-vitals-ink transition-colors text-left"
          >
            <span>Toggle Language ({language === 'hi' ? 'Switch to English' : 'हिंदी में बदलें'})</span>
            <kbd className="font-mono text-[10px] text-vitals-muted">L</kbd>
          </button>
          <button
            type="button"
            onClick={() => { onPrint(); onClose(); }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-input hover:bg-vitals-surface2 text-vitals-ink transition-colors text-left"
          >
            <span>Print Official A4 Discharge Slip</span>
            <kbd className="font-mono text-[10px] text-vitals-muted">P</kbd>
          </button>
          <button
            type="button"
            onClick={() => { onOpenCalendar(); onClose(); }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-input hover:bg-vitals-surface2 text-vitals-ink transition-colors text-left"
          >
            <span>Sync Google Calendar (RFC 5545)</span>
            <kbd className="font-mono text-[10px] text-vitals-muted">C</kbd>
          </button>
          <button
            type="button"
            onClick={() => { onOpenPharmacy(); onClose(); }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-input hover:bg-vitals-surface2 text-vitals-ink transition-colors text-left"
          >
            <span>Find 24/7 Nearby Pharmacies</span>
            <kbd className="font-mono text-[10px] text-vitals-muted">M</kbd>
          </button>

        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-vitals-border bg-vitals-surface2 text-[11px] font-mono text-vitals-muted flex items-center justify-between">
          <span>GharCare Live Vitals Command Engine</span>
          <span>Press <strong>ESC</strong> to dismiss</span>
        </div>
      </div>
    </div>
  );
};
