import React, { useState, useRef } from 'react';
import axios from 'axios';
import { DischargeCase, CaseListItem } from '../types';

interface UploadStationProps {
  onCaseSelected: (c: DischargeCase, targetTab?: 'cockpit' | 'family') => void;
  caseList: CaseListItem[];
  onRefreshCases: () => void;
}

export const UploadStation: React.FC<UploadStationProps> = ({
  onCaseSelected,
  onRefreshCases,
}) => {
  const [activeMode, setActiveMode] = useState<'upload' | 'paste'>('upload');
  const [pastedText, setPastedText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionStage, setExtractionStage] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rejectionDetails, setRejectionDetails] = useState<{
    isValidClinicalDocument: boolean;
    documentType: string;
    clinicalConfidenceScore: number;
    matchedClinicalMarkers: string[];
    detectedNonClinicalIndicators: string[];
    rejectionReason?: string;
    recommendedGuidance?: string;
  } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
    setErrorMessage(null);
    setRejectionDetails(null);
    if (file) {
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setFilePreviewUrl(url);
      } else {
        setFilePreviewUrl(null);
      }
    } else {
      setFilePreviewUrl(null);
    }
  };

  const handleSelectPreloaded = async (caseId: string, targetTab: 'cockpit' | 'family' = 'cockpit') => {
    try {
      setIsExtracting(true);
      setErrorMessage(null);
      setRejectionDetails(null);
      setExtractionStage('Opening clinical case dossier from instrument library...');
      setProgressPercent(40);
      const res = await axios.get<DischargeCase>(`/api/cases/${caseId}`);
      setProgressPercent(100);
      onCaseSelected(res.data, targetTab);
    } catch (e: any) {
      setErrorMessage(e.message || 'Failed to load case');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleLiveExtract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedText.trim() && !selectedFile) {
      setErrorMessage('Please place a discharge document (PDF/Photo) in the intake zone or paste clinical summary text.');
      return;
    }

    try {
      setIsExtracting(true);
      setErrorMessage(null);
      setRejectionDetails(null);
      setProgressPercent(15);
      setExtractionStage('Tokenizing document geometry & bounding layout...');

      const timer1 = setTimeout(() => {
        setProgressPercent(50);
        setExtractionStage('Gemini 2.5 Flash Multimodal Vision analyzing clinical regimens...');
      }, 550);

      const timer2 = setTimeout(() => {
        setProgressPercent(82);
        setExtractionStage('Evaluating deterministic safety firewall rules & dose verification...');
      }, 1200);

      const formData = new FormData();
      if (pastedText.trim()) {
        formData.append('rawText', pastedText);
      }
      if (selectedFile) {
        formData.append('documentFile', selectedFile);
      }

      const res = await axios.post<DischargeCase>('/api/extract', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      clearTimeout(timer1);
      clearTimeout(timer2);
      setProgressPercent(100);
      setExtractionStage('Handover verified. Opening Nurse Cockpit...');

      setTimeout(() => {
        onCaseSelected(res.data);
        onRefreshCases();
      }, 350);
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 422 && err.response?.data?.classification) {
        setRejectionDetails(err.response.data.classification);
        setErrorMessage(null);
      } else {
        setRejectionDetails(null);
        setErrorMessage(err.response?.data?.message || err.response?.data?.details || err.message || 'Extraction failed');
      }
      setIsExtracting(false);
    }
  };

  const loadSamplePdf = async (filename: string) => {
    try {
      setIsExtracting(false);
      setErrorMessage(null);
      setRejectionDetails(null);
      setActiveMode('upload');
      const res = await fetch(`/sample-pdfs/${filename}`);
      if (!res.ok) throw new Error('Failed to load sample PDF');
      const blob = await res.blob();
      const file = new File([blob], filename, { type: 'application/pdf' });
      handleFileChange(file);
    } catch (err: any) {
      console.error('Failed to load sample pdf:', err);
    }
  };

  const loadSampleText = (specialty: 'cardio' | 'ortho' | 'pulmo') => {
    setActiveMode('paste');
    if (specialty === 'cardio') {
      setPastedText(`DEPARTMENT OF CARDIOLOGY - DISCHARGE SUMMARY
Hospital: Max Super Speciality Hospital, New Delhi | IPD: 492019
Patient: Rajesh Mathur, 61/M | Consultant: Dr. H. K. Chopra, MD, DM
Diagnosis: Acute Non-ST Elevation Myocardial Infarction (NSTEMI) / Essential Hypertension.
Procedure: Coronary Angiogram + Drug Eluting Stent (DES) to Left Anterior Descending (LAD) artery.
Investigations: 2D Echo: LVEF 48%, regional wall motion abnormality. Peak Trop-I: 1.4 ng/mL.

DISCHARGE MEDICATIONS:
1. Tab. Ecosprin 75 mg - 1 Tab OD - PC (After lunch) x 30 days
2. Tab. Brilinta 90 mg (Ticagrelor) - 1 Tab BD - PC (After breakfast & dinner) x 6 months
3. Tab. Metolar XR 25 mg (Metoprolol) - BD [MISSING DOSE QTY] x 14 days
4. Tab. Rosuvas 20 mg (Rosuvastatin) - 1 Tab HS (At bedtime) x 30 days
5. Tab. Sorbitrate 5 mg - SOS for acute chest pain under the tongue

HOME MONITORING & REHABILITATION:
- Daily Blood Pressure & Heart Rate check (Morning 8 AM & Evening 7 PM). Target BP < 130/80 mmHg.
- Low sodium diet (< 2g/day), avoid fried food.
- Walk 15-20 mins daily on flat surface; do not lift weights > 3 kg.
- OPD Review on 18/10/2026 with ECG in Cardiology OPD Room 204.
- Total Bill: Rs 2,45,000 | TPA Cashless Approved: Rs 2,25,000 | Patient Co-pay: Rs 20,000.`);
    } else if (specialty === 'ortho') {
      setPastedText(`DEPARTMENT OF ORTHOPEDICS & JOINT RECONSTRUCTION
Hospital: Apollo Hospitals, Sarita Vihar, New Delhi | IPD: 881290
Patient: Harish Chandra, 66/M | Consultant: Dr. Yash Gulati, MS Ortho
Diagnosis: Severe Primary Osteoarthritis Bilateral Knees (ICD-10: M17.0).
Procedure: Left Total Knee Arthroplasty (TKA) with Stryker Triathlon Implants on 08/10/2026.
Post-Op Course: Tolerating physical therapy with walker. Surgical dressing dry.

DISCHARGE MEDICATIONS:
1. Tab. Cefuroxime Axetil 500 mg - 1 Tab BD - PC x 5 days
2. Tab. Zerodol-SP - 1 Tab BD - PC x 4 days
3. Tab. Pan 40 mg - 1 Tab OD - AC (Before breakfast) x 7 days
4. Tab. Xarelto 10 mg (Rivaroxaban) - 1 Tab OD - PC (DVT Prophylaxis) x 14 days
5. Tab. Calcirol 60K - 1 Sachet Weekly x 8 weeks
6. Tab. Ultracet - SOS for breakthrough surgical knee pain only

CARE & PHYSIOTHERAPY:
- Quadriceps isometric exercises 3 times daily. Knee bending up to 90 degrees as tolerated.
- Keep surgical staple line dry. No wet shower for 14 days until staples removed.
- Temperature & calf swelling monitoring daily (Morning & Evening).
- Follow-up on 22/10/2026 for surgical staples removal.
- Cashless Mediclaim Approved: Rs 1,85,000 | Co-pay: Rs 5,400.`);
    } else {
      setPastedText(`DEPARTMENT OF PULMONOLOGY & CRITICAL CARE
Hospital: Fortis Escorts Hospital | IPD: 301923
Patient: Smt. Pushpa Devi, 58/F | Consultant: Dr. V. K. Arora, MD Pulm
Diagnosis: Severe Exacerbation of Bronchial Asthma / Community Acquired Pneumonia.
Course: Initial ICU stabilization, switched from IV to inhalational therapy. SpO2 96% on room air.

DISCHARGE MEDICATIONS:
1. Inhaler Foracort 400 (Budesonide + Formoterol) - 2 Puffs BD with Spacer & mouth gargle
2. Tab. Montek-LC (Montelukast + Levocetirizine) - 1 Tab HS x 14 days
3. Tab. Doxovent 400 mg (Doxofylline) - 1 Tab BD - PC x 7 days
4. Tab. Azithral 500 mg - 1 Tab OD - PC x 3 days
5. Inhaler Asthalin (Salbutamol) - 2 Puffs SOS for acute breathlessness or wheezing

HOME MONITORING:
- SpO2 monitoring twice daily. Target > 94%. Peak flow meter reading every morning.
- Avoid dust, incense smoke, cold water. Deep diaphragmatic breathing 10 mins.
- Review in Chest OPD after 10 days with repeat Chest X-Ray.`);
    }
  };

  return (
    <div className="max-w-[1560px] 2xl:max-w-[1680px] w-full mx-auto px-3 sm:px-6 py-6 sm:py-8 font-sans">
      
      {/* Bento Grid Header Tile: Live Instrument Telemetry */}
      <div className="vitals-card vitals-spotlight p-6 sm:p-8 mb-6 border border-vitals-border">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="vitals-chip vitals-chip-pulse">
                <span className="pulsing-dot" />
                <span>INSTRUMENT 01 // LIVE INGESTION</span>
              </span>
              <span className="font-mono text-xs text-vitals-muted">
                ABDM & DHR 2026 Standard
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-display font-bold text-vitals-ink tracking-tight">
              Hospital Discharge Handover Instrument
            </h1>

            <p className="text-sm sm:text-base text-vitals-muted mt-2 max-w-2xl font-normal leading-relaxed">
              Drop any clinical discharge summary PDF or smartphone ward scan. Gemini 2.5 Flash extracts regimens, while the deterministic safety firewall guarantees <strong className="text-vitals-ink">zero hallucination</strong> before family release.
            </p>
          </div>

          {/* Telemetry Metrics Bento Strip */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 shrink-0 font-mono text-xs">
            <div className="p-3 rounded-input bg-vitals-surface2 border border-vitals-border">
              <span className="text-[10px] text-vitals-faint block uppercase">Inference</span>
              <span className="font-bold text-sm text-pulse-mint">1.2s</span>
            </div>
            <div className="p-3 rounded-input bg-vitals-surface2 border border-vitals-border">
              <span className="text-[10px] text-vitals-faint block uppercase">Firewall</span>
              <span className="font-bold text-sm text-vitals-ink">Zero Guess</span>
            </div>
            <div className="p-3 rounded-input bg-vitals-surface2 border border-vitals-border">
              <span className="text-[10px] text-vitals-faint block uppercase">Standard</span>
              <span className="font-bold text-sm text-vitals-ink">ABHA Rails</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Bento Workspace: Drop Zone (8 Cols) + Extraction Inspector (4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mb-10">
        
        {/* Left Bento Tile: Conic Gradient Drop Zone & Presets */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Mode Switcher Tabs */}
          <div className="flex items-center justify-between border-b border-vitals-border pb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveMode('upload')}
                className={`px-4 py-2 text-xs font-mono font-bold rounded-input transition-colors cursor-pointer ${
                  activeMode === 'upload'
                    ? 'bg-pulse-mint text-black shadow-[0_0_12px_rgba(59,245,137,0.2)]'
                    : 'text-vitals-muted hover:text-vitals-ink hover:bg-vitals-surface2'
                }`}
              >
                [01] PDF / PHOTO SCAN
              </button>
              <button
                type="button"
                onClick={() => setActiveMode('paste')}
                className={`px-4 py-2 text-xs font-mono font-bold rounded-input transition-colors cursor-pointer ${
                  activeMode === 'paste'
                    ? 'bg-pulse-mint text-black shadow-[0_0_12px_rgba(59,245,137,0.2)]'
                    : 'text-vitals-muted hover:text-vitals-ink hover:bg-vitals-surface2'
                }`}
              >
                [02] CLINICAL SUMMARY TEXT
              </button>
            </div>

            {activeMode === 'paste' && (
              <div className="flex items-center gap-1.5 text-xs font-mono">
                <span className="text-vitals-muted text-[11px] mr-1">Presets:</span>
                <button
                  type="button"
                  onClick={() => loadSampleText('cardio')}
                  className="px-2 py-1 rounded bg-vitals-surface2 hover:bg-vitals-surface3 text-vitals-ink border border-vitals-border text-[11px]"
                >
                  Cardio
                </button>
                <button
                  type="button"
                  onClick={() => loadSampleText('ortho')}
                  className="px-2 py-1 rounded bg-vitals-surface2 hover:bg-vitals-surface3 text-vitals-ink border border-vitals-border text-[11px]"
                >
                  Ortho
                </button>
                <button
                  type="button"
                  onClick={() => loadSampleText('pulmo')}
                  className="px-2 py-1 rounded bg-vitals-surface2 hover:bg-vitals-surface3 text-vitals-ink border border-vitals-border text-[11px]"
                >
                  Pulmo
                </button>
              </div>
            )}
          </div>

          {/* Clinical Document Rejection Alert */}
          {rejectionDetails && (
            <div className="p-4 rounded-card bg-signal-red/10 border border-signal-red text-signal-red font-sans text-xs animate-in fade-in">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-signal-red text-white uppercase block w-max mb-1">
                    NON-CLINICAL DOCUMENT BLOCKED
                  </span>
                  <p className="font-bold text-sm text-vitals-ink">{rejectionDetails.rejectionReason}</p>
                  <p className="text-vitals-muted mt-1">{rejectionDetails.recommendedGuidance}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setRejectionDetails(null)}
                  className="text-xs font-mono text-vitals-muted hover:text-vitals-ink"
                >
                  [Dismiss]
                </button>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 rounded-card bg-signal-red/10 border border-signal-red text-signal-red font-mono text-xs flex items-center justify-between">
              <span>{errorMessage}</span>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-vitals-muted hover:text-vitals-ink"
              >
                [Dismiss]
              </button>
            </div>
          )}

          <form onSubmit={handleLiveExtract}>
            {activeMode === 'upload' ? (
              <div className="space-y-4">
                {/* Conic Gradient Drop Zone */}
                <div className={`conic-border-wrap ${isDragOver ? 'active' : ''}`}>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragOver(false);
                      if (e.dataTransfer.files?.[0]) handleFileChange(e.dataTransfer.files[0]);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`vitals-card vitals-spotlight p-10 sm:p-14 text-center cursor-pointer relative overflow-hidden ${
                      selectedFile ? 'border-pulse-mint bg-vitals-surface2' : 'hover:border-vitals-border'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="application/pdf,image/*"
                      onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                      className="hidden"
                    />

                    {/* Live Scan Line when extracting */}
                    {isExtracting && <div className="scan-laser-line" />}

                    <div className="w-14 h-14 mx-auto mb-4 rounded-card bg-vitals-surface2 border border-vitals-border flex items-center justify-center text-pulse-mint shadow-[0_0_16px_rgba(59,245,137,0.1)]">
                      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    </div>

                    {selectedFile ? (
                      <div className="space-y-1">
                        <div className="inline-block px-2.5 py-0.5 rounded-chip bg-pulse-mint/15 text-pulse-mint font-mono text-xs font-bold mb-1">
                          DOCUMENT LOADED IN SCANNER
                        </div>
                        <p className="text-base font-bold text-vitals-ink font-mono">{selectedFile.name}</p>
                        <p className="text-xs text-vitals-muted font-mono">
                          {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type || 'Document'} • Click to change
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-lg sm:text-xl font-display font-bold text-vitals-ink">
                          Drop discharge summary PDF or smartphone photo here
                        </p>
                        <p className="text-xs sm:text-sm text-vitals-muted max-w-md mx-auto">
                          Supports hospital discharge summaries in PDF, JPG, PNG, WEBP (up to 20MB). Multimodal AI reads tabular and clinical formats.
                        </p>
                        <div className="pt-2">
                          <span className="btn-vitals-secondary text-xs">
                            Browse Local Scans
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Preloaded Benchmark Hospital Documents */}
                <div className="p-4 rounded-card bg-vitals-surface1 border border-vitals-border">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="font-mono text-xs font-bold text-vitals-ink uppercase tracking-wider">
                      Preloaded Benchmark PDFs (1-Click Test):
                    </span>
                    <span className="font-mono text-[10px] text-pulse-mint">
                      Instant Load
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => loadSamplePdf('Discharge-Summary-Kamla-Devi-Cholecystectomy.pdf')}
                      className="px-3 py-1.5 rounded-input bg-vitals-surface2 hover:bg-vitals-surface3 border border-vitals-border hover:border-pulse-mint text-vitals-ink transition-colors"
                    >
                      Kamla Devi (Gallbladder Lap)
                    </button>
                    <button
                      type="button"
                      onClick={() => loadSamplePdf('Discharge-Summary-Rajesh-Sharma-Cardiology-PCI.pdf')}
                      className="px-3 py-1.5 rounded-input bg-vitals-surface2 hover:bg-vitals-surface3 border border-vitals-border hover:border-pulse-mint text-vitals-ink transition-colors"
                    >
                      Rajesh Sharma (Cardiology PCI)
                    </button>
                    <button
                      type="button"
                      onClick={() => loadSamplePdf('Discharge-Summary-Ananya-Sen-Dengue-Recovery.pdf')}
                      className="px-3 py-1.5 rounded-input bg-vitals-surface2 hover:bg-vitals-surface3 border border-vitals-border hover:border-pulse-mint text-vitals-ink transition-colors"
                    >
                      Ananya Sen (Dengue Recovery)
                    </button>
                    <button
                      type="button"
                      onClick={() => loadSamplePdf('Discharge-Summary-Ratan-Lal-Orthopedic-TKR.pdf')}
                      className="px-3 py-1.5 rounded-input bg-vitals-surface2 hover:bg-vitals-surface3 border border-vitals-border hover:border-pulse-mint text-vitals-ink transition-colors"
                    >
                      Ratan Lal (Robotic Knee TKR)
                    </button>
                    <button
                      type="button"
                      onClick={() => loadSamplePdf('Mst.-Shivam-Discharge-Summary.pdf')}
                      className="px-3 py-1.5 rounded-input bg-vitals-surface2 hover:bg-vitals-surface3 border border-vitals-border hover:border-pulse-mint text-vitals-ink transition-colors"
                    >
                      Mst. Shivam (Pediatric Cardiac)
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="font-mono text-xs font-bold text-vitals-ink uppercase tracking-wider block">
                  Verbatim Discharge Summary Notes (Plaintext)
                </label>
                <textarea
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Paste hospital discharge notes with medications, diagnosis, vitals, and follow-up advice..."
                  className="w-full p-4 font-mono text-xs bg-vitals-surface2 text-vitals-ink border border-vitals-border rounded-card focus:border-pulse-mint focus:outline-none min-h-[240px]"
                />
              </div>
            )}

            {/* Sequential Progress Bar when Extracting */}
            {isExtracting && (
              <div className="mt-4 p-4 rounded-card bg-vitals-surface2 border border-vitals-border">
                <div className="flex items-center justify-between mb-2 font-mono text-xs">
                  <span className="font-bold text-pulse-mint flex items-center gap-2">
                    <span className="pulsing-dot" />
                    <span>{extractionStage}</span>
                  </span>
                  <span className="font-bold text-vitals-ink">{progressPercent}%</span>
                </div>
                <div className="w-full h-1.5 bg-vitals-surface3 overflow-hidden rounded-full">
                  <div
                    className="h-full bg-pulse-mint transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Submit Action */}
            <div className="mt-5 flex items-center justify-between pt-4 border-t border-vitals-border">
              <span className="font-mono text-xs text-vitals-muted">
                {selectedFile || pastedText.trim()
                  ? 'Document ready for multimodal extraction'
                  : 'Select document or choose a benchmark case below'}
              </span>

              <button
                type="submit"
                disabled={isExtracting || (!selectedFile && !pastedText.trim())}
                className="btn-vitals-primary text-xs disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isExtracting ? (
                  <span>Parsing with Gemini 2.5 Flash...</span>
                ) : (
                  <>
                    <span>Run Multimodal Clinical Extraction</span>
                    <span className="font-mono">→</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Bento Tile: Extraction Inspector (4 Cols) */}
        <div className="lg:col-span-4 vitals-card p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-vitals-border">
            <span className="font-mono text-xs font-bold text-vitals-ink uppercase tracking-wider">
              Extraction Inspector
            </span>
            <span className="vitals-chip vitals-chip-pulse text-[10px]">
              VISION READY
            </span>
          </div>

          {selectedFile ? (
            <div className="space-y-3">
              {filePreviewUrl ? (
                <div className="rounded-card overflow-hidden border border-vitals-border max-h-48 bg-black">
                  <img src={filePreviewUrl} alt="Preview" className="w-full h-auto object-cover opacity-90" />
                </div>
              ) : (
                <div className="p-3 rounded-card bg-vitals-surface2 border border-vitals-border font-mono text-xs flex justify-between items-center">
                  <span className="truncate text-vitals-ink">{selectedFile.name}</span>
                  <span className="text-vitals-muted shrink-0 text-[10px]">PDF SCAN</span>
                </div>
              )}

              {/* Inspector Instrumentation Meters */}
              <div className="p-3.5 rounded-card bg-vitals-surface2 border border-vitals-border space-y-2.5 font-mono text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-vitals-border">
                  <span className="text-vitals-muted">Target Model:</span>
                  <span className="font-bold text-pulse-mint">Gemini 2.5 Flash</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-vitals-border">
                  <span className="text-vitals-muted">Safety Firewall:</span>
                  <span className="font-bold text-pulse-mint">Deterministic Active</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-vitals-border">
                  <span className="text-vitals-muted">Voice Engine:</span>
                  <span className="font-bold text-vitals-ink">Google Cloud TTS (Neural2)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-vitals-muted">DHR Standard:</span>
                  <span className="font-bold text-vitals-ink">ABDM FHIR R4</span>
                </div>
              </div>

              <div className="p-3 rounded-card bg-pulse-mint/5 border border-pulse-mint/20 text-xs font-mono text-pulse-mint">
                ✓ Spatial verification: Extracts medication dosages alongside verbatim source coordinates.
              </div>
            </div>
          ) : (
            <div className="py-10 text-center text-vitals-muted font-mono text-xs space-y-2">
              <svg className="w-8 h-8 mx-auto text-vitals-faint" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
              <p>Inspector idle.</p>
              <p className="text-[11px] text-vitals-faint">
                Select a document or test a benchmark case below.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Benchmark Cases: Horizontal Snap-Scroll Carousel of Tall Patient Cards */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-vitals-border mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-vitals-ink flex items-center gap-2">
              <span>Benchmark Case Library</span>
              <span className="font-mono text-xs text-pulse-mint font-normal">(1-Click Instant Expand)</span>
            </h2>
            <p className="text-xs text-vitals-muted mt-0.5">
              Select any clinical case to immediately test the grounding, blocker resolution, and voice synthesis.
            </p>
          </div>
          <span className="font-mono text-xs text-vitals-muted hidden sm:inline">
            Scroll horizontally →
          </span>
        </div>

        {/* Snap Scroll Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Card 1: Kamla Devi */}
          <div
            onClick={() => handleSelectPreloaded('case-kamla-devi')}
            className="vitals-card vitals-spotlight p-5 border hover:border-signal-amber transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between pb-3 border-b border-vitals-border mb-3">
                <div className="w-10 h-10 rounded-card bg-signal-amber/15 text-signal-amber border border-signal-amber/30 flex items-center justify-center font-display font-bold text-base">
                  KD
                </div>
                <span className="vitals-chip bg-signal-amber/15 text-signal-amber border-signal-amber/30 text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-signal-amber animate-pulse" />
                  <span>SAFETY BLOCKER</span>
                </span>
              </div>

              <h3 className="font-display font-bold text-lg text-vitals-ink group-hover:text-signal-amber transition-colors">
                Kamla Devi (62 Y / F)
              </h3>
              <p className="text-xs text-vitals-muted mt-1">
                CAD / Post-PCI Stenting / Essential Hypertension
              </p>

              <div className="mt-3 p-2.5 rounded-input bg-vitals-surface2 border border-vitals-border font-mono text-xs">
                <span className="text-signal-amber font-bold block">
                  Metolar XR: Dose Ambiguity Blocker
                </span>
                <span className="text-[10px] text-vitals-muted">
                  ABHA: 91-8492-4019-3312
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-vitals-border flex items-center justify-between text-xs font-mono text-vitals-muted group-hover:text-vitals-ink">
              <span>Launch Nurse Cockpit</span>
              <span>→</span>
            </div>
          </div>

          {/* Card 2: Ratan Lal Sharma */}
          <div
            onClick={() => handleSelectPreloaded('case-ratan-lal', 'family')}
            className="vitals-card vitals-spotlight p-5 border hover:border-pulse-mint transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between pb-3 border-b border-vitals-border mb-3">
                <div className="w-10 h-10 rounded-card bg-pulse-mint/15 text-pulse-mint border border-pulse-mint/30 flex items-center justify-center font-display font-bold text-base">
                  RL
                </div>
                <span className="vitals-chip vitals-chip-pulse text-[10px]">
                  <span className="pulsing-dot" />
                  <span>VERIFIED HANDOVER</span>
                </span>
              </div>

              <h3 className="font-display font-bold text-lg text-vitals-ink group-hover:text-pulse-mint transition-colors">
                Ratan Lal Sharma (54 Y / M)
              </h3>
              <p className="text-xs text-vitals-muted mt-1">
                Acute Cholecystitis / Post-Laparoscopic Cholecystectomy
              </p>

              <div className="mt-3 p-2.5 rounded-input bg-vitals-surface2 border border-vitals-border font-mono text-xs">
                <span className="text-pulse-mint font-bold block">
                  Cryptographically Locked (SHA-256)
                </span>
                <span className="text-[10px] text-vitals-muted">
                  ABHA: 91-4920-1923-4819
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-vitals-border flex items-center justify-between text-xs font-mono text-vitals-muted group-hover:text-vitals-ink">
              <span>Open Family Care Plan</span>
              <span>→</span>
            </div>
          </div>

          {/* Card 3: Rajesh Sharma */}
          <div
            onClick={() => handleSelectPreloaded('case-rajesh-sharma')}
            className="vitals-card vitals-spotlight p-5 border hover:border-vitals-border transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between pb-3 border-b border-vitals-border mb-3">
                <div className="w-10 h-10 rounded-card bg-vitals-surface2 text-vitals-ink border border-vitals-border flex items-center justify-center font-display font-bold text-base">
                  RS
                </div>
                <span className="vitals-chip text-[10px] text-vitals-muted">
                  CARDIOLOGY PCI
                </span>
              </div>

              <h3 className="font-display font-bold text-lg text-vitals-ink">
                Rajesh Sharma (58 Y / M)
              </h3>
              <p className="text-xs text-vitals-muted mt-1">
                Post-PCI Stenting / Dual Antiplatelet Protocol
              </p>

              <div className="mt-3 p-2.5 rounded-input bg-vitals-surface2 border border-vitals-border font-mono text-xs">
                <span className="text-vitals-ink font-bold block">
                  Full Regimen Extracted
                </span>
                <span className="text-[10px] text-vitals-muted">
                  ABHA: 91-3829-1920-4821
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-vitals-border flex items-center justify-between text-xs font-mono text-vitals-muted group-hover:text-vitals-ink">
              <span>Inspect Dossier</span>
              <span>→</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
