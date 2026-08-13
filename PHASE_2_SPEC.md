# CIVICSHIELD AI — PHASE 2 ENGINEERING SPECIFICATION

## 1. Executive Summary
Phase 2 transforms CivicShield AI from a static frontend and foundational spatial database into a robust, end-to-end incident reporting engine. This phase introduces real media capture, offline-first queuing, secure blob storage abstraction, precise PostGIS location handling, and a strict state-machine lifecycle for incidents. All work in Phase 2 establishes the data pipeline necessary for Phase 3 (AI analysis) without implementing the AI logic itself.

## 2. Current Repository Audit
**CURRENT STATE:**
- **Frontend:** Modularized React apps (`Citizen`, `Command Center`). Report pages exist but use mocked state flows and hardcoded API responses.
- **Backend:** FastAPI with PostGIS (`models.py`, `database.py`). JWT/RBAC works. 
- **Incident Model:** Has basic text fields and a `geography(POINT)` column.
- **Media Model:** `IncidentMedia` table exists but lacks deep metadata (size, mime_type).
- **API Contracts:** `POST /api/v1/incidents` accepts JSON but has no media upload capability.
- **MapLibre Integration:** Hardcoded markers in `IncidentMap.tsx`.

**GAP:**
- No real media upload, storage provider abstraction, GPS `navigator.geolocation` hooks, or offline persistence mechanism (e.g., IndexedDB).
- `IncidentMedia` model needs expansion.

**IMPLEMENTATION REQUIREMENT:**
- Implement `MediaStorageService`.
- Upgrade the `Incident` creation API flow to handle multipart/signed uploads.
- Build offline-first reporting UI and IndexedDB sync queue.

## 3. End-to-End Architecture
**Client (Citizen PWA):**
- Uses `navigator.geolocation` and HTML5 `<input type="file" accept="image/*,video/*" capture="environment">`.
- Offline state managed via React Context + IndexedDB (using `idb`).

**Backend (FastAPI):**
- **Option B (Signed URLs)** is chosen for upload architecture. The backend issues a presigned POST URL, the client uploads directly to Object Storage (S3/MinIO), and the client confirms completion via a webhook or follow-up API call. This saves API bandwidth and scales well for large videos.
- Incident creation is idempotent.

## 4. Citizen UX
The UI must remain SIH-final-quality: Fast, simple, and trustworthy.
- **Screen Layout:** Full-screen step-by-step wizard to prevent cognitive overload.
- **Steps:** 
  1. Capture (Camera/Gallery buttons)
  2. Description (Textarea + optional voice memo placeholder)
  3. Location (Map pin drop)
  4. Review (Summary card)
  5. Submit (Progress bar -> Success tick)
- **Validation:** Disable the 'Next' button if media or location is missing.
- **Empty/Error States:** Graceful fallback if GPS is denied (manual pin drop).

## 5. Media Architecture
- **Constraints:** Max image size 10MB. Max video size 50MB (duration limit 30s).
- **MIME Validation:** Client checks extension. Server strictly validates via magic bytes/Content-Type after upload.
- **Thumbnailing:** The client should attempt to generate a base64 low-res thumbnail using HTML5 Canvas before uploading the full payload, allowing the UI to remain optimistic.

## 6. Storage Architecture
**Abstraction: `MediaStorageService`**
- Operations: `generate_upload_url(key, mime_type, size)`, `delete(key)`, `get_metadata(key)`
- **Providers:** 
  - `S3StorageProvider` (Production/AWS)
  - `LocalEmulatorProvider` (Development - writes to local disk and serves via FastAPI static files)

## 7. GPS Architecture
- **Integration:** Attempt `navigator.geolocation.getCurrentPosition(success, error, {enableHighAccuracy: true, timeout: 5000})`.
- **Storage:** Capture `latitude`, `longitude`, `accuracy` (in meters).
- **Fallback:** If denied or timeout occurs, default to a city-center pin and prompt the user to manually drag the pin to the incident location.

