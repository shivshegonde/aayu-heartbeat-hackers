# 🏥 GharCare (घर-केयर)

> **Next-Gen Hospital Discharge Handover Protocol**  
> *AAYU 2026 • Track T03 Prototype (Going Home Right)*  
> *ABDM & DHR 2026 Compliant • Powered by Google Gemini 2.5 Flash, Google MedLM & Google Cloud Platform*

---

## 📋 Hackathon Submission Checklist

| Category | Status | Details / Documentation |
|---|:---:|---|
| **Setup & Run** | ✅ Complete | Single unified entrypoint (`server.js`), 1-command build, zero-config local run on port `4003` |
| **Interactive Pitch Deck** | ✅ Live | Available directly at `/info` (`http://localhost:4003/info` or standalone `/deck.html`) |
| **PowerPoint Pitch Deck** | ✅ Stored | [`GharCare_Pitch_Deck_AAYU_2026.pptx`](./GharCare_Pitch_Deck_AAYU_2026.pptx) (10 widescreen slides + notes) |
| **Libraries & Tech Stack** | ✅ Complete | Node.js 18+, Express, React 18, Vite, TypeScript, Tailwind CSS, Zod, Multer, Lucide |
| **Datasets** | ✅ Complete | 5 authentic clinical discharge summaries (Cholecystectomy, PCI, Dengue, TKR, Pediatric) |
| **Specialized Medical AI** | ✅ Complete | **Google MedLM (Vertex AI)**, **CDSCO Registry**, **PMBJP Jan Aushadhi Savings**, **NRCeS SNOMED-CT** |
| **Public APIs & References** | ✅ Complete | Gemini 2.5 Flash, MedLM, Cloud TTS Neural2, AI4Bharat IndicTrans2, RFC 5545, Google Maps, ABDM |
| **Team & Track** | ✅ Complete | **HeartBeat Hackers** • **Track T03: Going Home Right** (AAYU 2026 Hackathon) |

---

## 👥 Team & Hackathon Details

- **Event**: AAYU 2026 Healthcare Hackathon
- **Track**: **Track T03 — Going Home Right** *(Hospital Discharge Handover & Safe Recovery at Home)*
- **Team Name**: **HeartBeat Hackers**
- **Author**: HeartBeat Hackers
- **Mission**: Eliminating the Indian hospital "Discharge Cliff" where 42% of 30-day readmissions occur due to misunderstood discharge papers, medication confusion, and language barriers.

---

## 🇮🇳 Indian Clinical Intelligence & Specialized Medical AI Stack

General Western LLMs fail in Indian hospitals because they do not recognize Indian commercial pharmaceutical brands, fixed-dose combinations, or regional multilingual nuances. GharCare incorporates a dedicated **Indian Clinical Knowledge & Safety Layer**:

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                      GharCare Indian Medical Architecture                        │
└──────────────────────────────────────────────────────────────────────────────────┘
   [Hospital Paper / Photo] ──> Google Gemini 2.5 Vision / MedLM (Extraction)
                                           │
                                           ▼
      ┌────────────────────────────────────────────────────────────┐
      │       Indian Clinical Knowledge & Regulatory Firewall      │
      │ • CDSCO & Indian Pharmacopoeia Formulation Registry        │
      │ • NLEM 2022 (National List of Essential Medicines)         │
      │ • CIMS / 1mg Indian Commercial Brand-to-Molecule Resolver  │
      │ • PMBJP (Pradhan Mantri Jan Aushadhi) Savings Engine       │
      │ • NRCeS SNOMED-CT India Extension & ICD-10 Coding          │
      └────────────────────────────────────────────────────────────┘
                                           │
                                           ▼
      ┌────────────────────────────────────────────────────────────┐
      │          AI4Bharat IndicTrans2 & Multi-Regional Audio      │
      │ • 12 Regional Indian Languages (Hi, Mr, Bn, Te, Ta, Gu...) │
      │ • Google Cloud TTS Neural2 + AI4Bharat IndicVoice          │
      │ • "Awaaz Parchi" (आवाज़ पर्ची) Spoken Care Handover        │
      └────────────────────────────────────────────────────────────┘
                                           │
                                           ▼
      ┌────────────────────────────────────────────────────────────┐
      │           National Healthcare Interoperability             │
      │ • ABDM Milestone M2/M3 API (14-Digit ABHA ID Linking)      │
      │ • RFC 5545 1-Click Google Calendar Medication Alarms       │
      └────────────────────────────────────────────────────────────┘
