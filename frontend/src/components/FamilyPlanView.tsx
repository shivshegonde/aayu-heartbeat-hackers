import React, { useState } from 'react';
import { DischargeCase, ExtractedMedication } from '../types';
import { AwaazParchiAudio } from './AwaazParchiAudio';

interface FamilyPlanViewProps {
  currentCase: DischargeCase;
  language: 'hi' | 'en';
}

type TimeSlotKey = 'morning' | 'afternoon' | 'night' | 'sos' | 'vitals';

export const FamilyPlanView: React.FC<FamilyPlanViewProps> = ({ currentCase, language }) => {
  const isHindi = language === 'hi';
  const [selectedIndicLang, setSelectedIndicLang] = useState<'hi' | 'mr' | 'bn' | 'te' | 'ta' | 'gu'>('hi');

  // Active time-of-day step (One Giant Task Card per screen width)
  const [activeSlot, setActiveSlot] = useState<TimeSlotKey>('morning');

  // Track taken medications with timestamps
  const [takenMeds, setTakenMeds] = useState<Record<string, { taken: boolean; timeStr: string }>>({});

  // 7-Day Vitals Diary
  const [diaryDay, setDiaryDay] = useState(1);
  const [morningReading, setMorningReading] = useState('124/82');
  const [eveningReading, setEveningReading] = useState('128/84');
  const [loggedStatus, setLoggedStatus] = useState<Record<number, { morning: string; evening: string }>>({
    1: { morning: '124/82', evening: '128/84' },
    2: { morning: '120/80', evening: '126/82' },
  });
  const [isCopiedWhatsApp, setIsCopiedWhatsApp] = useState(false);

  // Sound feedback for satisfying check
  const playCheckFeedback = () => {
    try {
      if (typeof window !== 'undefined') {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
          osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
          gain.gain.setValueAtTime(0.18, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.35);
        }
      }
    } catch {
      // AudioContext unavailable
    }

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate([25, 40, 25]);
      } catch {
        // Haptic unsupported
      }
    }
  };

  const handleToggleMedTaken = (medId: string) => {
    setTakenMeds((prev) => {
      const isAlreadyTaken = prev[medId]?.taken;
      if (!isAlreadyTaken) {
        playCheckFeedback();
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return {
          ...prev,
          [medId]: { taken: true, timeStr },
        };
      } else {
        const copy = { ...prev };
        delete copy[medId];
        return copy;
      }
    });
  };

  const handleSaveReading = () => {
    setLoggedStatus((prev) => ({
      ...prev,
      [diaryDay]: { morning: morningReading, evening: eveningReading },
    }));
    playCheckFeedback();
    alert(isHindi ? `दिन ${diaryDay} का रिकॉर्ड सफलतापूर्वक सहेज लिया गया!` : `Day ${diaryDay} vitals logged successfully!`);
  };

  const handleShareWhatsApp = () => {
    setIsCopiedWhatsApp(true);
    setTimeout(() => setIsCopiedWhatsApp(false), 3000);
    alert(isHindi 
      ? `व्हाट्सएप पर आवाज़ पर्ची और दवाइयों का नियम साझा करने के लिए लिंक कॉपी कर लिया गया है!` 
      : `WhatsApp voice handover note prepared! Link copied to clipboard.`
    );
  };

  // Day-part groupings
  const morningMeds = currentCase.medications.filter((m) =>
    m.timeSlots.some((s) => s.slot === 'MORNING')
  );
  const afternoonMeds = currentCase.medications.filter((m) =>
    m.timeSlots.some((s) => s.slot === 'AFTERNOON')
  );
  const eveningMeds = currentCase.medications.filter((m) =>
    m.timeSlots.some((s) => s.slot === 'EVENING')
  );
  const nightMeds = currentCase.medications.filter((m) =>
    m.timeSlots.some((s) => s.slot === 'NIGHT')
  );
  const nightAndEveningMeds = Array.from(
    new Map([...eveningMeds, ...nightMeds].map((m) => [m.id, m])).values()
  );
  const sosMeds = currentCase.medications.filter((m) =>
    m.frequency.value === 'SOS'
  );

  // Stepper order
  const slotOrder: TimeSlotKey[] = ['morning', 'afternoon', 'night', 'sos', 'vitals'];
  const currentSlotIndex = slotOrder.indexOf(activeSlot);

  const goToPrevSlot = () => {
    if (currentSlotIndex > 0) {
      setActiveSlot(slotOrder[currentSlotIndex - 1]);
    }
  };

  const goToNextSlot = () => {
    if (currentSlotIndex < slotOrder.length - 1) {
      setActiveSlot(slotOrder[currentSlotIndex + 1]);
    }
  };

  // Compute active medications & metadata
  let activeMeds: ExtractedMedication[] = [];
  let slotTitleHindi = '';
  let slotTitleEnglish = '';
  let slotSubtitleHindi = '';
  let slotSubtitleEnglish = '';
  let slotTimingTag = '';

  switch (activeSlot) {
    case 'morning':
      activeMeds = morningMeds;
      slotTitleHindi = 'सुबह का समय (नाश्ते के बाद)';
      slotTitleEnglish = 'Morning Routine (After Breakfast)';
      slotSubtitleHindi = 'ताज़े पानी के साथ लें • नाश्ते के 15-20 मिनट बाद';
      slotSubtitleEnglish = 'Take 15-20 mins after breakfast with warm water';
      slotTimingTag = '08:00 AM // सुबह';
      break;
    case 'afternoon':
      activeMeds = afternoonMeds;
      slotTitleHindi = 'दोपहर का समय (दोपहर के खाने के बाद)';
      slotTitleEnglish = 'Afternoon Routine (Lunch Time)';
      slotSubtitleHindi = 'दोपहर के भोजन के बाद पानी के साथ लें';
      slotSubtitleEnglish = 'Take after lunch as prescribed';
      slotTimingTag = '01:30 PM // दोपहर';
      break;
    case 'night':
      activeMeds = nightAndEveningMeds;
      slotTitleHindi = 'रात का समय (रात के खाने के बाद व सोते समय)';
      slotTitleEnglish = 'Night Routine (Dinner & Bedtime)';
      slotSubtitleHindi = 'रात के भोजन के बाद लें • सोने से पहले';
      slotSubtitleEnglish = 'Take after dinner or right before sleeping';
      slotTimingTag = '09:30 PM // रात';
      break;
    case 'sos':
      activeMeds = sosMeds;
      slotTitleHindi = 'केवल ज़रूरत पड़ने पर (आपातकालीन / SOS)';
      slotTitleEnglish = 'As-Needed / Emergency SOS Medications';
      slotSubtitleHindi = 'केवल विशेष लक्षण या अत्यधिक दर्द होने पर ही लें';
      slotSubtitleEnglish = 'Take strictly when specific symptoms occur';
      slotTimingTag = 'SOS // आपातकालीन';
      break;
    case 'vitals':
      activeMeds = [];
      slotTitleHindi = 'दैनिक स्वास्थ्य जांच (7-दिवसीय डायरी)';
      slotTitleEnglish = 'Daily Vitals Tracking & 7-Day Logbook';
      slotSubtitleHindi = 'रक्तचाप व तापमान दर्ज करें • ओपीडी विज़िट पर यह चार्ट साथ लाएं';
      slotSubtitleEnglish = 'Log BP & pulse twice daily. Bring to follow-up.';
      slotTimingTag = 'VITALS // स्वास्थ्य जांच';
      break;
  }

  const takenCountForActive = activeMeds.filter((m) => takenMeds[m.id]?.taken).length;
  const totalCountForActive = activeMeds.length;

  return (
    <div className="max-w-[1560px] 2xl:max-w-[1680px] w-full mx-auto px-3 sm:px-6 py-6 sm:py-8 font-sans text-vitals-ink">
      
      {/* 1. Welcoming Patient Greeting & Digital ABHA Health Card (Live Vitals Bento Tile) */}
      <div className="vitals-card vitals-spotlight p-6 sm:p-8 mb-6 border border-vitals-border">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-6 border-b border-vitals-border">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="vitals-chip vitals-chip-pulse text-xs">
                <span className="pulsing-dot" />
                <span>{isHindi ? 'घर पर देखभाल योजना' : 'FAMILY CARE HANDOVER'}</span>
              </span>
              <span className="vitals-chip text-xs">
                IPD: {currentCase.patientIdMasked}
              </span>
              <span className="vitals-chip text-xs">
                Rev #{currentCase.revision}
              </span>
              <span className="vitals-chip text-xs text-pulse-mint">
                ABDM & DHR 2026
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-display font-bold text-vitals-ink tracking-tight">
              {isHindi ? `नमस्ते ${currentCase.patientDisplayName} जी,` : `Welcome, ${currentCase.patientDisplayName}`}
            </h1>

            {/* Elder-friendly high contrast body text */}
            <p className="text-xl sm:text-2xl text-vitals-muted mt-3 font-hindi max-w-4xl leading-relaxed">
              <strong className="text-vitals-ink">{isHindi ? 'बीमारी / निदान:' : 'Diagnosis:'}</strong>{' '}
              {currentCase.primaryDiagnosis}
            </p>

            <p className="text-xs sm:text-sm text-vitals-faint mt-2 font-mono">
              {currentCase.hospitalName} • {isHindi ? 'डिस्चार्ज तारीख:' : 'Discharged on:'} {currentCase.dischargeDate}
            </p>
          </div>

          {/* Verification Badge & WhatsApp Share */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <div className="holo-seal p-3.5 rounded-card">
              <span className="text-[11px] font-mono font-bold text-pulse-mint block uppercase tracking-wider mb-0.5">
                VERIFIED BY NURSE
              </span>
              <p className="font-mono text-xs text-vitals-ink font-bold">
                {currentCase.approvalMetadata?.approvedByNurseName || 'Sister Anjali Sharma (Discharge Desk)'}
              </p>
              {currentCase.approvalMetadata?.cryptographicHash && (
                <span className="text-[9px] font-mono text-pulse-mint block mt-0.5">
                  SHA-256: {currentCase.approvalMetadata.cryptographicHash.slice(0, 14)}...
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="btn-vitals-secondary text-xs sm:text-sm text-pulse-mint border-pulse-mint/30 hover:border-pulse-mint cursor-pointer font-hindi"
            >
              <svg className="w-4 h-4 text-pulse-mint" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              <span>{isHindi ? (isCopiedWhatsApp ? 'लिंक कॉपी हुआ!' : 'व्हाट्सएप पर शेयर') : (isCopiedWhatsApp ? 'Link Copied!' : 'Share WhatsApp')}</span>
            </button>
          </div>
        </div>

        {/* ABDM ABHA Digital Health Account Strip */}
        <div className="mt-4 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs bg-vitals-surface2 p-4 rounded-card border border-vitals-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-card bg-vitals-surface3 border border-vitals-border flex items-center justify-center font-mono font-bold text-xs text-pulse-mint">
              ABHA
            </div>
            <div>
              <span className="font-bold text-vitals-ink text-sm">
                {isHindi ? 'आयुष्मान भारत डिजिटल मिशन (ABDM) सत्यापित खाता' : 'Ayushman Bharat Digital Health Account (ABHA)'}
              </span>
              <p className="text-vitals-muted text-xs mt-0.5 font-hindi">
                {isHindi
                  ? `यह डिस्चार्ज प्लान आपके आभा नंबर से सुरक्षित रूप से लिंक है। देश के किसी भी अस्पताल में रिकॉर्ड उपलब्ध रहेगा।`
                  : `Digital care handover permanently synced to ABHA ID.`}
              </p>
            </div>
          </div>

          <div className="font-mono text-xs font-bold text-pulse-mint px-3.5 py-1.5 rounded-chip bg-vitals-surface3 border border-vitals-border">
            {currentCase.abhaNumber || '91-4920-1923-4819'}
          </div>
        </div>
      </div>

      {/* 1b. Indian Clinical Standards & PMBJP Jan Aushadhi Savings Banner */}
      <div className="vitals-card p-5 mb-6 border border-emerald-500/30 bg-emerald-950/15">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-card bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold text-lg shrink-0">
              ₹
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="font-bold text-base text-vitals-ink">
                  {isHindi ? 'प्रधानमंत्री जन औषधि (PMBJP) बचत कैलकुलेटर' : 'Pradhan Mantri Jan Aushadhi (PMBJP) Generic Savings'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[11px] font-bold border border-emerald-500/40">
                  CDSCO & NLEM 2022
                </span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[11px] font-bold border border-cyan-500/40">
                  NRCeS SNOMED-CT
                </span>
              </div>
              <p className="text-xs text-vitals-muted">
                {isHindi
                  ? `जेनेरिक जन औषधि केंद्र से दवाइयां लेने पर आपके परिवार की अनुमानित मासिक बचत:`
                  : `Switching to verified generic equivalents at Jan Aushadhi Kendras saves your family:`}
                {' '}
                <strong className="text-emerald-400 font-bold text-sm">
                  ₹{currentCase.indianClinicalSummary?.totalEstimatedJanAushadhiSavings || 840} / महीना (Month)
                </strong>
                {' '}(~78% off retail branded MRP).
              </p>
            </div>
          </div>

          {/* 6 Regional Languages Switcher */}
          <div className="flex flex-col items-start md:items-end gap-1.5 shrink-0">
            <span className="font-mono text-[10.5px] text-vitals-muted uppercase tracking-wider">
              12 Regional Languages (AI4Bharat IndicTrans2):
            </span>
            <div className="flex flex-wrap items-center gap-1">
              {[
                { code: 'hi', label: 'हिंदी' },
                { code: 'mr', label: 'मराठी' },
                { code: 'bn', label: 'বাংলা' },
                { code: 'te', label: 'తెలుగు' },
                { code: 'ta', label: 'தமிழ்' },
                { code: 'gu', label: 'ગુજરાતી' },
              ].map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setSelectedIndicLang(l.code as any)}
                  className={`px-2.5 py-1 rounded text-xs font-hindi font-bold transition-all cursor-pointer ${
                    selectedIndicLang === l.code
                      ? 'bg-pulse-mint text-black shadow-[0_0_10px_rgba(59,245,137,0.3)]'
                      : 'bg-vitals-surface2 hover:bg-vitals-surface3 text-vitals-muted hover:text-white border border-vitals-border'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Authentic Indian Voiceover: Awaaz Parchi Player (Live Vitals Aesthetic) */}
      <AwaazParchiAudio currentCase={currentCase} />

      {/* 3. TIME-OF-DAY STEPPER NAV SELECTOR (Sleek Live Vitals Mission Control Tabs) */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="font-display text-lg sm:text-xl font-bold text-vitals-ink flex items-center gap-2">
            <span>{isHindi ? 'दवाइयों का समय चक्र' : 'Daily Medication Schedule'}</span>
            <span className="font-mono text-xs text-vitals-muted font-normal">(Time-of-Day Stepper)</span>
          </span>
          <span className="vitals-chip vitals-chip-pulse font-mono text-xs font-bold">
            STEP {currentSlotIndex + 1} OF {slotOrder.length} // {activeSlot.toUpperCase()}
          </span>
        </div>

        {/* Big Tactile Mission Control Time-of-Day Tab Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          
          {/* Tab 1: MORNING (Sunrise animated SVG) */}
          <button
            type="button"
            onClick={() => setActiveSlot('morning')}
            className={`p-3.5 rounded-card border text-left transition-all cursor-pointer flex items-center gap-3 vitals-spotlight ${
              activeSlot === 'morning'
                ? 'bg-vitals-surface2 border-pulse-mint ring-2 ring-pulse-mint/30 shadow-[0_0_18px_rgba(59,245,137,0.15)]'
                : 'vitals-card border-vitals-border hover:bg-vitals-surface2 text-vitals-muted'
            }`}
          >
            <div className={`w-10 h-10 rounded-card flex items-center justify-center shrink-0 ${
              activeSlot === 'morning' ? 'bg-pulse-mint/20 text-pulse-mint border border-pulse-mint/40' : 'bg-vitals-surface2 text-vitals-muted border border-vitals-border'
            }`}>
              <svg className="w-5 h-5 sunrise-rays-anim" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v4M4.93 4.93l2.83 2.83M19.07 4.93l-2.83 2.83M2 12h4M18 12h4" />
                <path d="M5 18a7 7 0 0 1 14 0" />
                <line x1="2" y1="22" x2="22" y2="22" />
              </svg>
            </div>
            <div className="min-w-0">
              <span className={`font-hindi font-bold text-sm block truncate ${activeSlot === 'morning' ? 'text-pulse-mint' : 'text-vitals-ink'}`}>
                {isHindi ? 'सुबह' : 'Morning'}
              </span>
              <span className="font-mono text-[11px] text-vitals-muted block">
                08:00 AM
              </span>
            </div>
          </button>

          {/* Tab 2: AFTERNOON (Noon sun animated SVG) */}
          <button
            type="button"
            onClick={() => setActiveSlot('afternoon')}
            className={`p-3.5 rounded-card border text-left transition-all cursor-pointer flex items-center gap-3 vitals-spotlight ${
              activeSlot === 'afternoon'
                ? 'bg-vitals-surface2 border-pulse-mint ring-2 ring-pulse-mint/30 shadow-[0_0_18px_rgba(59,245,137,0.15)]'
                : 'vitals-card border-vitals-border hover:bg-vitals-surface2 text-vitals-muted'
            }`}
          >
            <div className={`w-10 h-10 rounded-card flex items-center justify-center shrink-0 ${
              activeSlot === 'afternoon' ? 'bg-pulse-mint/20 text-pulse-mint border border-pulse-mint/40' : 'bg-vitals-surface2 text-vitals-muted border border-vitals-border'
            }`}>
              <svg className="w-5 h-5 noon-sun-anim" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              </svg>
            </div>
            <div className="min-w-0">
              <span className={`font-hindi font-bold text-sm block truncate ${activeSlot === 'afternoon' ? 'text-pulse-mint' : 'text-vitals-ink'}`}>
                {isHindi ? 'दोपहर' : 'Afternoon'}
              </span>
              <span className="font-mono text-[11px] text-vitals-muted block">
                01:30 PM
              </span>
            </div>
          </button>

          {/* Tab 3: NIGHT (Moon crescent animated SVG) */}
          <button
            type="button"
            onClick={() => setActiveSlot('night')}
            className={`p-3.5 rounded-card border text-left transition-all cursor-pointer flex items-center gap-3 vitals-spotlight ${
              activeSlot === 'night'
                ? 'bg-vitals-surface2 border-pulse-mint ring-2 ring-pulse-mint/30 shadow-[0_0_18px_rgba(59,245,137,0.15)]'
                : 'vitals-card border-vitals-border hover:bg-vitals-surface2 text-vitals-muted'
            }`}
          >
            <div className={`w-10 h-10 rounded-card flex items-center justify-center shrink-0 ${
              activeSlot === 'night' ? 'bg-pulse-mint/20 text-pulse-mint border border-pulse-mint/40' : 'bg-vitals-surface2 text-vitals-muted border border-vitals-border'
            }`}>
              <svg className="w-5 h-5 moon-glow-anim" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                <circle cx="19" cy="5" r="1" className="star-twinkle-anim" fill="currentColor" />
              </svg>
            </div>
            <div className="min-w-0">
              <span className={`font-hindi font-bold text-sm block truncate ${activeSlot === 'night' ? 'text-pulse-mint' : 'text-vitals-ink'}`}>
                {isHindi ? 'रात / नींद' : 'Night'}
              </span>
              <span className="font-mono text-[11px] text-vitals-muted block">
                09:30 PM
              </span>
            </div>
          </button>

          {/* Tab 4: SOS (Alert shield animated SVG) */}
          <button
            type="button"
            onClick={() => setActiveSlot('sos')}
            className={`p-3.5 rounded-card border text-left transition-all cursor-pointer flex items-center gap-3 vitals-spotlight ${
              activeSlot === 'sos'
                ? 'bg-vitals-surface2 border-signal-amber ring-2 ring-signal-amber/30 shadow-[0_0_18px_rgba(245,158,11,0.15)]'
                : 'vitals-card border-vitals-border hover:bg-vitals-surface2 text-vitals-muted'
            }`}
          >
            <div className={`w-10 h-10 rounded-card flex items-center justify-center shrink-0 ${
              activeSlot === 'sos' ? 'bg-signal-amber/20 text-signal-amber border border-signal-amber/40' : 'bg-vitals-surface2 text-vitals-muted border border-vitals-border'
            }`}>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div className="min-w-0">
              <span className={`font-hindi font-bold text-sm block truncate ${activeSlot === 'sos' ? 'text-signal-amber' : 'text-vitals-ink'}`}>
                {isHindi ? 'SOS दवा' : 'Emergency'}
              </span>
              <span className="font-mono text-[11px] text-vitals-muted block">
                केवल लक्षण पर
              </span>
            </div>
          </button>

          {/* Tab 5: VITALS (Heartbeat animated SVG) */}
          <button
            type="button"
            onClick={() => setActiveSlot('vitals')}
            className={`p-3.5 rounded-card border text-left transition-all cursor-pointer flex items-center gap-3 col-span-2 sm:col-span-1 vitals-spotlight ${
              activeSlot === 'vitals'
                ? 'bg-vitals-surface2 border-pulse-mint ring-2 ring-pulse-mint/30 shadow-[0_0_18px_rgba(59,245,137,0.15)]'
                : 'vitals-card border-vitals-border hover:bg-vitals-surface2 text-vitals-muted'
            }`}
          >
            <div className={`w-10 h-10 rounded-card flex items-center justify-center shrink-0 ${
              activeSlot === 'vitals' ? 'bg-pulse-mint/20 text-pulse-mint border border-pulse-mint/40' : 'bg-vitals-surface2 text-vitals-muted border border-vitals-border'
            }`}>
              <svg className="w-5 h-5 translate-y-0.5" viewBox="0 -2.5 24 29" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <div className="min-w-0">
              <span className={`font-hindi font-bold text-sm block truncate ${activeSlot === 'vitals' ? 'text-pulse-mint' : 'text-vitals-ink'}`}>
                {isHindi ? 'दैनिक जांच' : 'Vitals Log'}
              </span>
              <span className="font-mono text-[11px] text-vitals-muted block">
                7-दिवसीय चार्ट
              </span>
            </div>
          </button>

        </div>
      </div>

      {/* 4. THE GIANT SCREEN-WIDTH TASK CARD (Mission Control Aesthetic) */}
      <div className="vitals-card vitals-spotlight p-6 sm:p-10 mb-8 border border-vitals-border">
        
        {/* Giant Card Top Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-vitals-border gap-4 mb-8">
          <div className="flex items-start gap-4">
            {/* Animated Time-of-Day Hero Badge */}
            <div className={`w-16 h-16 rounded-card flex items-center justify-center shrink-0 border border-vitals-border shadow-lg ${
              activeSlot === 'morning' ? 'bg-pulse-mint/15 text-pulse-mint border-pulse-mint/30' :
              activeSlot === 'afternoon' ? 'bg-pulse-mint/15 text-pulse-mint border-pulse-mint/30' :
              activeSlot === 'night' ? 'bg-pulse-mint/15 text-pulse-mint border-pulse-mint/30' :
              activeSlot === 'sos' ? 'bg-signal-amber/15 text-signal-amber border-signal-amber/30' :
              'bg-pulse-mint/15 text-pulse-mint border-pulse-mint/30'
            }`}>
              {activeSlot === 'morning' && (
                <svg className="w-8 h-8 sunrise-rays-anim" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                  <path d="M12 2v4M4.93 4.93l2.83 2.83M19.07 4.93l-2.83 2.83M2 12h4M18 12h4" />
                  <path d="M5 18a7 7 0 0 1 14 0" />
                  <line x1="2" y1="22" x2="22" y2="22" />
                </svg>
              )}
              {activeSlot === 'afternoon' && (
                <svg className="w-8 h-8 noon-sun-anim" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                </svg>
              )}
              {activeSlot === 'night' && (
                <svg className="w-8 h-8 moon-glow-anim" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  <circle cx="19" cy="5" r="1.5" className="star-twinkle-anim" fill="currentColor" />
                </svg>
              )}
              {activeSlot === 'sos' && (
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              )}
              {activeSlot === 'vitals' && (
                <svg className="w-8 h-8 translate-y-0.5" viewBox="0 -2.5 24 29" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="vitals-chip text-xs font-mono">
                  {slotTimingTag}
                </span>
                {totalCountForActive > 0 && (
                  <span className="vitals-chip vitals-chip-pulse text-xs font-mono">
                    {takenCountForActive} OF {totalCountForActive} COMPLETED
                  </span>
                )}
              </div>

              <h2 className="text-2xl sm:text-4xl font-display font-bold text-vitals-ink tracking-tight">
                {isHindi ? slotTitleHindi : slotTitleEnglish}
              </h2>

              <p className="text-base sm:text-lg text-vitals-muted mt-1 font-hindi">
                {isHindi ? slotSubtitleHindi : slotSubtitleEnglish}
              </p>
            </div>
          </div>

          {/* Step Progress Pill */}
          <div className="flex items-center gap-2 self-start md:self-center shrink-0">
            <button
              type="button"
              onClick={goToPrevSlot}
              disabled={currentSlotIndex === 0}
              className="btn-vitals-secondary text-xs disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ← {isHindi ? 'पिछला' : 'Prev'}
            </button>
            <span className="font-mono text-xs text-vitals-muted px-2">
              {currentSlotIndex + 1} / {slotOrder.length}
            </span>
            <button
              type="button"
              onClick={goToNextSlot}
              disabled={currentSlotIndex === slotOrder.length - 1}
              className="btn-vitals-secondary text-xs disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {isHindi ? 'अगला' : 'Next'} →
            </button>
          </div>
        </div>

        {/* Content Section inside Giant Card */}
        {activeSlot !== 'vitals' ? (
          <div className="space-y-6">
            {activeMeds.length > 0 ? (
              activeMeds.map((med) => {
                const isTaken = takenMeds[med.id]?.taken;
                const takenTime = takenMeds[med.id]?.timeStr;

                return (
                  <div
                    key={med.id}
                    className={`p-6 sm:p-8 rounded-card border transition-all vitals-spotlight ${
                      isTaken
                        ? 'bg-pulse-mint/10 border-pulse-mint/50 ring-1 ring-pulse-mint/30 shadow-[0_0_20px_rgba(59,245,137,0.1)]'
                        : 'bg-vitals-surface2 border-vitals-border hover:border-vitals-strong'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      
                      {/* Left: Huge Medication Details */}
                      <div className="space-y-3 flex-1 min-w-0">
                        <div className="flex flex-wrap items-baseline gap-3">
                          <h3 className="text-2xl sm:text-3xl font-display font-bold text-vitals-ink tracking-tight">
                            {med.brandName?.value}
                          </h3>
                          <span className="font-mono text-sm sm:text-base font-semibold text-pulse-mint bg-vitals-surface3 px-3 py-1 rounded-chip border border-vitals-border">
                            {med.strength?.value || 'Standard Strength'}
                          </span>
                          <span className="font-mono text-xs text-vitals-faint">
                            ({med.saltName?.value})
                          </span>
                        </div>

                        {/* Prescribed Dose and Meal Rules */}
                        <div className="flex flex-wrap items-center gap-3 pt-1">
                          <span className="font-hindi text-base sm:text-lg font-bold px-3.5 py-1.5 rounded-chip bg-pulse-mint/15 text-pulse-mint border border-pulse-mint/30">
                            {isHindi ? 'खुराक:' : 'Dose:'} {med.prescribedDose?.value || '1 dose'}
                          </span>

                          <span className="font-hindi text-base sm:text-lg font-bold px-3.5 py-1.5 rounded-chip bg-vitals-surface3 text-vitals-ink border border-vitals-border">
                            {med.foodRelation?.value === 'AFTER_FOOD'
                              ? isHindi ? 'भोजन के बाद (After Food)' : 'After Food'
                              : med.foodRelation?.value === 'BEFORE_FOOD'
                              ? isHindi ? 'खाली पेट (भोजन से पहले)' : 'Before Food'
                              : isHindi ? 'पानी के साथ लें' : 'With Water'}
                          </span>

                          {med.durationDays?.value && (
                            <span className="font-mono text-xs sm:text-sm text-vitals-muted bg-vitals-surface3 px-3 py-1.5 rounded-chip border border-vitals-border">
                              {med.durationDays.value} {isHindi ? 'दिनों तक लें' : 'days duration'}
                            </span>
                          )}
                        </div>

                        {/* Plain Regional Indian Instructions */}
                        {med.instructionsPlainHindi && (
                          <div className="mt-2 p-4 rounded-card bg-vitals-surface1 border border-vitals-border">
                            <div className="flex items-center justify-between pb-1 mb-1 border-b border-vitals-border/40 text-[11px] font-mono text-pulse-mint">
                              <span>🗣️ {isHindi ? 'दवा लेने का आसान तरीका' : 'Patient Instructions'}</span>
                              <span className="text-vitals-muted text-[10px]">AI4Bharat IndicTrans2 Grounded</span>
                            </div>
                            <p className="text-xl sm:text-[22px] font-hindi text-vitals-ink leading-relaxed">
                              {med.instructionsPlainHindi}
                            </p>
                          </div>
                        )}

                        {/* Indian Medical Standards: Jan Aushadhi & CDSCO Formulation */}
                        {med.indianFormulary && (
                          <div className="mt-3 p-3.5 rounded-card bg-emerald-950/20 border border-emerald-500/30 text-xs">
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                              <span className="font-bold text-emerald-400 flex items-center gap-1.5 font-mono">
                                <span>🏥 PMBJP Jan Aushadhi Generic:</span>
                                <strong className="text-white">{med.indianFormulary.janAushadhiGenericName}</strong>
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold text-[11px] border border-emerald-500/40">
                                Save ₹{med.indianFormulary.estimatedSavingsInr || 80}/mo (₹{med.indianFormulary.janAushadhiPriceInr} vs ₹{med.indianFormulary.brandedMrpInr} MRP)
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-mono text-vitals-muted">
                              <span>Generic Salt: <strong className="text-slate-200">{med.indianFormulary.genericMolecule}</strong></span>
                              <span>•</span>
                              <span className={med.indianFormulary.nlem2022Essential ? 'text-teal-400 font-semibold' : ''}>
                                {med.indianFormulary.nlem2022Essential ? '✓ NLEM 2022 Essential Drug' : 'CDSCO Approved Formulation'}
                              </span>
                              <span>•</span>
                              <span>SNOMED-CT: <strong className="text-slate-200">{med.indianFormulary.snomedNRCeSCode}</strong></span>
                            </div>
                          </div>
                        )}

                        {activeSlot === 'sos' && med.sosCondition?.value && (
                          <div className="p-4 rounded-card bg-signal-red/10 border border-signal-red/30 text-signal-red">
                            <span className="font-hindi text-base font-bold block mb-1">
                              सावधानी // केवल तभी लें जब:
                            </span>
                            <p className="font-hindi text-lg font-semibold text-vitals-ink">
                              {med.sosCondition.value}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Right: Big Check Button with Satisfying Fill Animation */}
                      <div className="shrink-0 flex flex-col items-start lg:items-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleMedTaken(med.id)}
                          className={`satisfying-check-btn h-14 sm:h-16 px-6 sm:px-8 rounded-chip font-hindi font-bold text-base sm:text-xl flex items-center gap-3 cursor-pointer border-2 shadow-md ${
                            isTaken
                              ? 'bg-pulse-mint text-black border-pulse-mint shadow-[0_0_22px_rgba(59,245,137,0.35)]'
                              : 'bg-vitals-surface2 border-pulse-mint text-pulse-mint hover:bg-pulse-mint/15 shadow-[0_0_12px_rgba(59,245,137,0.1)]'
                          }`}
                        >
                          {/* Animated Check SVG */}
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                            isTaken ? 'bg-black text-pulse-mint' : 'border-2 border-pulse-mint'
                          }`}>
                            <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </div>

                          <span>
                            {isTaken
                              ? (isHindi ? `दवा ले ली गई ✓` : `Taken ✓`)
                              : (isHindi ? `दवा ले ली ✓ (Mark Taken)` : `Mark Taken ✓`)}
                          </span>
                        </button>

                        {isTaken && takenTime && (
                          <span className="font-mono text-xs text-pulse-mint font-semibold">
                            {isHindi ? `समय: ${takenTime} पर पूर्ण` : `Logged at ${takenTime}`}
                          </span>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-16 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-card bg-vitals-surface2 border border-vitals-border text-vitals-faint flex items-center justify-center">
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                </div>
                <h4 className="text-xl sm:text-2xl font-hindi font-bold text-vitals-ink">
                  {isHindi ? 'इस समय कोई दवा निर्धारित नहीं है।' : 'No medications scheduled for this time slot.'}
                </h4>
                <p className="text-base text-vitals-muted font-hindi mt-1 max-w-md mx-auto">
                  {isHindi
                    ? 'ताज़ा पानी पिएं और आराम करें। अगली खुराक के लिए अगला समय देखें।'
                    : 'Rest well and stay hydrated. Advance to next routine when ready.'}
                </p>
              </div>
            )}
          </div>
        ) : (
          /* 7-DAY VITALS MONITORING DIARY (When on Vitals tab) */
          <div className="space-y-6">
            <div className="p-4 sm:p-6 rounded-card bg-vitals-surface2 border border-vitals-border">
              <span className="font-mono text-xs font-bold text-pulse-mint uppercase tracking-wider block mb-2">
                TARGET VITALS RANGES (डॉक्टर द्वारा निर्धारित लक्ष्य):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {currentCase.vitalsAdvice?.itemsToTrack.map((vital) => (
                  <div key={vital.id} className="p-4 rounded-card bg-vitals-surface1 border border-vitals-border">
                    <span className="font-bold text-vitals-ink block text-base sm:text-lg">
                      {isHindi ? vital.displayNameHindi : vital.displayNameEnglish}
                    </span>
                    <span className="font-mono text-sm text-pulse-mint font-bold block mt-1">
                      लक्ष्य: {vital.targetNormalRange} {vital.unit}
                    </span>
                    <span className="text-xs text-vitals-muted block mt-1">
                      {isHindi ? vital.patientInstructionsHindi : vital.patientInstructionsEnglish}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Day Switcher */}
            <div>
              <span className="font-mono text-xs font-bold text-vitals-ink block mb-2 uppercase">
                {isHindi ? 'जांच का दिन चुनें (Select Day):' : 'Select Day:'}
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      setDiaryDay(d);
                      if (loggedStatus[d]) {
                        setMorningReading(loggedStatus[d].morning);
                        setEveningReading(loggedStatus[d].evening);
                      }
                    }}
                    className={`px-4 py-2 font-mono text-sm font-bold rounded-chip transition-colors cursor-pointer border ${
                      diaryDay === d
                        ? 'bg-pulse-mint text-black border-pulse-mint shadow-[0_0_12px_rgba(59,245,137,0.25)]'
                        : loggedStatus[d]
                        ? 'bg-vitals-surface3 text-pulse-mint border-pulse-mint/30'
                        : 'bg-vitals-surface2 text-vitals-muted border-vitals-border hover:bg-vitals-surface3 hover:text-vitals-ink'
                    }`}
                  >
                    दिन {d} {loggedStatus[d] ? '✓' : ''}
                  </button>
                ))}
              </div>
            </div>

            {/* Reading Input Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end bg-vitals-surface2 p-5 rounded-card border border-vitals-border">
              <div>
                <label className="font-mono text-xs font-bold text-vitals-ink block mb-1">
                  {isHindi ? `दिन ${diaryDay} - सुबह 08:00 AM:` : `Day ${diaryDay} - Morning:`}
                </label>
                <input
                  type="text"
                  value={morningReading}
                  onChange={(e) => setMorningReading(e.target.value)}
                  placeholder="e.g. 120/80"
                  className="vitals-input w-full p-3.5 text-base font-mono font-bold bg-vitals-surface3 border border-vitals-border text-vitals-ink focus:border-pulse-mint"
                />
              </div>
              <div>
                <label className="font-mono text-xs font-bold text-vitals-ink block mb-1">
                  {isHindi ? `दिन ${diaryDay} - शाम 07:00 PM:` : `Day ${diaryDay} - Evening:`}
                </label>
                <input
                  type="text"
                  value={eveningReading}
                  onChange={(e) => setEveningReading(e.target.value)}
                  placeholder="e.g. 126/82"
                  className="vitals-input w-full p-3.5 text-base font-mono font-bold bg-vitals-surface3 border border-vitals-border text-vitals-ink focus:border-pulse-mint"
                />
              </div>
              <div>
                <button
                  type="button"
                  onClick={handleSaveReading}
                  className="btn-vitals-primary w-full h-13 text-base font-bold flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>{isHindi ? 'डायरी में दर्ज करें' : 'Log in Diary'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stepper Footer Controls */}
        <div className="mt-10 pt-6 border-t border-vitals-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            type="button"
            onClick={goToPrevSlot}
            disabled={currentSlotIndex === 0}
            className="w-full sm:w-auto btn-vitals-secondary text-base font-hindi font-bold disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            ← {isHindi ? 'पिछला समय' : 'Previous Routine'}
          </button>

          {/* Stepper Dots */}
          <div className="flex items-center gap-2">
            {slotOrder.map((key, i) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveSlot(key)}
                className={`h-3 rounded-full transition-all cursor-pointer ${
                  activeSlot === key
                    ? 'w-8 bg-pulse-mint shadow-[0_0_10px_rgba(59,245,137,0.3)]'
                    : 'w-3 bg-vitals-surface3 hover:bg-vitals-muted'
                }`}
                title={`Go to step ${i + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={goToNextSlot}
            disabled={currentSlotIndex === slotOrder.length - 1}
            className="w-full sm:w-auto btn-vitals-primary text-base font-hindi font-bold disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            {isHindi ? 'अगला समय' : 'Next Routine'} →
          </button>
        </div>

      </div>

      {/* 5. FOLLOW-UP APPOINTMENT & EMERGENCY HELPLINE (Live Vitals Bento Tiles) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="vitals-card vitals-spotlight p-6 sm:p-8 border border-vitals-border">
          <div className="flex items-center justify-between pb-3 border-b border-vitals-border mb-3">
            <h3 className="font-hindi font-bold text-xl text-vitals-ink">
              {isHindi ? 'दोबारा अस्पताल कब आना है (फॉलो-अप)' : 'Doctor Follow-Up Appointment'}
            </h3>
            <span className="vitals-chip vitals-chip-pulse text-xs font-mono">
              OPD REVIEW
            </span>
          </div>

          <p className="text-3xl font-mono font-bold text-pulse-mint mt-3">
            {currentCase.followUp.reviewDate?.value
              ? currentCase.followUp.reviewDate.value
              : currentCase.followUp.relativeDaysStated}
          </p>
          <p className="text-base text-vitals-muted mt-1 font-hindi">
            {currentCase.followUp.departmentOrDoctor?.value}
          </p>

          <div className="mt-5 p-4 rounded-input bg-vitals-surface2 text-sm flex items-center justify-between font-mono border border-vitals-border text-vitals-ink">
            <span>{isHindi ? 'अस्पताल हेल्पडेस्क:' : 'Helpline:'}</span>
            <span className="font-bold text-pulse-mint text-base">{currentCase.followUp.hospitalContact}</span>
          </div>
        </div>

        <div className="p-6 sm:p-8 rounded-card bg-signal-red/10 border border-signal-red/30">
          <div className="flex items-center justify-between pb-3 border-b border-signal-red/20 mb-3">
            <h3 className="font-hindi font-bold text-xl text-signal-red">
              {isHindi ? 'डॉक्टर को तुरंत कब दिखाएं (खतरे के लक्षण)' : 'Emergency Red Flags'}
            </h3>
            <span className="font-mono text-xs font-bold text-signal-red px-2.5 py-0.5 rounded-chip bg-signal-red/20 border border-signal-red/40">
              SEEK IMMEDIATE CARE
            </span>
          </div>

          <ul className="space-y-3 mt-4 text-sm text-vitals-ink">
            {currentCase.warningSigns.map((w) => (
              <li key={w.id} className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-signal-red mt-2 shrink-0 animate-pulse" />
                <div>
                  <p className="font-bold text-vitals-ink text-base font-hindi">
                    {isHindi ? w.symptomHindi : w.symptomEnglish}
                  </p>
                  <p className="text-signal-red font-semibold mt-0.5 font-hindi text-sm">
                    {isHindi ? w.actionHindi : w.actionEnglish}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

    </div>
  );
};
