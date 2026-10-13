import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { SAMPLE_CASES } from './data/sampleCases';
import { DischargeCase } from './types';
import { extractDischargeWithGemini } from './services/geminiExtractor';
import { evaluateClinicalSafetyRules, recomputeCaseStatus } from './services/safetyEngine';
import { generateAwaazParchiScript } from './services/audioService';
import { generateCalendarEvents } from './services/calendarService';
import { getNearbyEmergencyPharmacies } from './services/pharmacyService';
import { enrichDischargeCaseWithIndianMedical, getRegionalMedicationInstruction } from './services/indianMedicalService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4002;

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// In-memory case repository initialized with rich sample cases enriched with Indian Medical Formulary
const casesDb: Map<string, DischargeCase> = new Map();
Object.values(SAMPLE_CASES).forEach((c) => casesDb.set(c.caseId, enrichDischargeCaseWithIndianMedical(c)));

// 1. Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    app: 'GharCare (घर-केयर) Backend API',
    hackathon: 'Aayu 2026 - Track T03: Going Home Right',
    aiStack: {
      foundationModel: 'Google Gemini 2.5 Flash / MedLM (Vertex AI)',
      indianClinicalModel: 'CDSCO & PMBJP Jan Aushadhi Clinical Registry',
      clinicalTaxonomy: 'NRCeS SNOMED-CT India Extension & ABDM FHIR R4',
      multilingualSpeech: 'Google Cloud TTS Neural2 + AI4Bharat IndicVoice',
      calendarSync: 'RFC 5545 Medication Alarms Engine',
      pharmacyLocator: 'PMBJP Jan Aushadhi Kendras & Google Maps',
    },
    gcpProject: process.env.GCP_PROJECT_ID || 'gharcare-aayu-2026',
    activeCasesCount: casesDb.size,
    timestamp: new Date().toISOString(),
  });
});

// 2. List all cases
app.get('/api/cases', (req: Request, res: Response) => {
  const list = Array.from(casesDb.values()).map((c) => ({
    caseId: c.caseId,
    patientDisplayName: c.patientDisplayName,
    patientAge: c.patientAge,
    patientGender: c.patientGender,
    primaryDiagnosis: c.primaryDiagnosis,
    dischargeDate: c.dischargeDate,
    status: c.status,
    revision: c.revision,
    blockersCount: c.blockers.filter((b) => !b.isResolved).length,
    criticalBlockersCount: c.blockers.filter((b) => b.severity === 'CRITICAL' && !b.isResolved).length,
    isApproved: c.status === 'APPROVED_LOCKED',
    indianClinicalSummary: c.indianClinicalSummary,
  }));
  res.json(list);
});

// 3. Get single case by ID
app.get('/api/cases/:id', (req: Request, res: Response) => {
  const found = casesDb.get(req.params.id);
  if (!found) {
    return res.status(404).json({ error: 'Case not found' });
  }
  res.json(found);
});

// 3b. Indian Formulary & Jan Aushadhi Savings
app.get('/api/cases/:id/indian-formulary', (req: Request, res: Response) => {
  const currentCase = casesDb.get(req.params.id);
  if (!currentCase) {
    return res.status(404).json({ error: 'Case not found' });
  }

  const enriched = enrichDischargeCaseWithIndianMedical(currentCase);
  res.json({
    caseId: enriched.caseId,
    patientDisplayName: enriched.patientDisplayName,
    indianClinicalSummary: enriched.indianClinicalSummary,
    medications: enriched.medications.map((m) => ({
      id: m.id,
      brandName: m.brandName?.value,
      saltName: m.saltName?.value,
      strength: m.strength?.value,
      prescribedDose: m.prescribedDose?.value,
      frequency: m.frequency?.value,
      indianFormulary: m.indianFormulary,
    })),
  });
});

// 3c. Regional Indian Language Instructions (Hindi, Marathi, Bengali, Telugu, Tamil, Gujarati)
app.get('/api/cases/:id/regional-instructions', (req: Request, res: Response) => {
  const currentCase = casesDb.get(req.params.id);
  if (!currentCase) {
    return res.status(404).json({ error: 'Case not found' });
  }

  const lang = (req.query.lang as 'hi' | 'mr' | 'bn' | 'te' | 'ta' | 'gu') || 'hi';
  const instructions = currentCase.medications.map((m) => ({
    medicationId: m.id,
    brandName: m.brandName?.value,
    prescribedDose: m.prescribedDose?.value,
    frequency: m.frequency?.value,
    localizedInstruction: getRegionalMedicationInstruction(
      m.brandName?.value || m.saltName?.value || '',
      lang
    ),
  }));

  res.json({
    caseId: currentCase.caseId,
    language: lang,
    patientDisplayName: currentCase.patientDisplayName,
    instructions,
  });
});