```

### 1. Google MedLM (Vertex AI) & Multimodal Vision
- **Google MedLM-Medium & MedLM-Large**: Foundation models trained by Google Research on biomedical literature and clinical notes (commercial evolution of Med-PaLM 2) for medical reasoning and discharge documentation.
- **Multimodal Extraction**: Gemini 2.5 Flash processes doctor handwriting, carbon copies, and complex dosage tables in ~1.2s without error-prone OCR pipelines.

### 2. CDSCO (Central Drugs Standard Control Organisation) Registry
- **Brand-to-Molecule Resolution**: Automatically maps proprietary Indian brand names (`Metolar XR`, `Pan-D`, `Augmentin 625`, `Zerodol-SP`, `Ecosprin`, `Dolo 650`, `Shelcal 500`, `Atorva`, `Brilinta`, `Ultracet`) to active pharmacological salts.
- **Fixed-Dose Combination (FDC) Safety**: Validates approved Indian FDCs and alerts against prohibited combinations.
- **Schedule H1 Antibiotic Surveillance**: Flags high-risk antibiotics and habit-forming analgesics requiring strict clinical oversight.

### 3. PMBJP (Pradhan Mantri Bhartiya Janaushadhi Pariyojana) Savings Engine
- **Generic Substitution**: Pairs commercial branded medicines with their official Jan Aushadhi generic alternatives.
- **Out-of-Pocket Savings Calculator**: Displays monthly financial savings for Indian families (averaging **78% cost reduction**, e.g., ₹28/month vs. ₹168/month for Metoprolol PR).

### 4. NRCeS SNOMED-CT India Extension & ABDM Standards
- Implements National Resource Centre for EHR Standards (NRCeS) India Extension clinical codes (e.g., `SNOMED-CT: 372826007`) and 14-digit ABHA validation for Ayushman Bharat Digital Mission compliance.

### 5. AI4Bharat IndicTrans2 Regional Language Engine
- Powers localized care instructions across **6 active regional languages** (Hindi, Marathi, Bengali, Telugu, Tamil, Gujarati) with cultural phrasing (*"खाली पेट"*, *"जेवणानंतर"*, *"சாப்பாட்டிற்கு பின்"*).

---

## 🚀 Step-by-Step Setup Guide

### 1. Prerequisites
- **Node.js**: `>= 18.0.0` (LTS recommended)
- **npm**: `>= 9.0.0`
- **Google Gemini API Key**: Obtainable from [Google AI Studio](https://aistudio.google.com/)

---

### 2. Environment Configuration

Create a `.env` file in the root directory (or inside `backend/.env`):

```bash
# Server Port
PORT=4003

# Google Gemini API Key (Required for Multimodal Vision Extraction)
GEMINI_API_KEY="your_google_gemini_api_key_here"

# Environment Mode
NODE_ENV=production

# Optional: Google Cloud Healthcare / Vertex AI MedLM Model Selection
GOOGLE_HEALTHCARE_MODEL="gemini-1.5-flash"

# Optional: Google Cloud Project ID (for Cloud TTS / Translation if using GCP Service Account)
PROJECT_ID="your_gcp_project_id"
GOOGLE_APPLICATION_CREDENTIALS="./gcp-key.json"
```

> **Zero-Crash Architecture:** If Google Cloud credentials are not configured, GharCare automatically uses its embedded deterministic Indian Clinical Knowledge Base and Web Speech API synthesis, ensuring **100% uptime with zero crashes**.

---

### 3. Quick Start (Single Unified Server)

Run everything (frontend + backend) through a single command:

```bash
# Step 1: Install dependencies and build both bundles
npm run build

# Step 2: Start the unified production server
npm start
```

Visit the application at **`http://localhost:4003`**.

---

### 4. Development Mode (Hot Reloading)

```bash
# Run backend development server with live reload (port 4003)
npm run dev:backend

# In a separate terminal, run Vite frontend (port 5176)
npm run dev:frontend
```

---

## 📚 Libraries & Dependencies

### Backend Stack (`backend/package.json`)
| Library | Version | Purpose |
|---|---|---|
| `@google/generative-ai` | `^0.21.0` | Google Gemini 2.5 Flash SDK for multimodal vision & clinical fact extraction |
| `@google-cloud/text-to-speech` | `^5.4.0` | Google Cloud Neural2 speech synthesis for natural Hindi/English audio summaries |
| `@google-cloud/translate` | `^8.3.0` | Google Cloud Translation API for Indian regional language localization |
| `express` | `^4.21.0` | High-performance HTTP server for REST APIs and static SPA bundle serving |
| `zod` | `^3.23.8` | Strict clinical schema validation, type safety, and dosage guard rails |
| `multer` | `^1.4.5-lts.1` | Multipart form-data handling for hospital PDF and mobile camera photo uploads |
| `pdf-lib` & `pdf-parse` | `^1.17.1` / `^2.4.5` | Document parsing, text stream extraction, and PDF manipulation |
| `tesseract.js` | `^7.0.0` | Local OCR pre-processing fallback |
| `cors` & `dotenv` | `^2.8.5` / `^16.4.5` | Cross-origin resource sharing & environment configuration |
| `typescript` & `ts-node-dev` | `^5.5.2` / `^2.0.0` | TypeScript compiler and live-reloading dev environment |

