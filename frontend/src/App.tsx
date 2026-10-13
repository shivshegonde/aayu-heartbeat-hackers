import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Navbar } from './components/Navbar';
import { UploadStation } from './components/UploadStation';
import { ReviewCockpit } from './components/ReviewCockpit';
import { FamilyPlanView } from './components/FamilyPlanView';
import { PresentationDeck } from './components/PresentationDeck';
import { GoogleCalendarModal } from './components/GoogleCalendarModal';
import { PharmacyLocatorModal } from './components/PharmacyLocatorModal';
import { PrintableDischargeSheet } from './components/PrintableDischargeSheet';
import { CommandPalette } from './components/CommandPalette';
import { DischargeCase, CaseListItem } from './types';

export const App: React.FC = () => {
  const [currentCase, setCurrentCase] = useState<DischargeCase | null>(null);
  const [caseList, setCaseList] = useState<CaseListItem[]>([]);
  const [activeTab, setActiveTab] = useState<'cockpit' | 'family' | 'upload' | 'deck'>('upload');
  const [language, setLanguage] = useState<'hi' | 'en'>('hi');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isPharmacyOpen, setIsPharmacyOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [, setLoadingInitial] = useState(true);

  // Fetch initial case list & default case
  const refreshCases = async () => {
    try {
      const res = await axios.get<CaseListItem[]>('/api/cases');
      setCaseList(res.data);
      if (!currentCase && res.data.length > 0) {
        // Load default case (Kamla Devi)
        const def = await axios.get<DischargeCase>(`/api/cases/${res.data[0].caseId}`);
        setCurrentCase(def.data);
      }
    } catch (e) {
      console.warn('API connecting...', e);
    } finally {
      setLoadingInitial(false);
    }
  };

  useEffect(() => {
    refreshCases();
  }, []);

  // Global mousemove listener for subtle specular spotlight on cards
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Global Cmd/Ctrl+K shortcut
  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleCaseSelected = (c: DischargeCase, targetTab: 'cockpit' | 'family' = 'cockpit') => {
    setCurrentCase(c);
    setActiveTab(targetTab);
  };

  const handleSelectCaseId = async (caseId: string) => {
    try {
      const res = await axios.get<DischargeCase>(`/api/cases/${caseId}`);
      setCurrentCase(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleNavigateTab = async (tab: 'cockpit' | 'family' | 'upload' | 'deck') => {
    if ((tab === 'family' || tab === 'cockpit') && !currentCase) {
      if (caseList.length > 0) {
        const target = tab === 'family' ? (caseList.find((c) => c.isApproved) || caseList[0]) : caseList[0];
        try {
          const res = await axios.get<DischargeCase>(`/api/cases/${target.caseId}`);
          setCurrentCase(res.data);
        } catch (e) {
          console.error(e);
        }
      }
    }
    setActiveTab(tab);
  };

  // Dedicated Fullscreen Pitch Deck Mode
  if (activeTab === 'deck') {
    return (
      <PresentationDeck
        onExit={() => handleNavigateTab(currentCase ? 'cockpit' : 'upload')}
        onOpenDemo={(tab) => handleNavigateTab(tab)}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans antialiased film-grain bg-vitals-base text-vitals-ink">
      
      {/* Live Vitals Mission Control Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleNavigateTab}
        language={language}
        setLanguage={setLanguage}
        currentCase={currentCase}
        caseList={caseList}
        onSelectCase={handleSelectCaseId}
        onOpenCalendar={() => setIsCalendarOpen(true)}
        onOpenPharmacy={() => setIsPharmacyOpen(true)}
        onPrint={handlePrint}
        onNewUpload={() => setActiveTab('upload')}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {/* Main Body with Bento Grid Stagger Reveal */}
      <main className="flex-1 pb-20 md:pb-12 stagger-reveal">
        {activeTab === 'upload' ? (
          <UploadStation
            onCaseSelected={handleCaseSelected}
            caseList={caseList}
            onRefreshCases={refreshCases}
          />
        ) : currentCase ? (
          <>
            {activeTab === 'cockpit' ? (
              <ReviewCockpit
                currentCase={currentCase}
                onCaseUpdated={(c) => setCurrentCase(c)}
                onNavigateToFamilyPlan={() => handleNavigateTab('family')}
                caseList={caseList}
                onSelectCase={handleSelectCaseId}
              />
            ) : (
              <FamilyPlanView
                currentCase={currentCase}
                language={language}
              />
            )}
          </>
        ) : (
          <div className="p-12 text-center font-mono text-sm text-vitals-muted">
            <span className="pulsing-dot inline-block mr-2" />
            <span>Initializing GharCare Live Vitals Clinical Handover Instrument...</span>
          </div>
        )}
      </main>

      {/* Cmd+K Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        caseList={caseList}
        currentCase={currentCase}
        onSelectCase={handleSelectCaseId}
        onNavigateTab={handleNavigateTab}
        language={language}
        onToggleLanguage={(l) => setLanguage(l)}
        onPrint={handlePrint}
        onOpenCalendar={() => setIsCalendarOpen(true)}
        onOpenPharmacy={() => setIsPharmacyOpen(true)}
      />

      {/* Modals & Dialogs */}
      {currentCase && (
        <>
          <GoogleCalendarModal
            currentCase={currentCase}
            isOpen={isCalendarOpen}
            onClose={() => setIsCalendarOpen(false)}
          />

          <PharmacyLocatorModal
            isOpen={isPharmacyOpen}
            onClose={() => setIsPharmacyOpen(false)}
          />

          {/* Printable Sheet (Visible only when printing) */}
          <PrintableDischargeSheet currentCase={currentCase} />
        </>
      )}

      {/* Quiet Footer with Minimalist Hackathon Chip */}
      <footer className="border-t border-vitals-border bg-vitals-base/95 py-5 text-xs text-vitals-muted no-print">
        <div className="max-w-[1560px] 2xl:max-w-[1680px] w-full mx-auto px-3 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4 font-mono">
          
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-display font-bold text-vitals-ink text-sm">
              GharCare
            </span>
            <span className="text-vitals-border">•</span>
            <span className="px-2 py-0.5 rounded-chip bg-vitals-surface2 border border-vitals-border text-vitals-ink text-[11px]">
              AAYU 2026 // TRACK T03 PROTOTYPE
            </span>
            <span className="text-vitals-border">•</span>
            <span className="text-pulse-mint text-[11px] font-bold">
              ABDM & DHR 2026 COMPLIANT
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[11px] text-vitals-faint">
            <span>Google Gemini 2.5 Flash</span>
            <span>•</span>
            <span>Google Cloud TTS (Neural2)</span>
            <span>•</span>
            <span>RFC 5545</span>
            <span>•</span>
            <span>ABDM FHIR R4</span>
          </div>

        </div>
      </footer>

    </div>
  );
};
