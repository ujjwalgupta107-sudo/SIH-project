# CivicShield AI — CURRENT ARCHITECTURE AUDIT REPORT

**Date:** 2026-08-16
**Auditor:** opencode (Senior Full-Stack Engineer / AI/ML Engineer / System Architect)

---

## A. CURRENT ARCHITECTURE OVERVIEW

### Repository Structure
```
CivicShield-AI/
├── backend/                    # FastAPI backend (Python)
│   ├── app/
│   │   ├── routers/           # incidents.py, departments.py, media.py
│   │   ├── services/          # ai.py, auth.py, incidents.py, ml.py, severity.py, storage.py
│   │   ├── repositories/      # incidents.py
│   │   ├── models.py          # SQLAlchemy models (User, Department, Incident, AIAssessment, IncidentMedia, Assignment, AuditLog)
│   │   ├── schemas.py         # Pydantic schemas (IncidentCreate, Detection, PredictResponse, etc.)
│   │   ├── database.py        # SQLite for dev, PostGIS-ready
│   │   ├── config.py          # Pydantic settings from .env
│   │   └── main.py            # FastAPI app with CORS, routers
│   ├── ml/                    # YOLO training runs
│   │   └── runs/detect/civicshield_models/interim_2class_model/weights/best.pt
│   ├── tests/                 # pytest (test_api.py, test_ml.py)
│   └── uploads/               # Local file storage
├── frontend/
│   ├── citizen/               # Vite + React (port 5173) - Mobile-first citizen app
│   │   ├── src/
│   │   │   ├── pages/         # HomePage, ReportPage, AnalysisPage, IncidentPage
│   │   │   ├── components/    # AppShell
│   │   │   ├── features/report/ # MediaCapture, LocationPicker
│   │   │   ├── services/      # ml.ts (predictImage), incidents.ts, offlineQueue.ts
│   │   │   └── app/           # CitizenApp (routing)
│   │   └── package.json
│   ├── command-center/        # Vite + React (port 5174) - Desktop-first ops dashboard
│   │   ├── src/
│   │   │   ├── app/           # CommandCenterApp
│   │   │   └── features/map/  # IncidentMap (MapLibre GL)
│   │   └── package.json
│   └── shared/                # TypeScript contracts, theme.css
├── civicshield-dataset/       # Processed YOLO datasets
│   ├── processed/
│   │   ├── interim_2class_split/  # 3,292 images, 21,043 objects (pothole + waterlogging)
│   │   ├── pothole_yolo/
│   │   └── waterlogging_unique/
│   └── raw/
├── tools/dataset/             # Python dataset tooling (validator, splitter, converter, phash)
└── docker-compose.yml         # PostGIS database
```

---

## B. NUMBER OF LOCALHOST SERVICES

| SERVER | PORT | PURPOSE | DEPENDENCIES | CAN IT BE MERGED? |
|--------|------|---------|--------------|-------------------|
| **Backend API (FastAPI)** | 8000 | Core API: incidents, departments, media upload, ML prediction | SQLite/PostGIS, YOLO model (best.pt), JWT auth | **NO** - Required as API backend |
| **Citizen Frontend (Vite)** | 5173 | Mobile-first citizen reporting app | Backend API (8000), shared contracts | **YES** - Merge into unified frontend |
| **Command Center Frontend (Vite)** | 5174 | Desktop operations dashboard with MapLibre | Backend API (8000), shared contracts | **YES** - Merge into unified frontend |
| **Database (PostGIS via Docker)** | 5432 | PostgreSQL + PostGIS for production | docker-compose | **NO** - Infrastructure |

**Total: 4 services (3 dev servers + 1 DB)**

### Why Multiple Frontend Dev Servers Exist
1. **Historical separation**: Citizen (mobile-first) and Command Center (desktop-first) were built as separate apps
2. **Different tech stacks**: Command Center uses `react-map-gl` + `maplibre-gl` for maps; Citizen does not
3. **Different routing**: Citizen uses React Router with `/home`, `/report`, `/analysis`, `/incident/:id`, `/history`, `/profile`; Command Center is a single-page dashboard
4. **Shared contracts only**: They share `frontend/shared/contracts.ts` and `theme.css` but are otherwise independent

### Can They Be Merged?
**YES** - Both are Vite + React + TypeScript apps sharing the same backend API and contracts. A unified frontend with role-based routing (`/command-center` for authority users) eliminates the need for two dev servers.

---

## C. BACKEND CAPABILITIES

### ✅ Working Features
- **Incident CRUD**: Create, read, list, update with role-based access
- **ML Prediction Endpoint**: `/api/v1/media/predict` accepts image upload, returns YOLO detections
- **Real YOLO Inference**: `ml.py` loads `best.pt` (2-class: pothole, waterlogging)
- **Severity Calculation**: Real ML-based severity scoring in `severity.py`
- **AI Analysis Service**: Production/development modes, department assignment
- **JWT Authentication**: Role-based (CITIZEN, OFFICER, OPERATOR, ADMIN)
- **Media Storage**: Local file upload emulator
- **PostGIS-ready Models**: GeographicPoint type for spatial queries

