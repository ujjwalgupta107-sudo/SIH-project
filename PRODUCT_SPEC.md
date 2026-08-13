# CivicShield AI: Product Architecture & UX Specification

## Executive Summary
CivicShield AI is an AI-powered civic intelligence and city-response platform designed to transform raw citizen reports into structured, actionable intelligence. It goes beyond a simple complaint management system by leveraging machine learning to predict hotspots, automate routing, and verify resolutions.

This document serves as the source of truth for the Phase 1 Codex Implementation.

---

## PART A — PRODUCT ARCHITECTURE

### High-Level Architecture

The system is separated into deterministic software, machine learning services, and robust data layers to ensure scalability and explainability.

**1. Client Layer (Deterministic UI)**
- **Citizen Application:** Mobile-first PWA or React Native app for reporting issues.
- **Command Center:** Desktop-first React/Next.js dashboard with WebGL map integrations.
- **Department Dashboard:** Task-oriented web view for field officers and departmental managers.

**2. API & Services Layer (Deterministic Logic)**
- **API Gateway:** Handles routing, authentication, and rate limiting.
- **Incident Service:** Core CRUD operations for incidents and lifecycle management.
- **Routing Service:** Deterministic logic mapping AI classifications to specific municipal departments.
- **Notification Service:** Real-time updates via WebSockets/FCM for status changes.

**3. AI / ML / Agent Layer**
- **Vision Model (ML):** Fine-tuned object detection (e.g., YOLO/MobileNet) for identifying civic issues (potholes, garbage, waterlogging).
- **Risk Assessment Model (ML):** Calculates severity scores based on visual severity, location metadata, and historical data.
- **NLP Service (LLM):** Extracts structured entities from text/voice descriptions.
- **Verification Agent:** Compares pre and post-resolution images to determine resolution confidence.
- **Predictive Model (ML):** Spatial-temporal model forecasting risk hotspots based on historical incident density.

**4. Geospatial Layer**
- **GIS Server:** MapLibre GL JS integration for rendering vector tiles, heatmaps, and markers.
- **Spatial Indexing:** PostGIS for rapid spatial queries, bounding boxes, and clustering.

**5. Data Layer**
- **Primary Database:** PostgreSQL with PostGIS extension for structured relational data and spatial querying.
- **Cache:** Redis for rapid session management and duplicate incident hashing.
- **Blob Storage:** S3-compatible storage for citizen media (photos/videos).

---

## PART B — USER PERSONAS

**1. Citizen**
- **Goals:** Quickly report a civic issue, track its progress, and see it resolved.
- **Problems:** Unsure which department is responsible; frustrated by lack of updates.
- **Information Needs:** Simple report status, estimated resolution time.
- **Permissions:** Create reports, view own reports, view public map summaries.
- **Primary Actions:** Capture photo, submit report, track status.
- **Failure Scenarios:** Upload failure (poor network), location spoofing/GPS error.

**2. Command Center Operator**
- **Goals:** Maintain situational awareness of the city; triage critical incidents.
- **Problems:** Information overload during crises; duplicate reports.
- **Information Needs:** Aggregated KPIs, spatial distribution of high-severity incidents.
- **Permissions:** View all incidents, override AI risk scores, escalate issues.
- **Primary Actions:** Monitor map, review AI intelligence panels, manually assign unresolved tasks.
- **Failure Scenarios:** System latency on map rendering, AI misclassification.

**3. Department Officer**
- **Goals:** Efficiently resolve assigned tasks in the field.
- **Problems:** Incomplete task locations; redundant trips.
- **Information Needs:** Exact location, problem severity, historical context of the site.
- **Permissions:** View assigned tasks, update status, upload resolution proof.
- **Primary Actions:** Accept task, mark in-progress, upload after-photo.
- **Failure Scenarios:** Inability to upload proof from dead-zones.

**4. Municipal Administrator**
- **Goals:** Evaluate departmental performance and allocate budget based on predictions.
- **Problems:** Lack of objective metrics; reactive instead of proactive planning.
- **Information Needs:** Resolution rates, predicted risk hotspots, SLA breaches.
- **Permissions:** View analytics, generate reports, view predictive layers.
- **Primary Actions:** Review KPIs, analyze historical data.
- **Failure Scenarios:** Inaccurate prediction models leading to poor resource allocation.

**5. System Administrator**
- **Goals:** Ensure platform uptime and security.
- **Problems:** API bottlenecks, unauthorized access attempts.
- **Information Needs:** System health, error logs, model drift metrics.
- **Permissions:** Full system access, API key management, user roles.
- **Primary Actions:** Monitor infrastructure, manage backups, update AI models.
- **Failure Scenarios:** Database failure, API Gateway crash.

---

## PART C — CITIZEN UX