## 8. Geospatial Architecture
- **PostGIS:** The authoritative location remains `geography(POINT,4326)`.
- **Nearby Queries:** Expose `GET /api/v1/incidents/nearby?lat=x&lng=y&radius=500` utilizing `ST_DWithin`.
- This foundation ensures Phase 3 can detect duplicates efficiently.

## 9. Incident Lifecycle
**States:**
`DRAFT` (Client only) → `SUBMITTED` (Pending media confirm) → `REPORTED` (Ready for AI) → `ASSESSED` (AI complete) → `ASSIGNED` → `IN_PROGRESS` → `RESOLVED`.
- **State Transition Matrix:**
  - Citizen can only transition: `DRAFT` → `SUBMITTED`.
  - Backend auto-transitions: `SUBMITTED` → `REPORTED` (upon media webhook/confirmation).

## 10. Database Changes
**`incident_media` table:**
- Add `storage_key` (String, unique)
- Add `mime_type` (String(100))
- Add `size_bytes` (Integer)
- Add `thumbnail_key` (String, optional)

**`incidents` table:**
- Add `idempotency_key` (String(100), unique, indexed)
- Add `location_accuracy` (Float, optional)

## 11. API Contracts
**1. Request Upload URL**
- `POST /api/v1/media/upload-url`
- Auth: JWT (Citizen)
- Request: `{ "mime_type": "image/jpeg", "size_bytes": 4500000 }`
- Response: `{ "storage_key": "uuid.jpg", "upload_url": "https://...", "expires_in": 300 }`

**2. Create Incident (Idempotent)**
- `POST /api/v1/incidents`
- Auth: JWT (Citizen)
- Headers: `Idempotency-Key: <uuid>`
- Request: 
  ```json
  {
    "description": "Pothole",
    "latitude": 26.8467,
    "longitude": 80.9462,
    "accuracy": 12.5,
    "media": [{ "storage_key": "uuid.jpg", "type": "BEFORE" }]
  }
  ```
- Response: `201 Created`, Incident object.

## 12. Security
- **MIME Validation:** Presigned URLs restrict Content-Type.
- **IDOR Prevention:** `GET /api/v1/incidents/{id}` enforces that if the user role is `CITIZEN`, `incident.citizen_id` must match the JWT `sub`.
- **Rate Limiting:** IP/User-based rate limiting on incident creation (e.g., 5 per minute) to prevent spam.

## 13. Privacy
- **Location:** Stored to resolve civic issues. Retained indefinitely as historical aggregate data, but disconnected from PII after incident closure.
- **Identity:** Only authorized municipal officers and the reporting citizen can view the `citizen_id` linked to an incident. Public map queries obscure exact coordinates slightly or aggregate them into hexbins.

## 14. Offline Architecture
- **IndexedDB:** Use a simple wrapper (e.g., `localforage` or `idb-keyval`).
- **Flow:** If `navigator.onLine` is false, serialize the report (including Base64/Blob media) to IndexedDB.
- **Sync:** A background worker or React `useEffect` listener on the `online` event processes the queue sequentially, uploading media then POSTing the incident.

## 15. Frontend Architecture
- `ReportWizard`: Parent state machine component holding the draft object.
- `MediaCapture`: Handles `<input file>` and Canvas thumbnailing.
- `LocationPicker`: Uses `react-map-gl` to drop a draggable pin.
- `OfflineQueue`: Context provider managing the IndexedDB sync state.

## 16. Command Center Integration
- For Phase 2, the Command Center will use standard HTTP polling (e.g., `SWR` or `React Query` with a 15-second `refetchInterval`) on `GET /api/v1/incidents`.
- WebSockets/SSE are deferred to Phase 4.

## 17. Testing Strategy
- **Backend:** 
  - Mock the `MediaStorageService` and test the pre-signed URL generation.
  - Test idempotency (sending the same `Idempotency-Key` twice returns the same `201` response without duplicating rows).
  - Test spatial queries using Pytest + PostGIS.
- **Frontend:** 
  - Mock `navigator.geolocation` in Vitest.
  - Test the offline queue serialization.

## 18. Observability
- **Logs:** Log `incident_created` with `user_id` and `accuracy_radius`.
- Do not log raw descriptions or lat/lng coordinates in application logs; keep them in the secure database.