// 4. Ingest & Extract Discharge Summary using Gemini 2.5 Flash / MedLM
app.post('/api/extract', upload.single('documentFile'), async (req: Request, res: Response) => {
  try {
    const rawText = req.body.rawText || '';
    const file = req.file;

    let buffer: Buffer | undefined = undefined;
    let mimeType: string | undefined = undefined;

    if (file) {
      buffer = file.buffer;
      mimeType = file.mimetype;
    }

    const rawCase = await extractDischargeWithGemini(rawText, buffer, mimeType, file?.originalname);
    const newCase = enrichDischargeCaseWithIndianMedical(rawCase);
    casesDb.set(newCase.caseId, newCase);

    res.status(201).json(newCase);
  } catch (err: any) {
    console.error('[GharCare API] Extraction error:', err.message);
    if (err.code === 'NON_CLINICAL_DOCUMENT_REJECTED' || err.status === 422) {
      return res.status(422).json({
        error: 'NON_CLINICAL_DOCUMENT_REJECTED',
        message: err.message,
        classification: err.classification,
      });
    }
    res.status(500).json({ error: 'Failed to extract discharge facts', details: err.message });
  }
});

// 5. Clarify / Override Field (Nurse or Doctor resolves a blocker)
app.post('/api/cases/:id/clarify', (req: Request, res: Response) => {
  const currentCase = casesDb.get(req.params.id);
  if (!currentCase) {
    return res.status(404).json({ error: 'Case not found' });
  }

  const { blockerId, medicationId, prescribedDose, timeSlots, sosCondition, followUpDate, nurseId, nurseName, note } = req.body;

  // Bump revision and invalidate prior approval
  currentCase.revision += 1;
  currentCase.approvalMetadata = null;
  currentCase.updatedAt = new Date().toISOString();

  // If clarifying a medication
  if (medicationId) {
    const med = currentCase.medications.find((m) => m.id === medicationId);
    if (med) {
      if (prescribedDose) {
        med.prescribedDose = {
          value: prescribedDose,
          provenance: {
            origin: 'CLINICIAN_CLARIFICATION',
            rawQuote: prescribedDose,
            confidenceScore: 1.0,
            clarifiedBy: nurseName || 'Sister Anjali Sharma',
            clarificationTimestamp: new Date().toISOString(),
          },
        };
      }
      if (timeSlots && Array.isArray(timeSlots)) {
        med.timeSlots = timeSlots;
      }
      if (sosCondition) {
        med.sosCondition = {
          value: sosCondition,
          provenance: {
            origin: 'CLINICIAN_CLARIFICATION',
            rawQuote: sosCondition,
            confidenceScore: 1.0,
            clarifiedBy: nurseName || 'Sister Anjali Sharma',
            clarificationTimestamp: new Date().toISOString(),
          },
        };
      }
    }
  }

  // If clarifying follow-up review date
  if (followUpDate && currentCase.followUp) {
    currentCase.followUp.reviewDate = {
      value: followUpDate,
      provenance: {
        origin: 'CLINICIAN_CLARIFICATION',
        rawQuote: followUpDate,
        confidenceScore: 1.0,
        clarifiedBy: nurseName || 'Sister Anjali Sharma',
        clarificationTimestamp: new Date().toISOString(),
      },
    };
  }

  // Mark blocker resolved
  if (blockerId) {
    const blk = currentCase.blockers.find((b) => b.id === blockerId);
    if (blk) {
      blk.isResolved = true;
      blk.resolvedBy = nurseName || 'Nurse Staff';
      blk.resolutionNote = note || 'Confirmed with attending physician';
    }
  }

  // Preserve existing resolved blockers across safety rule re-evaluation
  const resolvedMap = new Map(
    currentCase.blockers.filter((b) => b.isResolved).map((b) => [b.id, b])
  );

  const freshBlockers = evaluateClinicalSafetyRules(currentCase);
  currentCase.blockers = freshBlockers.map((b) => {
    const prev = resolvedMap.get(b.id);
    if (prev) {
      return {
        ...b,
        isResolved: true,
        resolvedBy: prev.resolvedBy,
        resolutionNote: prev.resolutionNote,
      };
    }
    return b;
  });

  recomputeCaseStatus(currentCase);

  casesDb.set(currentCase.caseId, currentCase);
  res.json({ message: 'Clarification applied successfully', updatedCase: currentCase });
});

// 6. Atomic Sign-Off & Approval
app.post('/api/cases/:id/approve', (req: Request, res: Response) => {
  const currentCase = casesDb.get(req.params.id);
  if (!currentCase) {
    return res.status(404).json({ error: 'Case not found' });
  }

  // Check for unresolved CRITICAL blockers
  const criticalUnresolved = currentCase.blockers.filter(
    (b) => b.severity === 'CRITICAL' && !b.isResolved
  );

  if (criticalUnresolved.length > 0) {
    return res.status(400).json({
      error: 'Cannot approve discharge plan with active critical blockers.',
      unresolvedBlockers: criticalUnresolved,
    });
  }

  const { nurseId, nurseName } = req.body;

  // Generate SHA-256 snapshot hash of medications & instructions
  const snapshotData = JSON.stringify({
    caseId: currentCase.caseId,
    revision: currentCase.revision,
    medications: currentCase.medications,
    followUp: currentCase.followUp,
    warningSigns: currentCase.warningSigns,
  });

  const hash = crypto.createHash('sha256').update(snapshotData).digest('hex');

  currentCase.status = 'APPROVED_LOCKED';
  currentCase.approvalMetadata = {
    approvedByNurseId: nurseId || 'NURSE-DELHI-442',
    approvedByNurseName: nurseName || 'Sister Anjali Sharma (Senior Discharge Nurse)',
    approvalTimestamp: new Date().toISOString(),
    cryptographicHash: hash,
    templateVersion: 'GHARCARE-AAYU-2026-V1.2',
  };
  currentCase.updatedAt = new Date().toISOString();

  casesDb.set(currentCase.caseId, currentCase);
  res.json({ message: 'Discharge handover locked and approved successfully', approvedCase: currentCase });
});