**Core Philosophy:** Zero technical friction. The citizen should not know AI is working behind the scenes until it provides value.

**Flow:**
1. **Home:** Shows location and "Report Issue" CTA.
2. **Report Issue:** Immediate camera/microphone access.
3. **Capture Media:** Take photo/video or speak.
4. **Location:** GPS auto-fetch with map refinement.
5. **AI Analysis:** Simulated processing UI indicating intelligent parsing.
6. **AI Result:** System proposes issue type and severity for confirmation.
7. **Citizen Confirmation:** User taps "Confirm & Submit".
8. **Submission:** Instant success state.
9. **Tracking:** Clear timeline of progress.
10. **Resolution:** Notification of fix with comparison proof.

---

## PART D — CITIZEN HOME

**Layout (Mobile-First):**
- **Header:** CivicShield Logo + Profile Avatar. Subtext: "Lucknow (Auto-detected)".
- **Hero:** Large, vibrant "Report New Issue" floating action button or primary card.
- **Section 1 (Active):** Horizontal scrolling cards of "My Active Reports" (Status + Thumbnail).
- **Section 2 (Alerts):** "Nearby Civic Alerts" (e.g., "Waterlogging 2km away").
- **Section 3 (Resolved):** "Recent Community Resolutions" (Before/After thumbnails building trust).

**States:**
- **Loading:** Shimmering skeleton cards.
- **Empty:** Illustration of a clean city ("You have no active reports. Help keep Lucknow beautiful!").
- **Error:** "Unable to load nearby alerts. Tap to retry."

---

## PART E — REPORTING EXPERIENCE

**Workflow & States:**

1. **Initial:** Clear grid: [Camera] [Gallery] [Voice] [Text].
2. **Permissions:** Native OS prompt integration. If denied, show a helpful fallback screen ("We need camera access to see the problem").
3. **Recording:** Smooth progress indicator for voice/video.
4. **Uploading:** Deterministic progress bar.
5. **AI Processing:** Fluid, purposeful animation (e.g., scanning line over the image).
6. **Location Adjustment:** Mini-map with a draggable pin. Default to current GPS. Optional text input for landmark.
7. **Duplicate Detected:** "It looks like this pothole was reported 2 hours ago. Would you like to upvote the existing report?"
8. **Submission Success:** Satisfying checkmark animation. Return to Home with new item in Active list.

---

## PART F — AI ANALYSIS EXPERIENCE

**Design Direction:** Sophisticated, credible, and multi-stage.

**UI Elements:**
- A dark overlay with a focused "scanning" box over the captured media.
- Sequential text updates (rapid, 500ms intervals):
  - "Extracting visual features..."
  - "Identifying object classes..."
  - "Cross-referencing historical spatial data..."
  - "Calculating severity index..."
  - "Routing to relevant department..."

*No fake "magic wands" or generic robot icons. Use geometric, precise loading indicators.*

---

## PART G — AI RESULT

**Screen Layout (Read-Only Summary for Citizen):**

- **Thumbnail:** Captured image with subtle AI bounding boxes (if applicable).
- **Classification:** "Pothole + Accident Risk"
- **AI Confidence:** 96%
- **Severity Score:** 91/100 (Color: Critical Red)
- **Location:** Lat/Lng or Reverse-Geocoded Address
- **Context:** "8 similar reports nearby in the last 48 hrs"

**Explainability Section:**
*Why was this rated CRITICAL?*
- [x] High traffic arterial road
- [x] Severe structural damage detected
- [x] Recurring issue in this grid

---

## PART H — INCIDENT TRACKING

**Timeline Component:**
A vertical stepper showing the lifecycle.

1. **Reported** (Timestamp, Citizen)
2. **AI Assessed & Routed** (Severity 91, Routed to PWD)
3. **Assigned to Officer** (Officer Name/ID, Est. Action Time)
4. **Work Started** (Timestamp)
5. **Evidence Uploaded** (Thumbnail of repair)
6. **Resolution Verified** (AI Confidence 95% + Human Approval)
7. **Resolved** (Final checkmark, green status)

---

## PART I — COMMAND CENTER

**Layout (Desktop-First):**

- **Top Navigation/KPIs:** Minimal header. Total Incidents, Critical SLA Breaches, Resolution Rate.
- **Left Panel (Filters):** Department toggles, Severity sliders, Date ranges.
- **Center (Map):** Edge-to-edge MapLibre WebGL map. Dark mode base map to make data pop.
- **Right Panel (Intelligence):** Dynamic slide-out drawer when a map marker is clicked.

---

## PART J — COMMAND CENTER MAP

