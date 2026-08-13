# CIVICSHIELD AI — PHASE 3A DATASET PREPARATION SPECIFICATION

## 1. FINAL CLASS LIST
Extracted from `PHASE_3_ML_REVIEW.md`:
1. **`pothole` (class_id: 0)**
   - **Definition:** Structural damage to the road surface causing a visible depression.
   - **Positive Example:** A crater in the asphalt, missing pavement chunks.
   - **Negative Example:** Flat road patches, faded paint, longitudinal hairline cracks.
   - **Annotation Difficulty:** Low/Medium (shadows can obscure depth).
   - **Data Requirement:** High (use RDD2022 India subset + custom).
   - **Confusion Classes:** Manhole covers, water reflections, dark shadows.
2. **`garbage_pile` (class_id: 1)**
   - **Definition:** Aggregated solid waste obstructing pedestrian or vehicle pathways.
   - **Positive Example:** Overflowing municipal bins, roadside dump yards, scattered trash piles.
   - **Negative Example:** A single dropped candy wrapper, a clean empty bin.
   - **Annotation Difficulty:** Medium (boundaries can be fuzzy).
   - **Data Requirement:** Medium (TACO + custom collection).
   - **Confusion Classes:** Dirt piles, construction debris (sand/gravel).
3. **`waterlogging` (class_id: 2)**
   - **Definition:** Significant accumulation of standing water on civic infrastructure.
   - **Positive Example:** Submerged roads, blocked drains overflowing into streets.
   - **Negative Example:** Wet asphalt after rain (no standing depth), small isolated puddles.
   - **Annotation Difficulty:** High (reflections, lack of defined edges).
   - **Data Requirement:** Medium (mostly custom data required).
   - **Confusion Classes:** Wet roads, smooth black asphalt reflecting light.

## 2. DATASET SOURCE INVENTORY
1. **RDD2022 (Road Damage Dataset)**
   - **Official Source:** Global Road Damage Detection Challenge (Crowdsensing-based).
   - **Purpose:** Potholes/Cracks.
   - **Classes:** D00, D10, D20, D40 (Pothole).
   - **Annotation Format:** PASCAL VOC (XML) - needs conversion to YOLO.
   - **License:** CC BY 4.0.
   - **CivicShield Compatibility:** Excellent (India subset specifically).
   - **Status:** **APPROVED**
2. **TACO (Trash Annotations in Context)**
   - **Official Source:** TACO GitHub (Pedram W.).
   - **Purpose:** Litter detection.
   - **Classes:** 60 granular litter classes.
   - **Annotation Format:** COCO JSON - needs conversion.
   - **License:** MIT (code), images vary (mostly CC).
   - **CivicShield Compatibility:** Moderate (highly granular, mostly single items, Western context).
   - **Status:** **APPROVED** (with heavy filtering).

## 3. RDD2022 MAPPING
- **D40 (Pothole)** → **CivicShield `pothole` (0)**
- **D00, D10, D20 (Cracks/Ruts)** → **IGNORE** (Not in Phase 3 MVP to maintain focus).
- **D43, D44 (Crosswalks/Lines)** → **IGNORE**.
- **India Subset Usage:** Used partially. We will filter the India subset for images containing at least one `D40` bounding box. Images with only cracks are discarded for now.

## 4. TACO / GARBAGE DATA
- **Mapping:** TACO contains 60 classes (e.g., `Aluminium foil`, `Plastic bag`). We will map ALL super-categories (`Plastic`, `Paper`, `Metal`) that overlap in dense clusters to `garbage_pile`.
- **Limitation:** TACO focuses on individual litter objects. CivicShield cares about *piles* that require municipal dispatch.
- **Custom Requirement:** TACO alone is insufficient. We MUST collect custom Indian context garbage piles (e.g., overflowing street bins, mixed waste dumps).

## 5. WATERLOGGING DATA
- **Availability:** No high-quality, standardized public bounding-box dataset for urban waterlogging exists that fits the Indian context perfectly.
- **Custom Requirement:** 100% custom collection required.
- **Targets:** Focus on monsoon conditions, blocked roadside drains, and submerged potholes (puddles spanning >1 meter).