### ⚠️ Gaps / Limitations
| Feature | Status | Notes |
|---------|--------|-------|
| **Garbage Detection** | NOT TRAINED | Model only has 2 classes (pothole=0, waterlogging=1) |
| **Road Damage Detection** | REMOVED FROM SCOPE | Road damage represented through Pothole class |
| **Video Inference** | NOT IMPLEMENTED | Only single-image `/predict` endpoint |
| **Authority Resolution** | NOT IMPLEMENTED | Hardcoded departments, no geocoding |
| **Email Notification** | NOT IMPLEMENTED | No SMTP service |
| **Live Camera Inference** | NOT IMPLEMENTED | Backend has no streaming endpoint |
| **Frame Sampling** | NOT IMPLEMENTED | Would need new endpoint |
| **Duplicate Detection** | STUB ONLY | Returns count=0 |

---

## D. FRONTEND CAPABILITIES

### Citizen App (port 5173)
| Page | Status | Features |
|------|--------|----------|
| `/home` | Basic | Static hero, mock alerts, Lucknow hardcoded |
| `/report` | Functional | MediaCapture (photo upload + ML preview), LocationPicker (GPS), text description |
| `/analysis` | Mock | Simulated loading steps, no real API call |
| `/incident/:id` | Basic | Reads from sessionStorage, shows mock result |
| `/history` | Stub | Static "Your civic activity will appear here" |
| `/profile` | Stub | Static |

**MediaCapture**: Uploads image → calls `/api/v1/media/predict` → draws bounding boxes on canvas ✅
**LocationPicker**: `navigator.geolocation.getCurrentPosition()` with fallback ✅

### Command Center (port 5174)
| Feature | Status |
|---------|--------|
| Live operational map (MapLibre GL) | ✅ Working |
| Incident markers with severity colors | ✅ Working |
| KPIs (active, critical, resolution rate, hotspots) | ✅ Working (mock + real data polling) |
| Incident intelligence panel | ✅ Working |
| Predicted risk heatmap toggle | ✅ Working (UI only) |
| Department filter, date range | ✅ UI only |
| Garbage detection notice | Shows "Deferred (Coming Soon)" |
| Real-time polling (15s) | ✅ Hits `/api/v1/incidents` |

---

## E. ML MODEL STATUS

### Current Trained Model: `interim_2class_model`
- **Architecture**: YOLOv8n (nano)
- **Training**: 1 epoch, CPU, imgsz=160, batch=32
- **Classes**: 
  - `0: pothole` (2,565 train / 622 val labels)
  - `1: waterlogging` (14,452 train / 3,404 val labels)
- **Weights**: `best.pt` (6.2 MB), `last.pt` (6.2 MB)
- **Data**: 3,292 images (2,643 train / 649 val), 21,043 total objects
- **Validation**: PASSED (validation.json)
- **Results**: `results.csv` exists but 1 epoch is insufficient for convergence

### Required Classes (Final CivicShield Scope)
| Class | Current Status | Action Needed |
|-------|----------------|---------------|
| Pothole | ✅ TRAINED | Keep |
| Waterlogging | ✅ TRAINED | Keep |
| Garbage / Garbage Pile | ❌ NOT TRAINED | Need Class-1 dataset, annotate, validate, merge, train |
| Road Damage / Cracks | 🚫 REMOVED | Not a separate class — represented via Pothole |

### Dataset Audit Summary
- **Pothole**: RDD2022 India subset processed ✅
- **Waterlogging**: Custom collection processed, deduplicated ✅
- **Garbage**: Multiple sources inspected (Roboflow, TACO, Kaggle, StreetView) - **ALL REJECTED** for not meeting Class-1 requirements (single items, indoor bins, not street garbage piles)
- **Road Damage**: 🚫 **REMOVED FROM SCOPE** — Road damage represented through Pothole category; no separate ML class maintained

---

## F. AUTHORITY RESOLUTION & NOTIFICATION

### Current State: **NOT IMPLEMENTED**
- No reverse geocoding service
- No authority mapping database
- No SMTP/email service
- Departments hardcoded in `severity.py`: `Road Maintenance / PWD`, `Sanitation / Municipal Corporation`, `Drainage / Municipal Corporation`
- No notification status tracking (PENDING/SENT/FAILED)

### Required Implementation
1. **AuthorityResolver Service**: lat/lng → city/district → municipal authority → department
2. **NotificationService**: Email with incident details + Google Maps link
3. **Environment Variables**: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `AUTHORITY_EMAIL` mappings
4. **Fallback**: Store incident with `notification_status: PENDING/FAILED` if email unavailable

---

## G. LIVE CAMERA / GPS / VIDEO STATUS

