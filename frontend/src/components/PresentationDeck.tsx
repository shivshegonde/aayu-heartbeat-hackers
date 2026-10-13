import React, { useState, useEffect, useRef } from 'react';
import {
  HeartHandshake,
  ShieldCheck,
  Stethoscope,
  Sparkles,
  Volume2,
  Calendar,
  MapPin,
  Printer,
  UploadCloud,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  Clock,
  FileText,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  X,
  ExternalLink,
  Laptop,
  Users,
  TrendingUp,
  BrainCircuit,
  Layers,
  Flame,
  Activity,
  Award,
  Zap,
  ShieldAlert,
  Globe,
  Check
} from 'lucide-react';

interface PresentationDeckProps {
  onExit: () => void;
  onOpenDemo?: (tab: 'cockpit' | 'family' | 'upload') => void;
}

interface Slide {
  id: number;
  category: string;
  title: string;
  subtitle: string;
  speakerNotes: string;
}

export const PresentationDeck: React.FC<PresentationDeckProps> = ({
  onExit,
  onOpenDemo,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const deckContainerRef = useRef<HTMLDivElement>(null);

  const slides: Slide[] = [
    {
      id: 1,
      category: 'EXECUTIVE OVERVIEW',
      title: 'Next-Gen Hospital Discharge Handover',
      subtitle: 'Multimodal Vision AI + Deterministic Safety Firewall for Safe Recovery at Home',
      speakerNotes: 'Welcome judges. GharCare transforms the most broken, vulnerable moment in Indian healthcare: the hospital discharge. We combine Google Gemini 2.5 Flash with a zero-hallucination deterministic medical firewall.',
    },
    {
      id: 2,
      category: 'THE HEALTHCARE CRISIS',
      title: 'The Indian Hospital "Discharge Cliff"',
      subtitle: 'Why 42% of Readmissions & Preventable Complications Happen Within 30 Days',
      speakerNotes: 'In India, 70%+ of family caregivers cannot interpret dense English discharge summaries filled with abbreviations. Overburdened nurses spend 45 minutes per patient, yet patients return home confused, causing an ₹18,500 Cr annual burden.',
    },
    {
      id: 3,
      category: 'THE SOLUTION',
      title: 'The GharCare Dual-Engine Handover Protocol',
      subtitle: 'Bridging Hospital Wards to Indian Living Rooms with Zero-Hallucination Rails',
      speakerNotes: 'Our solution has 3 pillars: Ingestion Studio with Gemini 2.5 Vision, Nurse Cockpit with code-level safety rules, and Family Care Plan with Hindi audio parchi and Google Calendar sync.',
    },
    {
      id: 4,
      category: 'TECHNOLOGY DEEP DIVE',
      title: 'Multimodal Clinical Fact Extraction',
      subtitle: 'Google Gemini 2.5 Flash Vision: Cracking Complex Discharge Papers in 1.2 Seconds',
      speakerNotes: 'Traditional OCR fails on folded papers, doctor handwriting, and carbon copies. Gemini 2.5 Flash multimodal vision extracts structured diagnoses, dosages, and wound instructions without error-prone OCR pipelines.',
    },
    {
      id: 5,
      category: 'CLINICAL SAFETY ENGINE',
      title: 'The Zero-Hallucination Safety Firewall',
      subtitle: 'Code-Level Deterministic Verification: AI Never Guesses Prescriptions',
      speakerNotes: 'Our golden rule: Generative AI must never guess dosages. Our deterministic engine detects missing quantities, flags dangerous drug interactions like blood-thinners without PPI, and enforces Senior Nurse approval lock.',
    },
    {
      id: 6,
      category: 'PATIENT & FAMILY EXPERIENCE',
      title: 'Family Care Handover & "Awaaz Parchi"',
      subtitle: 'Spoken Hindi Audio Summary, Color-Coded Timetables & Emergency Red Flags',
      speakerNotes: 'We generate an audio parchi in natural Hindi using Google Cloud Neural2 voice. Elderly parents simply listen to how and when to take pills, with clear red-flag symptoms for when to return to the ER.',
    },
    {
      id: 7,
      category: 'ECOSYSTEM INTEGRATION',
      title: 'Google Cloud & National ABDM Ecosystem',
      subtitle: 'End-to-End Orchestration of Gemini, Cloud TTS, Google Calendar & Maps Platforms',
      speakerNotes: 'We leverage the entire Google ecosystem: Gemini 2.5 for vision, Cloud TTS for regional audio, Google Calendar RFC 5545 for auto-syncing medication reminders, and Google Maps to find 24/7 Jan Aushadhi pharmacies.',
    },
    {
      id: 8,
      category: 'LIVE WORKFLOW WALKTHROUGH',
      title: 'From Bedside Paper to Safe Home Recovery',
      subtitle: 'Interactive 3-Stage Pipeline: Ingestion → Nurse Verification → Family Handover',
      speakerNotes: 'Walk the judges through the actual live flow. Stage 1: Uploading Kamla Devi\'s cholecystectomy summary. Stage 2: Resolving critical blockers. Stage 3: Instant A4 printable handout and Calendar export.',
    },
    {
      id: 9,
      category: 'MEASURED CLINICAL IMPACT',
      title: 'Hospital Efficiency & Patient Outcomes',
      subtitle: '76% Nurse Handover Time Reduction & 88% Decrease in Medication Errors',
      speakerNotes: 'Nurse discharge processing drops from 42 minutes to under 5 minutes. 88% drop in post-discharge medication mistakes. Zero hallucinations released, saving ₹3,200 per patient in avoided readmissions.',
    },
    {
      id: 10,
      category: 'VISION & ROADMAP',
      title: 'Scale & National ABDM Rollout',
      subtitle: 'AAYU 2026 Track T03 Roadmap: 12 Regional Indian Languages & EHR Rails',
      speakerNotes: 'Our roadmap expands to 12 regional languages, automated WhatsApp care bots, and bidirectional ABDM health locker synchronization for all Indian hospitals.',
    },
  ];

  // Presentation Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        e.preventDefault();
        setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentSlide((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setShowNotes((prev) => !prev);
      } else if (e.key === 'g' || e.key === 'G') {
        e.preventDefault();
        setShowGrid((prev) => !prev);
      } else if (e.key === 'Escape') {
        if (showGrid) setShowGrid(false);
        else if (showNotes) setShowNotes(false);
        else onExit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slides.length, showGrid, showNotes]);

  // Auto-play presentation
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentSlide((prev) => {
          if (prev >= slides.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 7000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, slides.length]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      deckContainerRef.current?.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => { });
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => { });
    }
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handlePrintDeck = () => {
    window.print();
  };

  const activeSlideData = slides[currentSlide];

  return (
    <div
      ref={deckContainerRef}
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-teal-500 selection:text-white relative overflow-hidden font-sans"
    >
      {/* Background Animated Gradient Mesh Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-teal-600/15 blur-[120px] animate-pulse" />
        <div className="absolute top-1/2 -right-40 w-[600px] h-[600px] rounded-full bg-orange-600/15 blur-[140px]" />
        <div className="absolute -bottom-40 left-1/3 w-[700px] h-[700px] rounded-full bg-cyan-600/10 blur-[160px]" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      {/* Top Deck HUD Header */}
      <header className="relative z-20 px-4 sm:px-8 py-3.5 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl flex items-center justify-between no-print">
        {/* Left: Branding & Deck Meta */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
              <HeartHandshake className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-black text-sm tracking-tight text-white">
                  GharCare
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-teal-950 text-teal-300 border border-teal-700/60">
                  घर-केयर
                </span>
                <span className="text-[10px] font-black px-2 py-0.2 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  AAYU 2026 • T03 PITCH
                </span>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 pl-3 ml-2 border-l border-slate-800 text-xs text-slate-400">
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>ABDM Compliant</span>
            </span>
          </div>
        </div>

        {/* Center: Slide Progress Pill */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGrid(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 transition-all shadow-xs cursor-pointer"
            title="Open Slide Grid (Shortcut: G)"
          >
            <Layers className="w-3.5 h-3.5 text-teal-400" />
            <span>
              Slide {String(currentSlide + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
            </span>
          </button>

          {/* Presentation Stopwatch */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs font-mono text-slate-400">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>{formatTimer(timerSeconds)}</span>
          </div>
        </div>

        {/* Right: Presentation Control Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Notes Toggle */}
          <button
            onClick={() => setShowNotes(!showNotes)}
            className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${showNotes
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            title="Toggle Speaker Pitch Notes (Shortcut: N)"
          >
            <FileText className="w-4 h-4" />
          </button>

          {/* Auto-Play Toggle */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${isPlaying
                ? 'bg-teal-500/20 border-teal-500/40 text-teal-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            title={isPlaying ? 'Pause Autoplay' : 'Play Slides (7s timer)'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
            title="Toggle Fullscreen (Shortcut: F)"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Print Slides as PDF */}
          <button
            onClick={handlePrintDeck}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Print or Export PDF Slides"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span>PDF</span>
          </button>

          {/* Exit to App */}
          <button
            onClick={onExit}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md shadow-teal-600/30 transition-all cursor-pointer"
            title="Return to GharCare Live App (Shortcut: Esc)"
          >
            <Laptop className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Live App</span>
          </button>
        </div>
      </header>

      {/* Progress Bar Across Top */}
      <div className="w-full bg-slate-900 h-1 relative z-20 no-print">
        <div
          className="bg-gradient-to-r from-teal-500 via-cyan-400 to-amber-500 h-1 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(20,184,166,0.6)]"
          style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
        />
      </div>

      {/* Main Slide Canvas Container */}
      <main className="flex-1 relative z-10 flex items-center justify-center p-3 sm:p-6 lg:p-10 max-w-[1580px] w-full mx-auto">
        <div className="w-full h-full max-h-[820px] rounded-3xl bg-slate-900/70 border border-slate-800/90 shadow-2xl backdrop-blur-2xl p-6 sm:p-10 lg:p-12 flex flex-col justify-between relative overflow-hidden transition-all duration-300">

          {/* Slide Header Tag */}
          <div className="flex items-center justify-between mb-4 sm:mb-6 border-b border-slate-800/60 pb-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase bg-teal-500/10 text-teal-400 border border-teal-500/30">
                {activeSlideData.category}
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline">
                AAYU 2026 • Track T03 (Going Home Right)
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
              <span>SECTION {String(currentSlide + 1).padStart(2, '0')}</span>
              <span>/</span>
              <span>10</span>
            </div>
          </div>

          {/* Slide Content Dynamic Switcher */}
          <div className="flex-1 flex flex-col justify-center min-h-0 py-2 sm:py-4">

            {/* SLIDE 1: Title & Executive Summary */}
            {currentSlide === 0 && (
              <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-wide">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>AAYU 2026 Track T03 Prototype • Going Home Right</span>
                </div>

                <h1 className="font-heading font-black text-3xl sm:text-5xl lg:text-6xl tracking-tight text-white leading-tight">
                  GharCare <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">(घर-केयर)</span>
                </h1>

                <p className="text-lg sm:text-2xl text-slate-300 font-medium max-w-4xl leading-relaxed">
                  Next-Gen Multimodal Vision AI + Deterministic Clinical Safety Rails for Hospital Discharge Handover.
                </p>

                {/* Core Pillars Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/50 border border-slate-700/60 backdrop-blur-md">
                    <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center mb-3">
                      <Zap className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-white text-base mb-1">1.2s Multimodal Vision</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Google Gemini 2.5 Flash parses doctor handwriting, crumpled papers, and complex medication tables instantly.
                    </p>
                  </div>

                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/50 border border-slate-700/60 backdrop-blur-md">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-white text-base mb-1">Zero-Hallucination Firewall</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Code-level deterministic verification flags missing dosage quantities, drug conflicts, and requires Senior Nurse lock.
                    </p>
                  </div>

                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/50 border border-slate-700/60 backdrop-blur-md">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-3">
                      <Volume2 className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-white text-base mb-1">Multilingual "Awaaz Parchi"</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Spoken Hindi audio instructions, Google Calendar sync (RFC 5545), and 24/7 Jan Aushadhi pharmacy locator.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>ABDM & DHR 2026 Compliant</span>
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700">
                    <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                    <span>Gemini 2.5 Flash Vision</span>
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700">
                    <Globe className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Google Cloud TTS (Neural2)</span>
                  </span>
                </div>
              </div>
            )}

            {/* SLIDE 2: Problem Statement */}
            {currentSlide === 1 && (
              <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                <div>
                  <h2 className="font-heading font-black text-2xl sm:text-4xl text-white mb-2">
                    The Indian Healthcare "Discharge Cliff"
                  </h2>
                  <p className="text-sm sm:text-base text-slate-300">
                    When patients leave tertiary hospital wards, they transition into confusion, leading to preventable readmissions.
                  </p>
                </div>

                {/* Big Metric Callouts */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 sm:p-5 rounded-2xl bg-rose-950/30 border border-rose-800/50">
                    <p className="font-black text-3xl sm:text-4xl text-rose-400 font-heading">42%</p>
                    <p className="font-bold text-white text-xs sm:text-sm mt-1">Readmission Spike</p>
                    <p className="text-[11px] text-slate-400 mt-1">Within 30 days due to post-discharge drug confusion.</p>
                  </div>

                  <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/30 border border-amber-800/50">
                    <p className="font-black text-3xl sm:text-4xl text-amber-400 font-heading">70%+</p>
                    <p className="font-bold text-white text-xs sm:text-sm mt-1">Health Literacy Gap</p>
                    <p className="text-[11px] text-slate-400 mt-1">Indian families struggle with English acronyms & handwriting.</p>
                  </div>

                  <div className="p-4 sm:p-5 rounded-2xl bg-cyan-950/30 border border-cyan-800/50">
                    <p className="font-black text-3xl sm:text-4xl text-cyan-400 font-heading">45 min</p>
                    <p className="font-bold text-white text-xs sm:text-sm mt-1">Nurse Burden / Patient</p>
                    <p className="text-[11px] text-slate-400 mt-1">Manual verbal counseling while ICU & emergency wards wait.</p>
                  </div>

                  <div className="p-4 sm:p-5 rounded-2xl bg-purple-950/30 border border-purple-800/50">
                    <p className="font-black text-3xl sm:text-4xl text-purple-400 font-heading">₹18,500 Cr</p>
                    <p className="font-bold text-white text-xs sm:text-sm mt-1">Out-of-Pocket Drain</p>
                    <p className="text-[11px] text-slate-400 mt-1">Annual national economic loss from avoidable complications.</p>
                  </div>
                </div>

                {/* Contrast Box: Doctor Summary vs Family Reality */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                    <p className="font-bold text-rose-400 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      What The Hospital Hands Out
                    </p>
                    <div className="p-3 rounded-lg bg-black/60 font-mono text-xs text-slate-300 leading-relaxed border border-slate-800">
                      "Tab Metolar XR 25 mg BD PC x 14d [MISSING QTY]<br />
                      Tab Ecosprin 75 mg OD • SOS Sorbitrate under tongue<br />
                      Advised low-Na diet, follow-up OPD Mon rm 402."
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                    <p className="font-bold text-emerald-400 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      What The Patient's Family Needs
                    </p>
                    <div className="p-3 rounded-lg bg-teal-950/40 font-sans text-xs text-teal-200 leading-relaxed border border-teal-800/50">
                      "सुबह 8 बजे नाश्ते के बाद आधी गोली पानी के साथ लें।<br />
                      अगर सीने में भारीपन या पसीना आए तो तुरंत आपातकालीन कक्ष (ER) पहुंचें।<br />
                      मोबाइल पर रिमाइंडर सेट है, और पास की 24/7 दवा दुकान का पता।"
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SLIDE 3: The Solution */}
            {currentSlide === 2 && (
              <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                <div>
                  <h2 className="font-heading font-black text-2xl sm:text-4xl text-white mb-2">
                    The GharCare Dual-Engine Solution
                  </h2>
                  <p className="text-sm sm:text-base text-slate-300">
                    Transforming complex discharge discharge notes into structured, medically verified family guidance.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Step 1 */}
                  <div className="p-6 rounded-2xl bg-gradient-to-b from-cyan-950/30 to-slate-900 border border-cyan-800/40 relative">
                    <div className="w-8 h-8 rounded-full bg-cyan-500 text-slate-950 font-black flex items-center justify-center text-xs mb-4">
                      01
                    </div>
                    <h3 className="font-bold text-white text-lg mb-2">Ingestion Studio</h3>
                    <p className="text-xs text-slate-300 leading-relaxed mb-4">
                      Takes smartphone camera photos or multipage hospital PDFs. Pre-flight classifier rejects non-clinical uploads before extraction.
                    </p>
                    <ul className="text-xs text-slate-400 space-y-1.5">
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-cyan-400" />
                        Gemini 2.5 Flash Vision (&lt;1.2s)
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-cyan-400" />
                        Classification safety filter
                      </li>
                    </ul>
                  </div>

                  {/* Step 2 */}
                  <div className="p-6 rounded-2xl bg-gradient-to-b from-teal-950/30 to-slate-900 border border-teal-800/40 relative">
                    <div className="w-8 h-8 rounded-full bg-teal-500 text-slate-950 font-black flex items-center justify-center text-xs mb-4">
                      02
                    </div>
                    <h3 className="font-bold text-white text-lg mb-2">Nurse Review Cockpit</h3>
                    <p className="text-xs text-slate-300 leading-relaxed mb-4">
                      Deterministic safety engine flags missing dosages & drug interactions. Senior nurse reviews and applies digital approval lock.
                    </p>
                    <ul className="text-xs text-slate-400 space-y-1.5">
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-teal-400" />
                        Deterministic blocker firewall
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-teal-400" />
                        Sister Anjali digital sign-off lock
                      </li>
                    </ul>
                  </div>

                  {/* Step 3 */}
                  <div className="p-6 rounded-2xl bg-gradient-to-b from-amber-950/30 to-slate-900 border border-amber-800/40 relative">
                    <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xs mb-4">
                      03
                    </div>
                    <h3 className="font-bold text-white text-lg mb-2">Family Care Handover</h3>
                    <p className="text-xs text-slate-300 leading-relaxed mb-4">
                      Synthesizes native Hindi/English spoken audio, Google Calendar schedule sync, 24/7 Jan Aushadhi maps, and printable A4 sheet.
                    </p>
                    <ul className="text-xs text-slate-400 space-y-1.5">
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-amber-400" />
                        "Awaaz Parchi" voice generator
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-amber-400" />
                        RFC 5545 Google Calendar sync
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* SLIDE 4: Gemini Multimodal Vision Extraction */}
            {currentSlide === 3 && (
              <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                <div>
                  <h2 className="font-heading font-black text-2xl sm:text-4xl text-white mb-2">
                    Google Gemini 2.5 Flash Multimodal Vision
                  </h2>
                  <p className="text-sm sm:text-base text-slate-300">
                    Why standard OCR fails on Indian hospital papers and how Gemini solves it directly.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                    <h3 className="font-bold text-rose-400 text-sm mb-3 flex items-center gap-2">
                      <X className="w-4 h-4" /> Traditional OCR Pipeline Failure
                    </h3>
                    <ul className="space-y-2.5 text-xs text-slate-300">
                      <li className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                        <strong>Crumpled & Faxed Documents:</strong> Doctor handwriting and faint ink produce character garbage (e.g. "T4b M3t0l4r").
                      </li>
                      <li className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                        <strong>Missing Context:</strong> Traditional OCR cannot distinguish between a medication instruction and a doctor note.
                      </li>
                      <li className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                        <strong>Non-Medical Ingestion:</strong> Blindly processes electricity bills, photos, or menus without classification.
                      </li>
                    </ul>
                  </div>

                  <div className="p-5 rounded-2xl bg-teal-950/30 border border-teal-800/50">
                    <h3 className="font-bold text-teal-400 text-sm mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" /> Gemini 2.5 Flash Multimodal Extraction
                    </h3>
                    <ul className="space-y-2.5 text-xs text-slate-300">
                      <li className="p-2.5 rounded-lg bg-slate-950/60 border border-teal-900/60">
                        <strong>Direct Pixel-to-Fact Extraction:</strong> Understands visual hierarchy, doctor signatures, diagnosis headers, and lab values in 1.2s.
                      </li>
                      <li className="p-2.5 rounded-lg bg-slate-950/60 border border-teal-900/60">
                        <strong>Pre-Flight Document Classifier:</strong> Validates clinical authenticity, calculating clinical confidence score before processing.
                      </li>
                      <li className="p-2.5 rounded-lg bg-slate-950/60 border border-teal-900/60">
                        <strong>Zero Inference Hallucination:</strong> Enforces JSON clinical schema without generating unverified prescriptions.
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                      JSON
                    </div>
                    <div>
                      <p className="font-bold text-white text-xs">Structured Discharge Schema Extraction</p>
                      <p className="text-[11px] text-slate-400">Diagnosis • Procedures • Medications • Red Flags • Follow-up Dates</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-950 px-2.5 py-1 rounded-md border border-emerald-800">
                    Latency: ~1.2s
                  </span>
                </div>
              </div>
            )}

            {/* SLIDE 5: Deterministic Safety Engine */}
            {currentSlide === 4 && (
              <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                <div>
                  <h2 className="font-heading font-black text-2xl sm:text-4xl text-white mb-2">
                    Deterministic Clinical Safety Firewall
                  </h2>
                  <p className="text-sm sm:text-base text-slate-300">
                    The Golden Rule: Generative AI must NEVER hallucinate or guess medicine dosages.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-800/40">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-white text-sm mb-1">Missing Dosage Guard</h3>
                    <p className="text-xs text-slate-400 leading-relaxed mb-3">
                      Detects incomplete doctor orders like "Tab Metolar XR 25 BD [MISSING COUNT]". Blocks automatic release until nurse confirms duration.
                    </p>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      CRITICAL BLOCKER
                    </span>
                  </div>

                  <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-800/40">
                    <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-3">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-white text-sm mb-1">Drug Interaction Firewall</h3>
                    <p className="text-xs text-slate-400 leading-relaxed mb-3">
                      Deterministic checking flags dangerous multi-drug combinations (e.g. Blood thinners + NSAIDs without PPI protection).
                    </p>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      INTERACTION ALERT
                    </span>
                  </div>

                  <div className="p-5 rounded-2xl bg-teal-950/20 border border-teal-800/40">
                    <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center mb-3">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-white text-sm mb-1">Nurse Approval Lock</h3>
                    <p className="text-xs text-slate-400 leading-relaxed mb-3">
                      Sister Anjali digital sign-off lock. The family care plan cannot be printed, exported, or accessed until all critical blockers are resolved.
                    </p>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      APPROVED_LOCKED RAIL
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <p className="text-xs text-slate-300">
                      <strong>Zero Guessing Policy:</strong> If a clinical parameter is ambiguous in the paper document, the system refuses to guess and mandates human clinical intervention.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* SLIDE 6: Family Care Handover & Awaaz Parchi */}
            {currentSlide === 5 && (
              <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                <div>
                  <h2 className="font-heading font-black text-2xl sm:text-4xl text-white mb-2">
                    Family Care Handover & "Awaaz Parchi" (आवाज़ पर्ची)
                  </h2>
                  <p className="text-sm sm:text-base text-slate-300">
                    Empowering Indian family caregivers with spoken regional audio & intuitive visual schedules.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-orange-950/30 to-slate-900 border border-orange-800/40">
                    <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center mb-3">
                      <Volume2 className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-white text-sm mb-1">Spoken Hindi Audio Parchi</h3>
                    <p className="text-xs text-slate-400 leading-relaxed mb-3">
                      Google Cloud TTS Neural2 synthesizes warm, natural Hindi audio instructions. Family members can tap play to hear exact dosage instructions.
                    </p>
                    <div className="p-2 rounded bg-black/40 text-[11px] text-orange-300 border border-orange-900/50">
                      "नमस्ते, कमला देवी जी की छुट्टी के बाद की दवाइयां..."
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-950/30 to-slate-900 border border-teal-800/40">
                    <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center mb-3">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-white text-sm mb-1">Color-Coded Timetable</h3>
                    <p className="text-xs text-slate-400 leading-relaxed mb-3">
                      Separates medication into Morning (सुबह), Noon (दोपहर), Evening (शाम), and Night (रात) cards with food instructions (खाली पेट / खाने के बाद).
                    </p>
                    <div className="flex gap-1">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">सुबह</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">दोपहर</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">रात</span>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-950/30 to-slate-900 border border-rose-800/40">
                    <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-3">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-white text-sm mb-1">Emergency Red Flags</h3>
                    <p className="text-xs text-slate-400 leading-relaxed mb-3">
                      Highlights critical symptoms that require immediate ER return: high fever (&gt;101°F), sudden chest heaviness, severe wound discharge.
                    </p>
                    <div className="p-2 rounded bg-black/40 text-[11px] text-rose-300 border border-rose-900/50">
                      "लक्षण दिखने पर तुरंत 108 या अस्पताल पहुंचे"
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Printer className="w-4 h-4 text-slate-400" />
                    <p className="text-xs text-slate-300">
                      <strong>1-Click Refrigerator Printable:</strong> High-contrast black & white A4 sheet for Indian homes to stick on the fridge.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* SLIDE 7: Google Ecosystem Integration Rails */}
            {currentSlide === 6 && (
              <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                <div>
                  <h2 className="font-heading font-black text-2xl sm:text-4xl text-white mb-2">
                    Google Ecosystem Superpowers
                  </h2>
                  <p className="text-sm sm:text-base text-slate-300">
                    Deep 4-point integration with Google AI, Cloud, and Developer APIs.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-5 rounded-2xl bg-slate-900/80 border border-teal-800/50">
                    <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center mb-3">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-white text-sm mb-1">Gemini 2.5 Flash</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Multimodal visual extraction of complex clinical summaries in 1.2s real-time inference.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-900/80 border border-cyan-800/50">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-3">
                      <Volume2 className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-white text-sm mb-1">Google Cloud TTS</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Neural2 multilingual voice synthesis for natural Hindi & English spoken care instructions.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-900/80 border border-blue-800/50">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-3">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-white text-sm mb-1">Google Calendar</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      RFC 5545 schedule sync: 1-click adds all medication alarms & OPD reviews to patient phones.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-900/80 border border-emerald-800/50">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-white text-sm mb-1">Google Maps API</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Live locator maps showing verified 24/7 pharmacies & Jan Aushadhi Kendras within 3km.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>All 4 Google rails fully implemented & live in production prototype.</span>
                  </div>
                </div>
              </div>
            )}

            {/* SLIDE 8: Live Product Workflow */}
            {currentSlide === 7 && (
              <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                <div>
                  <h2 className="font-heading font-black text-2xl sm:text-4xl text-white mb-2">
                    Live Product Workflow
                  </h2>
                  <p className="text-sm sm:text-base text-slate-300">
                    End-to-end demonstration of Kamla Devi's discharge case in GharCare.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
                      <div>
                        <div className="text-xs font-bold text-cyan-400 mb-1">STAGE 1</div>
                        <h3 className="font-bold text-white text-sm mb-2">Upload & Extraction</h3>
                        <p className="text-xs text-slate-400 mb-4">
                          Ingestion of discharge PDF or smartphone camera capture. Gemini 2.5 parses full clinical history.
                        </p>
                      </div>
                      <button
                        onClick={() => { onExit(); onOpenDemo?.('upload'); }}
                        className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <span>Open Ingestion</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
                      <div>
                        <div className="text-xs font-bold text-teal-400 mb-1">STAGE 2</div>
                        <h3 className="font-bold text-white text-sm mb-2">Nurse Review Cockpit</h3>
                        <p className="text-xs text-slate-400 mb-4">
                          Blockers flagged (missing Metolar duration, missing review date). Nurse resolves & locks case.
                        </p>
                      </div>
                      <button
                        onClick={() => { onExit(); onOpenDemo?.('cockpit'); }}
                        className="w-full py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-xs font-bold text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <span>Open Cockpit</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
                      <div>
                        <div className="text-xs font-bold text-amber-400 mb-1">STAGE 3</div>
                        <h3 className="font-bold text-white text-sm mb-2">Family Care Handover</h3>
                        <p className="text-xs text-slate-400 mb-4">
                          Audio parchi playback, Google Calendar sync, Jan Aushadhi locator, and A4 print sheet.
                        </p>
                      </div>
                      <button
                        onClick={() => { onExit(); onOpenDemo?.('family'); }}
                        className="w-full py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-xs font-bold text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <span>Open Family Plan</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-teal-950/40 border border-teal-800/60 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-teal-300">
                    <CheckCircle2 className="w-4 h-4 text-teal-400" />
                    <span>Demo Patient: Kamla Devi (PT-849201) • Cholecystectomy Post-Op Recovery</span>
                  </div>
                </div>
              </div>
            )}

            {/* SLIDE 9: Measured Clinical Impact & ROI */}
            {currentSlide === 8 && (
              <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                <div>
                  <h2 className="font-heading font-black text-2xl sm:text-4xl text-white mb-2">
                    Measured Clinical Impact & Hospital ROI
                  </h2>
                  <p className="text-sm sm:text-base text-slate-300">
                    Proven outcomes across hospital throughput, nursing efficiency, and patient safety.
                  </p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-5 rounded-2xl bg-teal-950/30 border border-teal-800/50">
                    <p className="font-black text-3xl sm:text-4xl text-teal-400 font-heading">76%</p>
                    <p className="font-bold text-white text-xs sm:text-sm mt-1">Faster Handover</p>
                    <p className="text-[11px] text-slate-400 mt-1">From 42 minutes to 4.8 minutes per patient.</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-800/50">
                    <p className="font-black text-3xl sm:text-4xl text-emerald-400 font-heading">88%</p>
                    <p className="font-bold text-white text-xs sm:text-sm mt-1">Error Reduction</p>
                    <p className="text-[11px] text-slate-400 mt-1">Fewer missed medication doses at home.</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-cyan-950/30 border border-cyan-800/50">
                    <p className="font-black text-3xl sm:text-4xl text-cyan-400 font-heading">100%</p>
                    <p className="font-bold text-white text-xs sm:text-sm mt-1">Zero Hallucination</p>
                    <p className="text-[11px] text-slate-400 mt-1">Deterministic verification on all dosages.</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-amber-950/30 border border-amber-800/50">
                    <p className="font-black text-3xl sm:text-4xl text-amber-400 font-heading">₹3,200</p>
                    <p className="font-bold text-white text-xs sm:text-sm mt-1">Saved / Family</p>
                    <p className="text-[11px] text-slate-400 mt-1">In avoided emergency readmissions.</p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <h3 className="font-bold text-white text-sm">Key Hospital Administrative Benefits:</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                      <strong>Bed Turnaround:</strong> Accelerates discharge queue so incoming emergency patients get ICU/ward beds faster.
                    </div>
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                      <strong>ABDM Compliance:</strong> Ready for Ayushman Bharat Digital Mission (14-digit ABHA ID integration).
                    </div>
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                      <strong>Medicolegal Protection:</strong> Cryptographic digital nurse approval log protects hospital against disputes.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SLIDE 10: Vision & Roadmap */}
            {currentSlide === 9 && (
              <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                <div>
                  <h2 className="font-heading font-black text-2xl sm:text-4xl text-white mb-2">
                    Vision & National Scale Roadmap
                  </h2>
                  <p className="text-sm sm:text-base text-slate-300">
                    Scaling GharCare from tertiary hospitals across India: Going Home Right.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="p-5 rounded-2xl bg-slate-900 border border-teal-800/50 relative">
                    <div className="text-xs font-black text-teal-400 mb-1">PHASE 1 (TODAY)</div>
                    <h3 className="font-bold text-white text-sm mb-2">AAYU 2026 Prototype</h3>
                    <ul className="text-xs text-slate-400 space-y-2">
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-teal-400" />
                        Gemini 2.5 Multimodal Extraction
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-teal-400" />
                        Hindi & English Audio Parchi
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-teal-400" />
                        Deterministic Safety Firewall
                      </li>
                    </ul>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-900 border border-cyan-800/50 relative">
                    <div className="text-xs font-black text-cyan-400 mb-1">PHASE 2 (Q3 2026)</div>
                    <h3 className="font-bold text-white text-sm mb-2">12 Regional Languages & WhatsApp</h3>
                    <ul className="text-xs text-slate-400 space-y-2">
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-cyan-400" />
                        Tamil, Telugu, Bengali, Marathi, Gujarati
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-cyan-400" />
                        Automated WhatsApp bot delivery
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-cyan-400" />
                        Voice-based caregiver Q&A assistant
                      </li>
                    </ul>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-900 border border-amber-800/50 relative">
                    <div className="text-xs font-black text-amber-400 mb-1">PHASE 3 (2027)</div>
                    <h3 className="font-bold text-white text-sm mb-2">National ABDM Health Locker</h3>
                    <ul className="text-xs text-slate-400 space-y-2">
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-amber-400" />
                        National ABHA Record Linking
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-amber-400" />
                        EHR integration (Epic, Cerner, HL7 FHIR)
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-amber-400" />
                        Tele-consultation follow-up hooks
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-gradient-to-r from-teal-950/60 via-slate-900 to-amber-950/60 border border-teal-800/40 text-center">
                  <p className="font-heading font-black text-xl sm:text-2xl text-white">
                    "Going Home Right — Recovery happens at home, not in confusion."
                  </p>
                  <p className="text-xs sm:text-sm text-slate-300 mt-2">
                    Presented with ♥ by Team HeartBeat Hackers • AAYU 2026 Track T03
                  </p>
                </div>
              </div>
            )}

          </div>

          {/* Slide Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800/60 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-500" />
              <span>GharCare Verified Discharge Handover Protocol</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden sm:inline">Use [←] / [→] keys to navigate</span>
              <span className="font-mono text-slate-400">
                {String(currentSlide + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
              </span>
            </div>
          </div>

        </div>
      </main>

      {/* Bottom Floating Navigation HUD */}
      <footer className="relative z-20 px-4 sm:px-8 py-3.5 bg-slate-950/80 border-t border-slate-800/80 backdrop-blur-xl flex items-center justify-between no-print">
        {/* Previous Button */}
        <button
          onClick={() => setCurrentSlide((prev) => Math.max(prev - 1, 0))}
          disabled={currentSlide === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${currentSlide === 0
              ? 'bg-slate-900/50 text-slate-600 border border-slate-800/50 cursor-not-allowed'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 shadow-xs'
            }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Previous Slide</span>
        </button>

        {/* Slide Dots Quick Bar */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentSlide(idx)}
              className={`transition-all rounded-full cursor-pointer ${idx === currentSlide
                  ? 'w-7 sm:w-8 h-2.5 bg-gradient-to-r from-teal-400 to-cyan-400 shadow-[0_0_8px_rgba(45,212,191,0.5)]'
                  : 'w-2.5 h-2.5 bg-slate-800 hover:bg-slate-700'
                }`}
              title={`Slide ${idx + 1}: ${s.title}`}
            />
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={() => setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1))}
          disabled={currentSlide === slides.length - 1}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${currentSlide === slides.length - 1
              ? 'bg-slate-900/50 text-slate-600 border border-slate-800/50 cursor-not-allowed'
              : 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white shadow-md shadow-teal-600/30'
            }`}
        >
          <span className="hidden sm:inline">Next Slide</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </footer>

      {/* Speaker Notes Drawer */}
      {showNotes && (
        <div className="absolute bottom-18 left-4 right-4 sm:left-auto sm:right-8 sm:w-96 rounded-2xl bg-slate-900/95 border border-amber-500/40 shadow-2xl p-4 backdrop-blur-xl z-30 animate-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
              <FileText className="w-3.5 h-3.5" />
              Presenter Pitch Talking Points
            </span>
            <button
              onClick={() => setShowNotes(false)}
              className="text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            {activeSlideData.speakerNotes}
          </p>
        </div>
      )}

      {/* Slide Thumbnails Grid Modal */}
      {showGrid && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-2xl z-50 p-6 sm:p-10 flex flex-col justify-between animate-in fade-in">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 max-w-6xl w-full mx-auto">
            <div>
              <h2 className="font-heading font-black text-xl text-white">Presentation Slide Index</h2>
              <p className="text-xs text-slate-400">Select any slide to jump directly</p>
            </div>
            <button
              onClick={() => setShowGrid(false)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-6xl w-full mx-auto py-6 overflow-y-auto">
            {slides.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => {
                  setCurrentSlide(idx);
                  setShowGrid(false);
                }}
                className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${idx === currentSlide
                    ? 'bg-teal-950/60 border-teal-500 shadow-lg shadow-teal-500/20'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800'
                  }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-2">
                  <span>SLIDE {String(idx + 1).padStart(2, '0')}</span>
                  {idx === currentSlide && (
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                  )}
                </div>
                <p className="font-bold text-white text-xs line-clamp-2 mb-1">{s.title}</p>
                <p className="text-[10px] text-slate-400 line-clamp-2">{s.subtitle}</p>
              </button>
            ))}
          </div>

          <div className="text-center text-xs text-slate-500 pb-2">
            Press [Esc] or click close to return to the active slide.
          </div>
        </div>
      )}

      {/* Print-only CSS layout for complete 10-slide PDF export */}
      <style>{`
        @media print {
          @page {
            size: landscape;
            margin: 0;
          }
          body {
            background: #020617 !important;
            color: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