## 6. CUSTOM CIVICSHIELD DATA
- **`pothole`:** 
  - Minimum: 200 | Recommended: 500 (to supplement RDD2022's dashcam view with pedestrian angles).
- **`garbage_pile`:**
  - Minimum: 300 | Recommended: 600.
- **`waterlogging`:**
  - Minimum: 300 | Recommended: 600.
- **Variations Required:** 30% night shots, 20% wet/monsoon shots, varied angles (pedestrian eye-level vs. two-wheeler rider level).

## 7. INDIAN CONTEXT
**Collection Requirements:**
- **Roads:** Tar roads, concrete streets, interlocking brick gallis.
- **Environment:** Must include Indian street infrastructure (auto-rickshaws, specific municipal bin colors, street dogs, local shopfronts in background).
- **Lighting:** Sodium vapor (yellow) streetlights, harsh mid-day sun, overcast monsoon days.

## 8. LOCATION DIVERSITY
- **Minimum:** Lucknow (2-3 distinct zones: e.g., Gomti Nagar, Aminabad, Alambagh).
- **Recommended:** Lucknow + one other distinct city (e.g., Delhi or Mumbai) to prevent overfitting to local soil/asphalt color.
- **Geographic diversity matters** because soil color (red dirt vs. grey dust) changes the appearance of potholes and garbage edges drastically.

## 9. DATA COLLECTION PROTOCOL
**For Custom Team Collection:**
1. **Device:** Standard smartphones. No DSLRs required.
2. **Angle:** Capture at 45-60 degree angles facing the road (simulating a citizen walking or riding).
3. **Redundancy:** Max 3 photos per issue from different angles (e.g., 5m away, 2m away, different side).
4. **Metadata:** Log the capture session ID (e.g., `lucknow_gomtinagar_session_1`).

## 10. VIDEO DATA
- **Sampling:** 1 frame per 1 second (1 FPS).
- **Grouping:** All frames extracted from `video_001.mp4` must share the same `sequence_id` (e.g., `vid001`).
- **Leakage Prevention:** A `sequence_id` must be routed entirely to `train` OR entirely to `val`. Never split.

## 11. DATASET METADATA
Recommended internal tracking format (CSV/JSON):
`image_id, source, dataset_name, class_presence, capture_session_id, city, time_of_day`
*(Note: Do not commit exact GPS coordinates to public repositories to protect privacy. Use general neighborhood names).*

## 12. DIRECTORY STRUCTURE
```text
civicshield-dataset/
├── raw/                 # Unaltered downloads/photos
├── processed/           # Normalized images ready for splitting
├── images/
│   ├── train/
│   ├── val/
│   └── test/            # (Optional for SIH, can just use train/val)
├── labels/
│   ├── train/
│   └── val/
├── metadata/            # CSV trackers
└── data.yaml            # YOLO config
```

## 13. DATA CLEANING
**Pipeline:**
1. **Format Check:** Ensure all images are RGB `.jpg` or `.png`. Drop `.HEIC` or convert them.
2. **Resolution Check:** Drop images smaller than 320x320.
3. **Corrupt Check:** Attempt to open via `cv2.imread()`. If it returns `None`, delete.
4. **Duplicate Check:** Run perceptual hashing.
5. **Label Check:** Drop empty labels if background images are not desired, or cap background images to 10% of the dataset.

## 14. DUPLICATE DETECTION
- **Method:** Perceptual Hash (pHash) using Python's `ImageHash` library.
- **Why:** pHash detects near-duplicates (e.g., same photo slightly compressed or slightly cropped). SHA-256 only detects exact file matches.
- **Action:** If Hamming distance < 5, flag for manual review or auto-delete the lower-resolution copy.

## 15. ANNOTATION TOOL
**Primary Tool: Roboflow**
- **Evaluation:** Free for public/academic datasets, excellent web-based collaborative UI, handles dataset versioning, auto-converts to YOLO format, and supports auto-splitting. Perfect for a fast-paced SIH team. (CVAT is great but requires Docker hosting).

## 16. ANNOTATION GUIDELINES
- **Bounding Box Start/End:** Tightly hug the outermost visible edge of the object.
- **Occlusion:** Box only the *visible* parts. If a pothole is split in half by a parked tire, draw two boxes if completely severed, or one box around the visible portion if continuous.
- **Tiny Objects:** DO NOT ANNOTATE if < 15x15 pixels.

## 17. WATERLOGGING ANNOTATION
- **Representation:** Bounding Boxes (for Phase 3 YOLO11s).
- **Rule:** Box the contiguous body of standing water. If the street has three distinct large puddles separated by dry land, draw three boxes. If it's one massive flooded intersection, draw one large box encompassing the water.

## 18. GARBAGE ANNOTATION
- **Rule:** Annotate **garbage piles** (contiguous areas of concentrated waste). Do NOT annotate single scattered wrappers or distant small bags unless they pose an obstruction. Include overflowing municipal containers in the bounding box if waste is spilling out.

## 19. POTHOLE ANNOTATION
- **Pothole vs Road Patch:** A patch is a raised or level repair (different color asphalt). DO NOT annotate patches. Potholes must show a structural depression/cavity.
- **Shadows vs Potholes:** Look for texture inside the dark area. If it's just a tree shadow on flat road, DO NOT annotate.
- **Manholes:** DO NOT annotate unless the manhole cover is completely missing (which would be an `open_manhole` class, deferred to future phases).

## 20. ANNOTATION QUALITY CONTROL
- **Two-Stage QA:** 
  1. Annotators (Team members) label data.
  2. Reviewer (Lead Dataset Engineer) samples 20% of annotations per batch.
- **Rejection:** If a batch has >10% critical errors (e.g., boxing flat shadows as potholes), the entire batch is sent back for rework.

## 21. DATASET SPLIT
- **Strategy:** LOCATION / SEQUENCE-AWARE SPLIT.
- **Rule:** Images from `capture_session_id=A` go entirely to Train. `capture_session_id=B` goes entirely to Val.
- **Ratio:** 80% Train, 20% Validation. (Test split is deferred; validation metrics are sufficient for SIH MVP).

## 22. CLASS BALANCING
- **Analysis:** RDD2022 will provide thousands of potholes. Waterlogging will have ~400.
- **Strategy:** **Controlled Sampling.** Limit the ingested RDD2022 dataset to 1,500 pothole images. Do NOT blindly duplicate waterlogging images to reach 1,500. Let YOLO handle the mild imbalance, and monitor per-class mAP.

## 23. DATA AUGMENTATION PREPARATION
- **Preprocessing:** Resize/Letterbox to 640x640.
- **Training Augmentation (Handled by YOLO dynamically, NOT saved to disk):**
  - Horizontal Flip: 50%
  - Brightness/Contrast Jitter: ±20%
  - Rotation: ±10°
- **Raw Data:** Keep the processed directory free of permanent augmentations to maintain a clean source of truth.

## 24. DATA VALIDATION SCRIPT
- **Purpose:** Ensure YOLO directory integrity before Colab upload.
- **Input:** Path to `civicshield-dataset/`
- **Algorithm:**
  - Verify `len(images) == len(labels)` for train/val.
  - Parse every `.txt`. Fail if `class_id` not in `[0, 1, 2]`.
  - Fail if any coord `< 0.0` or `> 1.0`.
- **Output:** Terminal pass/fail summary.

## 25. DATASET REPORT
- **Automated Output (via script or Roboflow):**
  - Total Images: 2,500
  - Images per class: Pothole (1500), Garbage (600), Waterlogging (400)
  - Train/Val Split: 80% / 20%
  - Source: RDD2022 (1500), Custom (1000)

## 26. DATASET VERSIONING
- **v0.1:** RDD2022 only (Baseline test).
- **v1.0:** RDD2022 + TACO + Initial Custom Data (SIH MVP Target).
- **v1.1:** Adds waterlogging and fixes false positive shadows.

## 27. LICENSING RECORD
| Source | License | Allowed Usage | Modification |
| :--- | :--- | :--- | :--- |
| RDD2022 | CC BY 4.0 | Research/Commercial | Yes |
| TACO | MIT/CC | Research/Commercial | Yes |
| Custom (Team) | Open | All | Yes |

## 28. PRIVACY
- **Review:** For Custom Images, blur highly visible faces and legible vehicle license plates *before* uploading to Roboflow/training sets. This is an engineering recommendation to maintain clean data ethics.

## 29. DATASET STORAGE
- **Recommendation:** **Roboflow** for annotation and versioning. Export via `curl` directly into the Google Colab environment.
- **Backup:** Store the raw `.zip` of custom images in Google Drive. Do NOT commit to Git.

## 30. TRAINING READINESS CHECK
- [ ] classes finalized
- [ ] licenses verified
- [ ] raw data collected
- [ ] duplicates removed
- [ ] annotations complete
- [ ] annotation QA complete
- [ ] split validated (location-aware)
- [ ] leakage check passed
- [ ] class distribution reviewed
- [ ] dataset report generated
- [ ] data.yaml validated
- [ ] YOLO directory structure validated

## 31. DATASET COLLECTION PLAN
- **Day 1:** Write dataset validation scripts. Download RDD2022 (India). Filter `D40` classes via script.
- **Day 2:** Team field collection in Lucknow (Target: 300 garbage, 300 waterlogging).
- **Day 3:** Upload to Roboflow. Team annotates. QA check.
- **Day 4:** Export dataset v1.0. Run validation script. Ready for Colab.

---

## 32. CODEX HANDOFF

# CODEX PHASE 3A DATASET TOOLING SPECIFICATION

**TASK 1: RDD2022 Filter Script**
- **Purpose:** Extract India subset potholes.
- **Input:** RDD2022 XML files.
- **Output:** YOLO `.txt` files containing only `D40` mapped to class `0`.
- **Algorithm:** Parse XML, ignore D00/D10/D20. Normalize bounding boxes to 0-1 range.

**TASK 2: Dataset Validation Script**
- **Purpose:** Ensure YOLO directory integrity.
- **Input:** Path to dataset.
- **Output:** Pass/Fail console report.
- **Algorithm:** Iterate labels, check class IDs (0, 1, 2), check coord bounds (0.0-1.0).

**TASK 3: Duplicate Detection Script**
- **Purpose:** Find near-duplicates in custom data.
- **Input:** Directory of custom `.jpg`.
- **Output:** CSV of duplicate pairs.
- **Algorithm:** Use `imagehash.phash`. Flag distance < 5.

*Codex Rule:* Do NOT train models. Write Python utility scripts inside `backend/scripts/dataset/` to automate these tasks.

---

## 33. MANUAL WORK VS AUTOMATION
- **Manual:** Photograph collection, Drawing bounding boxes in Roboflow, Visual QA, License verification.
- **Automated (via Codex scripts):** RDD2022 XML to YOLO parsing, Perceptual hashing (duplicates), YOLO coordinate validation, Train/Val structure generation.

---

## 34. FINAL DATASET SPECIFICATION

**PRIMARY MODEL:** YOLO11s
**INITIAL CLASSES:** `pothole` (0), `garbage_pile` (1), `waterlogging` (2)
**DATA SOURCES:** RDD2022 (India), TACO, Custom Field Data.
**CUSTOM DATA REQUIRED:** 600+ images (focus on garbage and waterlogging).
**MINIMUM DATASET TARGET:** 500 per class.
**RECOMMENDED DATASET TARGET:** 1,500 per class (Balanced).
**ANNOTATION TOOL:** Roboflow.
**SPLIT STRATEGY:** 80/20 Location-Aware (No sequence leakage).
**DATASET STRUCTURE:** Standard YOLO (`images/train`, `labels/train`, `data.yaml`).
**VALIDATION REQUIREMENTS:** Bounding box bound checks (0.0-1.0), missing label checks.
**DATASET VERSION:** Target v1.0 for MVP training.
**TRAINING READINESS CRITERIA:** Section 30 Checklist completely ticked.

---

## 35. FINAL GO / NO-GO

**GO — DATA COLLECTION CAN BEGIN**

*The dataset design strictly adheres to Indian-context requirements, prevents data leakage, isolates manual vs automated work, and provides clear annotation boundaries for the SIH MVP.*