## 19. SIH Demo
The 90-second flow:
1. Presenter switches phone to "Airplane Mode" (simulating poor connectivity in Lucknow).
2. Captures pothole photo, drops pin.
3. Submits. App shows "Saved on device - waiting for network".
4. Presenter disables Airplane Mode. App shows a toast "Syncing report...".
5. Success tick appears.
6. Screen cuts to Command Center desktop: the new marker appears instantly (via 15s polling).

## 20. Future AI Integration
The schema explicitly separates deterministic reporting from AI. The `SUBMITTED` incident triggers a backend event (currently synchronous, later Kafka/RabbitMQ). The AI worker will pick up the `storage_key`, download the image, run YOLO inference, and write to the `ai_assessments` table.

---

## 21. CODEX PHASE 2 IMPLEMENTATION SPECIFICATION

**TASK 1: Database/schema changes**
- Objective: Expand models for idempotency and detailed media.
- Files: `models.py`, Alembic migrations.
- DB Changes: Add `idempotency_key`, `location_accuracy` to `incidents`. Update `incident_media` schema.

**TASK 2: Media storage abstraction**
- Objective: Build `MediaStorageService`.
- Files: `services/storage.py`
- Implementation: Interface with a `LocalEmulatorProvider` saving to a local `uploads/` directory for now.

**TASK 3: Upload API & Validation**
- Objective: Presigned URL endpoints.
- Files: `routers/media.py`

**TASK 4: Incident creation workflow (Idempotent)**
- Objective: Update `POST /incidents` to handle idempotency and associate media.
- Files: `routers/incidents.py`, `services/incidents.py`

**TASK 5: Citizen ownership/security**
- Objective: IDOR protection.
- Files: `services/incidents.py` (add ownership checks based on JWT `sub`).

**TASK 6: Nearby PostGIS queries**
- Objective: Support spatial filtering.
- Files: `routers/incidents.py`, `repositories/incidents.py` (`ST_DWithin`).

**TASK 7: Frontend Location API & Map Pin**
- Objective: Integrate `navigator.geolocation` and MapLibre draggable pin.
- Files: `citizen/src/features/report/LocationPicker.tsx`

**TASK 8: Media Capture UX**
- Objective: Camera/Gallery integration with client-side validation.
- Files: `citizen/src/features/report/MediaCapture.tsx`

**TASK 9: Offline queue & Sync**
- Objective: IndexedDB persistence for offline reporting.
- Files: `citizen/src/services/offlineQueue.ts`

**TASK 10: Citizen reporting UX (Wizard)**
- Objective: Stitch the steps together.
- Files: `citizen/src/pages/ReportPage.tsx`

**TASK 11: Command Center polling**
- Objective: React Query/SWR 15s polling for new incidents.
- Files: `command-center/src/app/CommandCenterApp.tsx`

## 22. Implementation Order
1. Database/schema changes
2. Media storage abstraction
3. Upload API
4. Incident creation API (Idempotency + PostGIS)
5. Citizen ownership/security
6. Nearby PostGIS queries
7. Frontend location & Map integration
8. Media capture UX
9. Citizen reporting UX (Wizard state machine)
10. Offline queue
11. Command Center polling integration
12. Testing & Polish

## 23. Definition of Done
- [ ] Real citizen report can be created
- [ ] Real media can be uploaded
- [ ] Media metadata is stored
- [ ] PostgreSQL/PostGIS stores incident location
- [ ] GPS integration works
- [ ] Manual location correction works
- [ ] Incident receives unique ID
- [ ] Citizen can track incident
- [ ] Ownership authorization works
- [ ] State transitions are enforced
- [ ] Command Center can retrieve submitted incidents via polling
- [ ] Nearby spatial query works
- [ ] Pagination works
- [ ] Idempotency works
- [ ] Offline queue works or has a tested implementation
- [ ] Security validation passes
- [ ] Tests pass
- [ ] Production builds pass
- [ ] No fake AI output is presented as real
- [ ] Phase 3 YOLO integration can consume incident media cleanly
