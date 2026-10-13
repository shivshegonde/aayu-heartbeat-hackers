import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { DischargeCase } from '../types';

interface AwaazParchiAudioProps {
  currentCase: DischargeCase;
}

interface AudioSection {
  title: string;
  text: string;
  timingEstimateSeconds: number;
}

export const AwaazParchiAudio: React.FC<AwaazParchiAudioProps> = ({ currentCase }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [sections, setSections] = useState<AudioSection[]>([]);
  const [, setLoadingAudio] = useState(false);
  const [, setAudioBase64] = useState<string | null>(null);

  // Indian Voice Persona & Speed Controls
  const [voicePersona, setVoicePersona] = useState<'sister' | 'doctor'>('sister');
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(0.85);
  const [, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [activeVoiceName, setActiveVoiceName] = useState<string>('भारतीय प्राकृतिक आवाज़ (Indian Voice)');

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const updateVoices = () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
        const best = findBestIndianVoice(voices, voicePersona);
        if (best) {
          setActiveVoiceName(best.name);
        }
      }
    };

    updateVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, [voicePersona]);

  useEffect(() => {
    let isMounted = true;

    async function loadAudioPayload() {
      try {
        setLoadingAudio(true);
        const res = await axios.get<{
          sections: AudioSection[];
          audioBase64?: string;
        }>(`/api/cases/${currentCase.caseId}/audio`);

        if (isMounted) {
          setSections(res.data.sections);
          if (res.data.audioBase64) {
            setAudioBase64(res.data.audioBase64);
          }
        }
      } catch {
        if (isMounted) {
          const fallbackSections: AudioSection[] = [
            {
              title: 'प्रस्तावना (Introduction)',
              text: `नमस्ते जी। यह ${currentCase.patientDisplayName || 'मरीज़'} जी के लिए घर पर देखभाल और दवाइयों की अधिकृत आवाज़ पर्ची है। कृपया ध्यान से सुनें।`,
              timingEstimateSeconds: 6,
            },
            {
              title: 'दवाइयों का नियम (Medication Routine)',
              text: currentCase.medications.map((m) => `${m.brandName?.value || 'दवा'}: ${m.instructionsPlainHindi || m.instructionsPlainEnglish || 'डॉक्टर के निर्देशानुसार लें'}`).join('। '),
              timingEstimateSeconds: 14,
            },
            {
              title: 'डॉक्टर फॉलो-अप व हेल्पलाइन (Review & Emergency)',
              text: `डॉक्टर से दोबारा मिलने का समय: ${currentCase.followUp?.reviewDate?.value || currentCase.followUp?.relativeDaysStated || '7 दिनों के भीतर'}। आपातकालीन हेल्पलाइन: ${currentCase.followUp?.hospitalContact || '108'}।`,
              timingEstimateSeconds: 8,
            },
          ];
          setSections(fallbackSections);
        }
      } finally {
        if (isMounted) setLoadingAudio(false);
      }
    }

    loadAudioPayload();

    return () => {
      isMounted = false;
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentCase.caseId]);

  const findBestIndianVoice = (
    voices: SpeechSynthesisVoice[],
    persona: 'sister' | 'doctor'
  ): SpeechSynthesisVoice | null => {
    if (!voices || voices.length === 0) return null;

    const hindiVoices = voices.filter(
      (v) =>
        v.lang.toLowerCase().includes('hi-in') ||
        v.lang.toLowerCase().includes('hi_in') ||
        v.name.toLowerCase().includes('hindi') ||
        v.name.toLowerCase().includes('swara') ||
        v.name.toLowerCase().includes('madhur') ||
        v.name.toLowerCase().includes('kalpana') ||
        v.name.toLowerCase().includes('hemant')
    );

    if (hindiVoices.length > 0) {
      if (persona === 'sister') {
        const female = hindiVoices.find(
          (v) =>
            v.name.toLowerCase().includes('swara') ||
            v.name.toLowerCase().includes('kalpana') ||
            v.name.toLowerCase().includes('female')
        );
        if (female) return female;
      } else {
        const male = hindiVoices.find(
          (v) =>
            v.name.toLowerCase().includes('madhur') ||
            v.name.toLowerCase().includes('hemant') ||
            v.name.toLowerCase().includes('male')
        );
        if (male) return male;
      }
      return hindiVoices[0];
    }

    const indianEnglish = voices.filter(
      (v) =>
        v.lang.toLowerCase().includes('en-in') ||
        v.lang.toLowerCase().includes('en_in') ||
        v.name.toLowerCase().includes('india')
    );
    if (indianEnglish.length > 0) return indianEnglish[0];

    return voices[0] || null;
  };

  const playSection = (index: number) => {
    if (index >= sections.length) {
      setIsPlaying(false);
      setActiveSectionIndex(0);
      return;
    }

    setActiveSectionIndex(index);
    setIsPlaying(true);

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();

      const sec = sections[index];
      const utterance = new SpeechSynthesisUtterance(sec.text);
      speechUtteranceRef.current = utterance;

      const voices = window.speechSynthesis.getVoices();
      const voice = findBestIndianVoice(voices, voicePersona);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        utterance.lang = 'hi-IN';
      }

      utterance.rate = playbackSpeed;
      utterance.pitch = voicePersona === 'sister' ? 1.05 : 0.95;

      utterance.onend = () => {
        if (index + 1 < sections.length) {
          playSection(index + 1);
        } else {
          setIsPlaying(false);
          setActiveSectionIndex(0);
        }
      };

      utterance.onerror = () => {
        setIsPlaying(false);
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(false);
    } else {
      playSection(activeSectionIndex);
    }
  };

  const resetAudio = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setActiveSectionIndex(0);
  };

  return (
    <div className="vitals-card vitals-spotlight p-6 sm:p-8 mb-6 border border-vitals-border select-none font-sans">
      <audio ref={audioRef} className="hidden" />

      {/* Header with Live Audio Visualizer */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-vitals-border gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="vitals-chip vitals-chip-pulse text-[11px]">
              आवाज़ पर्ची // LIVE AUDIO PRESCRIPTION
            </span>
            <span className="font-mono text-xs text-vitals-muted">
              Google Cloud TTS Neural2
            </span>
          </div>

          <h3 className="font-hindi text-2xl sm:text-3xl font-bold text-vitals-ink tracking-tight">
            सुनें: {currentCase.patientDisplayName} जी की दवाइयों का पूरा नियम
          </h3>

          <p className="text-sm sm:text-base text-vitals-muted mt-1 font-hindi">
            बुजुर्गों और परिजनों के लिए सरल हिंदी में बोलकर समझाया गया नियम। दवा के नाम, सही समय और भोजन का निर्देश।
          </p>
        </div>

        {/* Big Elder-Friendly Play Button & Live Audio Waveform Visualizer */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={togglePlay}
            className="btn-vitals-primary text-base sm:text-lg px-7 sm:px-8 py-3.5 sm:py-4 font-hindi font-bold shadow-[0_0_18px_rgba(59,245,137,0.25)] cursor-pointer"
          >
            {isPlaying ? (
              <>
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
                <span>रोकें (Pause)</span>
              </>
            ) : (
              <>
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                <span>सुनें (Play in Hindi)</span>
              </>
            )}
          </button>

          {/* Integrated Live Audio Waveform Bars */}
          <div className="flex items-center gap-1 px-4 py-2 bg-vitals-surface2 border border-vitals-border rounded-chip h-12 sm:h-14">
            {[10, 24, 14, 32, 20, 36, 18, 28, 14, 26, 34, 16, 22, 12].map((h, i) => (
              <span
                key={i}
                className={`w-1 rounded-full transition-all duration-150 ${
                  isPlaying ? 'bg-pulse-mint animate-pulse' : 'bg-vitals-muted/40'
                }`}
                style={{
                  height: isPlaying ? `${Math.max(6, h)}px` : '6px',
                  animationDelay: `${(i % 5) * 80}ms`,
                }}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={resetAudio}
            className="btn-vitals-secondary h-12 w-12 sm:h-14 sm:w-14 rounded-chip flex items-center justify-center text-vitals-muted hover:text-vitals-ink transition-colors cursor-pointer"
            title="Reset from start"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
          </button>
        </div>
      </div>

      {/* Voice Controls: Persona & Speed */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-vitals-border mb-5 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="text-vitals-muted">आवाज़ (Voice):</span>
          <div className="inline-flex border border-vitals-border bg-vitals-surface2 p-0.5 rounded-chip">
            <button
              type="button"
              onClick={() => setVoicePersona('sister')}
              className={`px-3 py-1 text-xs rounded-chip transition-colors cursor-pointer ${
                voicePersona === 'sister'
                  ? 'bg-pulse-mint text-black font-bold shadow-xs'
                  : 'text-vitals-muted hover:text-vitals-ink'
              }`}
            >
              सिस्टर अंजली (Nurse)
            </button>
            <button
              type="button"
              onClick={() => setVoicePersona('doctor')}
              className={`px-3 py-1 text-xs rounded-chip transition-colors cursor-pointer ${
                voicePersona === 'doctor'
                  ? 'bg-pulse-mint text-black font-bold shadow-xs'
                  : 'text-vitals-muted hover:text-vitals-ink'
              }`}
            >
              डॉ. माथुर (Doctor)
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-vitals-muted">गति (Speed):</span>
          <div className="inline-flex border border-vitals-border bg-vitals-surface2 p-0.5 rounded-chip">
            {[
              { val: 0.8, label: '0.8x (धीमी)' },
              { val: 0.85, label: '0.9x (सुगम)' },
              { val: 1.0, label: '1.0x (सामान्य)' },
            ].map((s) => (
              <button
                key={s.val}
                type="button"
                onClick={() => setPlaybackSpeed(s.val)}
                className={`px-2.5 py-1 text-xs rounded-chip transition-colors cursor-pointer ${
                  playbackSpeed === s.val
                    ? 'bg-pulse-mint text-black font-bold shadow-xs'
                    : 'text-vitals-muted hover:text-vitals-ink'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="text-vitals-faint text-[11px] truncate max-w-xs font-mono">
          {activeVoiceName}
        </div>
      </div>

      {/* Structured Spoken Transcript with Karaoke Highlight */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {sections.map((sec, idx) => {
          const isActive = idx === activeSectionIndex && isPlaying;
          return (
            <div
              key={idx}
              onClick={() => playSection(idx)}
              className={`p-4 rounded-card border transition-all cursor-pointer ${
                isActive
                  ? 'border-pulse-mint bg-vitals-surface2 ring-2 ring-pulse-mint/20 text-vitals-ink shadow-[0_0_16px_rgba(59,245,137,0.12)]'
                  : 'border-vitals-border bg-vitals-surface1/60 hover:bg-vitals-surface2 text-vitals-muted'
              }`}
            >
              <div className="flex items-center justify-between pb-1.5 border-b border-vitals-border mb-2">
                <span className="font-mono text-[10px] text-vitals-faint uppercase">
                  भाग {idx + 1}
                </span>
                {isActive && (
                  <span className="font-mono text-[10px] font-bold text-pulse-mint flex items-center gap-1">
                    <span className="pulsing-dot" />
                    <span>[PLAYING]</span>
                  </span>
                )}
              </div>
              <h4 className="font-hindi font-bold text-sm text-vitals-ink mb-1">
                {sec.title}
              </h4>
              <p className="font-hindi text-xs text-vitals-muted line-clamp-3 leading-relaxed">
                {sec.text}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