**Interactions & Features:**
- **Clustering:** Zoomed out, see numbers (e.g., [42]). Zoomed in, clusters break into specific icons.
- **Markers:** Color-coded by severity (Red=Critical, Orange=High, Yellow=Medium, Blue=Low).
- **Overlays:** Toggle "Predicted Risk Heatmap" (a semi-transparent purple/red gradient layer).
- **Hover:** Brief tooltip showing Incident Type and Severity.
- **Click:** Opens Right Panel (Intelligence).

---

## PART K — INCIDENT INTELLIGENCE PANEL

**Right Panel Layout:**

- **Header:** Incident ID #10492 | [CRITICAL] Badge
- **Hero Image:** Original photo with AI bounding boxes.
- **Core Intelligence:**
  - **Type:** Structural Damage
  - **AI Confidence:** 94%
  - **Duplicate Count:** 3 (Link to view cluster)
  - **Recommended Action:** Immediate barricading, PWD dispatch.
- **Workflow State:** Dropdown to manually override AI assignment or status.
- **Timeline:** Mini version of the citizen timeline.

---

## PART L — KPI SYSTEM

**Widgets:**
- **Total Active Incidents:** Big number, trend arrow (e.g., "⬇ 12% vs last week").
- **Resolution Rate:** Circular progress ring.
- **Critical Backlog:** Red warning states if numbers exceed thresholds.

*Design Note: Use clear, highly readable sans-serif typography. Empty states should show "No data for selected period" rather than zeros where misleading.*

---

## PART M — DEPARTMENT DASHBOARD

**Task Queue View:**
A Kanban-style or simple list view prioritized strictly by AI Severity Score.

**Card Data:**
- Location + Distance from current position
- Issue Type
- SLA Time Remaining (e.g., "2 hrs left")

**Actions:**
- [Accept Task] -> Moves to In Progress.
- [Complete Task] -> Opens Camera to take "After" photo.

---

## PART N — PREDICTIVE INTELLIGENCE

**Map Integration:**
- Predictions are shown as a distinct Heatmap layer (purple/magenta hues, avoiding the red/orange of active incidents).

**Prediction Panel (When clicking a hot zone):**
- **Risk:** "High Probability of Waterlogging"
- **Horizon:** "Next 24-48 Hours"
- **Contributing Factors:** "Heavy rainfall forecast + Historical drainage failure in Ward 42 + 15 recent minor blockages."
- **Recommended Preventive Action:** "Dispatch sanitation team to clear primary catch basins on MG Road."

---

## PART O — RESOLUTION VERIFICATION

**Verification UI (For Command Center & Citizen):**

- **Split View:** [Before Photo] | [After Photo]
- **AI Assessment:** "Visual comparison indicates 92% probability of successful repair."
- **Status Badge:** [AI VERIFIED] (Green) or [NEEDS HUMAN REVIEW] (Orange).
- If the AI is uncertain (e.g., < 75% confidence), it flags the incident for human intervention. It never silently closes a critical incident based on a low-confidence match.

---

## PART P — DESIGN SYSTEM

**Tokens:**
- **Typography:** Inter or Roboto (Clean, modern sans-serif).
- **Primary Color:** #2563EB (Trustworthy Blue)
- **Backgrounds:**
  - Light: #F8FAFC
  - Dark (Command Center): #0F172A
- **Severity Colors:**
  - Critical: #EF4444 (Red)
  - High: #F97316 (Orange)
  - Medium: #EAB308 (Yellow)
  - Low: #3B82F6 (Blue)
- **Resolved:** #22C55E (Green)
- **Prediction Layer:** #8B5CF6 (Purple)
- **Radius:** 8px (Modern, slightly rounded)
- **Elevation:** Soft drop shadows for cards, flat for internal inputs.

---

## PART Q — PREMIUM UI/UX

- **Whitespace:** Generous padding within cards to ensure readability.
- **Motion:**
  - Map pans smoothly on marker click.
  - Right panel slides in with an easing function (ease-out-quint).
  - Toasts slide up from bottom center.