// 7. Get "Awaaz Parchi" Audio Script & Voiceover
app.get('/api/cases/:id/audio', async (req: Request, res: Response) => {
  const currentCase = casesDb.get(req.params.id);
  if (!currentCase) {
    return res.status(404).json({ error: 'Case not found' });
  }

  try {
    const script = await generateAwaazParchiScript(currentCase);
    res.json(script);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to synthesize audio', details: err.message });
  }
});

// 8. Google Calendar Sync
app.get('/api/cases/:id/calendar', (req: Request, res: Response) => {
  const currentCase = casesDb.get(req.params.id);
  if (!currentCase) {
    return res.status(404).json({ error: 'Case not found' });
  }

  const calData = generateCalendarEvents(currentCase);
  res.json(calData);
});

// 9. Download .ics iCalendar file directly
app.get('/api/cases/:id/calendar/download', (req: Request, res: Response) => {
  const currentCase = casesDb.get(req.params.id);
  if (!currentCase) {
    return res.status(404).json({ error: 'Case not found' });
  }

  const calData = generateCalendarEvents(currentCase);
  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="gharcare-schedule-${currentCase.patientDisplayName.replace(/\s+/g, '_')}.ics"`);
  res.send(calData.icsContent);
});

// 10. Nearby 24/7 Emergency Pharmacies (Google Maps integration)
app.get('/api/pharmacies', (req: Request, res: Response) => {
  const pharmacies = getNearbyEmergencyPharmacies();
  res.json(pharmacies);
});

// 11. Static Frontend Hosting & Single-Server SPA Fallback
const possibleFrontendDistPaths = [
  path.resolve(__dirname, '../../frontend/dist'),
  path.resolve(__dirname, '../frontend/dist'),
  path.resolve(process.cwd(), 'frontend/dist'),
  path.resolve(process.cwd(), '../frontend/dist'),
];

const frontendDistPath = possibleFrontendDistPaths.find((p) => fs.existsSync(p));

if (frontendDistPath) {
  console.log(`[GharCare Unified Server] Serving static frontend bundle from: ${frontendDistPath}`);
  app.use(express.static(frontendDistPath));

  // Explicit Pitch Deck routes (/info and /deck)
  app.get(['/info', '/deck'], (req: Request, res: Response) => {
    const indexHtml = path.join(frontendDistPath, 'index.html');
    if (fs.existsSync(indexHtml)) {
      return res.sendFile(indexHtml);
    }
    const publicDeck = path.resolve(__dirname, '../../frontend/public/deck.html');
    if (fs.existsSync(publicDeck)) {
      return res.sendFile(publicDeck);
    }
    res.redirect('/');
  });

  // SPA Route Fallback for non-API requests (client-side routing)
  app.get('*', (req: Request, res: Response) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    const indexHtml = path.join(frontendDistPath, 'index.html');
    if (fs.existsSync(indexHtml)) {
      res.sendFile(indexHtml);
    } else {
      res.status(404).send('Frontend index.html not found. Please build frontend first.');
    }
  });
} else {
  console.warn('[GharCare Unified Server] Notice: Frontend dist folder not found. API routes active only.');
  
  // Direct presentation deck route fallback
  app.get(['/info', '/deck'], (req: Request, res: Response) => {
    const publicDeck = path.resolve(__dirname, '../../frontend/public/deck.html');
    if (fs.existsSync(publicDeck)) {
      return res.sendFile(publicDeck);
    }
    res.redirect('/');
  });

  app.get('/', (req: Request, res: Response) => {
    res.json({
      status: 'online',
      message: 'GharCare API is running. To serve the unified frontend, run npm run build:frontend first.',
      healthEndpoint: '/api/health',
      presentationDeck: '/info'
    });
  });
}

// Start Server
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🏥 GharCare (घर-केयर) Unified Server Online on port ${PORT}`);
  console.log(`🚀 Hackathon: Aayu 2026 (Track T03 - Going Home Right)`);
  console.log(`🤖 AI Engine: Gemini 2.5 Flash + Google Cloud Platform`);
  console.log(`🌐 Application URL: http://localhost:${PORT}`);
  console.log(`📡 Health endpoint: http://localhost:${PORT}/api/health`);
  console.log(`🎯 Presentation Deck: http://localhost:${PORT}/deck.html`);
  console.log(`======================================================\n`);
});