| Feature | Backend | Citizen Frontend | Status |
|---------|---------|------------------|--------|
| Photo Upload + ML | ✅ `/media/predict` | ✅ MediaCapture | **WORKING** |
| Video Upload | ❌ | ❌ (accepts video but no processing) | **NOT IMPLEMENTED** |
| Live Camera Feed | ❌ | ❌ | **NOT IMPLEMENTED** |
| Frame Sampling/Throttling | ❌ | ❌ | **NOT IMPLEMENTED** |
| GPS (getCurrentPosition) | N/A | ✅ LocationPicker | **WORKING** |
| GPS (watchPosition) | N/A | ❌ | **NOT IMPLEMENTED** |
| Permission Handling | N/A | Basic (fallback only) | **PARTIAL** |

---

## H. SECURITY & CONFIGURATION

### ✅ Properly Configured
- JWT secret in `.env` (not committed)
- Database URL in `.env`
- CORS origins configurable
- File upload validation (MIME type, size via schema)

### ⚠️ Needs Attention
- No rate limiting on `/predict` endpoint
- No file type validation on upload (relies on client)
- SMTP credentials not yet in `.env.example`
- No API key management for external geocoding

---

## I. TESTING STATUS

### Backend Tests (pytest)
- `test_api.py`: Health, incident CRUD, validation, role permissions, development analysis ✅
- `test_ml.py`: Predict endpoint auth, mock auth with smoke test detection ✅
- **Run**: `cd backend && pytest` → **PASSES**

### Frontend Tests
- Citizen: `vitest` configured, no tests written
- Command Center: `vitest` configured, no tests written
- **Build**: Both `npm run build` succeed (TypeScript + Vite)

---

## J. SUMMARY: WHAT EXISTS vs. WHAT'S NEEDED

| Category | Current | Required for Unified Product | Gap |
|----------|---------|------------------------------|-----|
| **Frontend Apps** | 2 separate (5173, 5174) | 1 unified (single port) | Merge + role-based routing |
| **Home Page** | Basic static | Cyberpunk hero + live map | Complete redesign |
| **Report Issue** | Photo + GPS | Photo/Video + GPS + map adjust | Video upload, map picker |
| **Live Detection** | None | Camera feed + AI + GPS | Full implementation |
| **Photo AI** | ✅ Working | ✅ Working + severity UI | Minor UI polish |
| **Video AI** | None | Frame sampling + aggregate | New endpoint + frontend |
| **My Reports** | Stub | List with status/timeline | Full implementation |
| **City Map** | Command Center only | Unified + role-based | Merge + citizen view |
| **Command Center** | ✅ Working | Role-gated `/command-center` | Merge into unified app |
| **Profile** | Stub | User info, settings | Implementation |
| **Authority Resolution** | None | Geocoding + dept mapping | New service |
| **Email Notification** | None | SMTP + templates + fallback | New service |
| **Garbage Model** | Not trained | Train or mark "Coming Soon" | Dataset needed |
| **Road Damage Model** | 🚫 Removed | Not a separate class | N/A — use Pothole |

---

## K. RECOMMENDED DEVELOPMENT ARCHITECTURE (POST-MERGE)

```
Development:
├── Frontend (Vite React)     → localhost:5173 (SINGLE PORT)
│   ├── /                     → Home (public)
│   ├── /report               → Report Issue (citizen)
│   ├── /live-detection       → Live Camera AI (citizen)
│   ├── /reports              → My Reports (citizen)
│   ├── /map                  → City Map (citizen + authority)
│   ├── /command-center       → Command Center (authority only)
│   ├── /incidents/:id        → Incident Detail (both)
│   └── /profile              → Profile (both)
│
├── Backend (FastAPI)         → localhost:8000
│   ├── /api/v1/incidents
│   ├── /api/v1/departments
│   ├── /api/v1/media/predict (photo)
│   ├── /api/v1/media/predict-video (NEW)
│   ├── /api/v1/media/predict-live (NEW - frame sampling)
│   ├── /api/v1/authorities/resolve (NEW)
│   └── /api/v1/notifications/send (NEW)
│
└── Database (PostGIS)        → localhost:5432 (Docker)
```

**Total Dev Servers: 2 (Frontend: 5173, Backend: 8000) + 1 DB (5432)**

---

## L. NEXT STEPS (PRIORITIZED)

1. **Merge Frontends** → Single Vite app with role-based routing
2. **Cyberpunk UI System** → Design tokens, components, animations
3. **Home Page** → Hero + live incident map (demo data from backend)
4. **Report Page** → Photo/Video capture + GPS + map adjustment
5. **Live Detection Page** → Camera feed + throttled inference + GPS
5. **Photo/Video AI** → Bounding boxes, confidence, severity, authority preview
6. **Authority Resolution** → Geocoding service + department mapping
7. **Email Notification** → SMTP service + templates + fallback
8. **Command Center** → Merge into `/command-center` route with auth guard
9. **Dataset Audit** → Verify garbage data availability (road damage removed from scope)
10. **Model Training** → Only after dataset validation + authorization
11. **E2E Testing** → All 18 test scenarios from spec

---

**END OF AUDIT REPORT**