- **Grouping:** Use subtle background color shifts (e.g., #F1F5F9) instead of hard borders to group related information in the intelligence panel.
- **Accessibility:** Minimum contrast ratio 4.5:1.

---

## PART R — RESPONSIVE DESIGN

- **Mobile (Citizen):** Bottom navigation bar. Full-width cards. Modals become full-screen overlays.
- **Tablet (Command Center):** Map takes 70% width, side panel 30%. Filters move to a collapsible drawer.
- **Desktop (Command Center):** Map takes center stage. Left navigation and right intelligence panel persist alongside the map.

---

## PART S — ACCESSIBILITY

- **Screen Readers:** All icon buttons must have `aria-label`.
- **Contrast:** Ensure text over map layers is legible (use text outlines or dark semi-transparent backgrounds).
- **Keyboard Navigation:** Command Center must be navigable via Tab (Filters -> Map -> List -> Panel).
- **Focus States:** Clearly visible 2px outline for focused elements.

---

## PART T — ERROR STATES

- **GPS Denied:** "Location access is required to accurately map the issue. [Open Settings]"
- **AI Timeout:** "Analysis is taking longer than expected. We've logged your report and will process it shortly."
- **Duplicate Found:** "We found an identical report nearby. We've added your evidence to prioritize it!"
- **General Network Error:** Offline fallback UI. "No connection. Report saved locally and will upload when online."

---

## PART U — SCREEN INVENTORY

**Citizen Web/App:**
1. `/home` - Dashboard and alerts.
2. `/report` - Media capture and form.
3. `/analysis` - AI processing state.
4. `/incident/:id` - Detailed view and timeline.

**Government Command Center:**
1. `/dashboard` - Map and KPIs.
2. `/incidents` - List view of all active incidents.
3. `/predictive` - Future risk hotspot analysis.
4. `/departments` - Workload and SLA monitoring.

---

## PART V — COMPONENT INVENTORY

- `IncidentMarker`: WebGL map icon with severity color and pulse animation for critical.
- `SeverityBadge`: Pill-shaped indicator showing text and color.
- `AIProcessingOverlay`: Full-screen or component-level loading state with tech-styled scanning animation.
- `BeforeAfterSlider`: Interactive component for resolution verification.
- `TimelineStepper`: Vertical list with active, completed, and pending states.

---

## PART W — DATA CONTRACTS

**Incident Object (JSON Example):**
```json
{
  "id": "inc_948293",
  "citizenId": "usr_001",
  "location": {
    "lat": 26.8467,
    "lng": 80.9462,
    "address": "Hazratganj, Lucknow"
  },
  "media": {
    "before": ["url_to_image.jpg"],
    "after": []
  },
  "aiAnalysis": {
    "classification": "road_damage",
    "confidence": 0.96,
    "severityScore": 88,
    "riskLevel": "HIGH",
    "duplicateOf": null
  },
  "department": "PWD",
  "status": "AWAITING_VERIFICATION",
  "timeline": [
    { "state": "REPORTED", "timestamp": "2026-08-13T10:00:00Z" }
  ]
}
```

---

## PART X — SIH DEMO

**2-Minute Judge Experience:**

1. **Citizen App (0:00 - 0:30):** Presenter opens app on phone, snaps a photo of a printed "pothole" picture.
   - *System:* Rapidly processes, identifies "Pothole", assigns severity 85.
   - *Why it matters:* Shows instant, frictionless AI classification.
2. **Command Center (0:30 - 1:00):** Screen cuts to Desktop Dashboard. The incident instantly pops up as a red pulsing marker on the Lucknow map.
   - *System:* WebSockets push update.
   - *Why it matters:* Shows real-time sync and operational awareness.
3. **Intelligence Panel (1:00 - 1:30):** Click marker. Explain AI reasoning (high traffic area, duplicates found).
   - *System:* Displays NLP context and spatial duplicates.
   - *Why it matters:* Proves the system isn't just a database, it provides actionable intelligence.
4. **Resolution Verification (1:30 - 2:00):** Officer uploads "fixed" photo. System automatically compares and marks "AI Verified".
   - *System:* Visual similarity and feature matching.
   - *Why it matters:* Closes the loop efficiently without human bottleneck.

---

## PART Y — CODEX HANDOFF

# CODEX PHASE 1 IMPLEMENTATION SPECIFICATION

**Repository Structure:**
- `/frontend/citizen` (Next.js or Vite React, Mobile-first CSS)
- `/frontend/command-center` (Next.js, Tailwind, MapLibre GL JS)
- `/backend` (Node.js/Express or Python/FastAPI)

**Frontend Requirements:**
- Implement all components defined in Part V.
- Use the Design System tokens (Part P). Avoid arbitrary colors/spacing.
- Map Integration: Use `react-map-gl` pointing to MapLibre.

**Backend Requirements:**
- Set up PostgreSQL + PostGIS.
- Implement REST API adhering to Data Contracts (Part W).
- Stub out the AI endpoints to return the exact JSON structures needed for the UI if actual ML models are not yet deployed. Use realistic simulated delays (1000-2000ms) for AI endpoints to allow frontend loading states to render properly.

**Environment Variables Needed:**
- `MAPBOX_API_KEY` (or equivalent for MapLibre tiles)
- `DATABASE_URL`
- `AI_SERVICE_URL`

**Acceptance Criteria for Codex Phase 1:**
- Citizen can upload a photo and receive a simulated/real AI response.
- Incident appears on the Command Center map.
- Command Center operator can view the Intelligence Panel.
- All UIs must strictly follow the premium, modern aesthetic described in this document.

---

*End of Specification. Ready for Implementation Agent.*