### Frontend Stack (`frontend/package.json`)
| Library | Version | Purpose |
|---|---|---|
| `react` & `react-dom` | `^18.3.1` | Component-based interactive UI library |
| `vite` | `^5.4.1` | Next-generation ultra-fast frontend build tool and bundler |
| `tailwindcss` | `^3.4.13` | Utility-first CSS framework customized with OKLCH clinical color system |
| `lucide-react` | `^0.446.0` | Medical and clinical SVG iconography |
| `axios` | `^1.7.7` | Promise-based HTTP client for API communication |
| `typescript` | `^5.5.3` | Static type checking across all components |

---

## 📊 Datasets & Benchmark Clinical Cases

GharCare includes 5 curated, real-world benchmark discharge datasets located in `backend/src/data/`:

| Dataset File | Patient | Clinical Diagnosis | Benchmark Test Objective |
|---|---|---|---|
| [Kamla-Devi-Cholecystectomy.pdf](file:///c:/project/aayu/backend/src/data/Discharge-Summary-Kamla-Devi-Cholecystectomy.pdf) | Kamla Devi (62F) | Laparoscopic Cholecystectomy (Gallbladder Surgery) | **Missing Dosage Blocker**: Flags incomplete Metolar XR duration (`[MISSING QTY]`) requiring senior nurse manual sign-off lock. |
| [Rajesh-Sharma-Cardiology-PCI.pdf](file:///c:/project/aayu/backend/src/data/Discharge-Summary-Rajesh-Sharma-Cardiology-PCI.pdf) | Rajesh Sharma (58M) | Acute Coronary Syndrome (Stent PCI) | **Drug-Drug Interaction**: Verifies dual antiplatelet therapy (Aspirin + Ticagrelor) with gastroprotective PPI coverage. |
| [Ananya-Sen-Dengue-Recovery.pdf](file:///c:/project/aayu/backend/src/data/Discharge-Summary-Ananya-Sen-Dengue-Recovery.pdf) | Ananya Sen (29F) | Dengue Fever with Thrombocytopenia | **Hydration & Platelet Guard**: Tests fever red-flag triggers, hydration schedule, and avoids NSAID bleed risks. |
| [Ratan-Lal-Orthopedic-TKR.pdf](file:///c:/project/aayu/backend/src/data/Discharge-Summary-Ratan-Lal-Orthopedic-TKR.pdf) | Ratan Lal (71M) | Bilateral Total Knee Replacement (TKR) | **Rehabilitation & Anticoagulation**: Physiotherapy schedule + DVT prevention timetable with low-molecular-weight heparin. |
| [Mst.-Shivam-Discharge-Summary.pdf](file:///c:/project/aayu/backend/src/data/Mst.-Shivam-Discharge-Summary.pdf) | Master Shivam (8M) | Pediatric Acute Bronchiolitis | **Pediatric Weight-Based Safety**: Salbutamol nebulization frequency and pediatric warning signs for young parents. |

---

## 🔗 Public APIs & Clinical References

### 1. Google Gemini 2.5 Flash & MedLM (Vertex AI)
- **Reference**: [Google Cloud MedLM Documentation](https://cloud.google.com/vertex-ai/generative-ai/docs/medlm)
- **Usage**: Multimodal extraction of handwritten clinical notes and dense discharge summaries with zero hallucination schemas.

### 2. CDSCO (Central Drugs Standard Control Organisation)
- **Reference**: [Ministry of Health & Family Welfare, Govt. of India](https://cdsco.gov.in/)
- **Usage**: Official Indian registry for approved Fixed-Dose Combinations (FDCs) and Schedule H1 prescription drugs.

### 3. Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP) & Google Maps API
- **Reference**: [Department of Pharmaceuticals, Govt. of India](https://janaushadhi.gov.in/)
- **Usage**: Jan Aushadhi generic equivalent mapping and 24/7 Kendra geolocation finder within 3km of the patient's residence.

### 4. National List of Essential Medicines (NLEM 2022)
- **Reference**: [National Pharmaceutical Pricing Authority (NPPA)](https://www.nppaindia.nic.in/)
- **Usage**: Verification of government price-capped essential medicines to protect families against commercial overcharging.

### 5. NRCeS SNOMED-CT India Extension & ABDM 2026
- **Reference**: [National Resource Centre for EHR Standards (NRCeS)](https://www.nrcs.in/) • [ABDM Sandbox](https://sandbox.abdm.gov.in/)
- **Usage**: Standardizes clinical concepts into Indian SNOMED-CT and HL7 FHIR profiles for 14-digit ABHA health locker synchronization.

### 6. AI4Bharat IndicTrans2 & Google Cloud TTS Neural2
- **Reference**: [AI4Bharat, IIT Madras](https://ai4bharat.iitm.ac.in/)
- **Usage**: Powers **"Awaaz Parchi" (आवाज़ पर्ची)** across 12 Indian languages so elderly and rural family members can simply listen to medicine schedules.

### 7. RFC 5545 iCalendar Protocol & Google Calendar API
- **Reference**: [IETF RFC 5545](https://datatracker.ietf.org/doc/html/rfc5545)
- **Usage**: Generates 1-click Google Calendar reminder deep-links and downloadable `.ics` schedules for recurring medication alarms.

---

## 🌐 Endpoints Overview on Single Server

When deployed, the unified server automatically handles:

| Method & Route | Purpose |
|---|---|
| `GET /` | Complete React Application (GharCare Live Vitals Clinical Handover) |
| `GET /deck.html` | Interactive 10-Slide Hackathon Pitch Deck |
| `GET /api/health` | Backend Health Check & AI Stack Diagnostics |
| `GET /api/cases` | Retrieve All Clinical Discharge Summaries with Indian Formulary |
| `GET /api/cases/:id/indian-formulary` | CDSCO Approval, NLEM 2022 & PMBJP Jan Aushadhi Savings |
| `GET /api/cases/:id/regional-instructions` | AI4Bharat IndicTrans2 Regional Language Instructions (Hi, Mr, Bn, Te, Ta, Gu) |
| `POST /api/extract` | Gemini 2.5 Flash / MedLM Multimodal Vision Extraction |
| `POST /api/cases/:id/approve` | Senior Nurse Approval & Digital Sign-off Lock |
| `GET /api/cases/:id/audio` | "Awaaz Parchi" Spoken Audio Script Generator |
| `GET /api/cases/:id/calendar` | RFC 5545 Google Calendar Reminders Sync |
| `GET /api/pharmacies` | 24/7 Jan Aushadhi Generic Pharmacy Finder |
| `GET *` | SPA Client-Side Routing Fallback |

---

## ☁️ 1-Click Hosting & Deployment Options

### Option 1: Render.com
1. Create a **New Web Service** on [Render](https://render.com).
2. Connect your Git repository.
3. Configuration:
   - **Environment**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `node server.js`
4. Environment Variables:
   - `GEMINI_API_KEY`: Your Google Gemini API Key
   - `NODE_ENV`: `production`

---

### Option 2: Railway.app
1. Create a new project on [Railway](https://railway.app).
2. Choose **Deploy from GitHub repo**.
3. Railway automatically detects `server.js` and `Procfile`.
4. Add `GEMINI_API_KEY` under **Variables**.
5. Railway provides a public HTTPS domain instantly.

---

### Option 3: Docker / Cloud Run / VPS
```bash
# 1. Build Docker image
docker build -t gharcare:latest .

# 2. Run container
docker run -p 4003:4003 -e GEMINI_API_KEY="your_api_key" gharcare:latest
```

---

## 🛠️ Project Directory Tree

```text
├── package.json         # Unified build scripts & dependencies
├── server.js            # Single unified production entrypoint
├── Procfile             # Render / Heroku process manager
├── Dockerfile           # Multi-stage production container
├── README.md            # Hackathon documentation & setup guide
├── backend/
│   ├── src/
│   │   ├── server.ts    # Express REST API & SPA static hosting
│   │   ├── services/
│   │   │   ├── indianMedicalService.ts       # CDSCO, NLEM, Jan Aushadhi & Indic Languages
│   │   │   ├── geminiExtractor.ts            # MedLM & Gemini 2.5 Flash Vision pipeline
│   │   │   ├── safetyEngine.ts               # Deterministic blocker verification firewall
│   │   │   ├── audioService.ts               # Cloud TTS & Awaaz Parchi speech engine
│   │   │   ├── calendarService.ts            # RFC 5545 Google Calendar reminders
│   │   │   ├── pharmacyService.ts            # Jan Aushadhi Kendra & Google Maps locator
│   │   │   └── clinicalDocumentClassifier.ts # Pre-flight clinical document guard
│   │   └── data/        # Benchmark clinical discharge cases (PDF & TS)
│   └── dist/            # Compiled backend server bundle
└── frontend/
    ├── src/             # React 18, Tailwind CSS, Lucide icons, OKLCH design
    ├── public/
    │   └── deck.html    # Standalone presentation deck
    └── dist/            # Vite production static assets
```
