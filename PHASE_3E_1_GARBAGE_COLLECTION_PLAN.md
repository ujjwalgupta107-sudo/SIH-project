# PHASE 3E.1 — CUSTOM GARBAGE-PILE DATASET COLLECTION PLAN

## 1. Collection Target
These are engineering targets for data gathering to support training stability. They do NOT guarantee model accuracy.
- **MINIMUM (MVP Demo)**: 500 total images per class (approx. 400 positive, 100 negative).
- **RECOMMENDED (SIH Final)**: 1,500 total images per class.
- **STRONG (Production)**: 5,000+ total images per class.

## 2. Required Visual Variety
To ensure robust generalization across diverse Indian urban environments, the collection MUST include:
- Small, medium, and large garbage piles/heaps.
- Overflowing municipal bins and roadside dumping.
- Mixed household waste (e.g., plastic, organic, construction debris mixed together).
- Partially occluded piles (e.g., behind cars, fences, or stray animals).
- Varying camera distances (close-up, medium, far) and angles.
- Different lighting conditions: daylight, low light, and shadows.
- Crowded streets and isolated alleys.

## 3. Negative Images
**NEGATIVE IMAGES REQUIRED**: ~10-20% of total collection (e.g., 100 for the MVP minimum).
**Why they are important**: Negative images train the model to suppress false positives by teaching it what a `garbage_pile` is NOT.
**Examples to collect (DO NOT ANNOTATE THESE)**:
- Clean roads, normal sidewalks, and functional infrastructure.
- Isolated single items (e.g., one bottle, one wrapper, one can).
- Fallen leaves, natural debris, or purely construction material.
- Shadows or road patches that mimic the shape of waste.

## 4. Capture Session Metadata
Every distinct physical collection location/time must receive a unique `capture_session_id`.
**Required metadata tracking** (in `civicshield-dataset/metadata/collection_template.csv`):
- `image_id`
- `capture_session_id`
- Approximate location/area identifier (e.g., "Lucknow_GomtiNagar_Market")
- Date and time of day
- Lighting condition
- Capture device (e.g., smartphone model)
- Scene description (e.g., "Overflowing green bin next to a bus stop")
- Privacy review status (Pending/Approved/Rejected)
*(Precise GPS coordinates and unnecessary personal information must NOT be stored).*

## 5. Privacy Workflow
Private and sensitive material MUST NOT enter the training dataset.
**Required Workflow**:
1. **Identify**: Screen raw images for visible faces, readable license plates, identifiable children, or sensitive private property.
2. **Handle**: 
   - Option A: Blur/redact the sensitive information safely.
   - Option B: If redaction destroys the image context, REJECT and delete the image.
3. **Approve**: Only images marked "Privacy Approved" can be moved to the annotation stage.

## 6. Annotation Rules
Target class: `1 = garbage_pile`

**WHEN TO ANNOTATE**:
- Annotate aggregated accumulations of discarded waste visible as a pile, cluster, or overflowing bin that requires municipal intervention.

**DO NOT ANNOTATE**:
- Single, scattered, or isolated items (bottles, wrappers, cans, cigarettes).
- Natural debris (leaves, branches).
- Clean construction material (unless mixed with household waste dumps).

**HANDLING EDGE CASES**:
- **Overlapping/Multiple piles**: If distinct piles are clearly separated by clean space, draw separate bounding boxes. If they merge into a massive heap, draw one encompassing box.
- **Occlusion**: Draw the bounding box strictly around the *visible* portion of the garbage pile. Do not guess the hidden boundaries.
- **Inside/Beside bins**: If a bin is overflowing, annotate the visible garbage overflowing from it. Annotate distinct piles beside the bin separately.

## 7. Quality Control
**Stage 1: Annotator Review**: The primary annotator draws boxes according to the rules and flags edge cases.
**Stage 2: Independent Quality Review**: A secondary reviewer verifies the bounding boxes.
**Rejection Criteria**:
- Boxes drawn around single litter items.
- Loose boxes that include excessive background.
- Truncated boxes that miss half the pile.
- Blurry or entirely unreadable images.

## 8. Directory Structure
```
civicshield-dataset/
├── raw/
│   └── custom/
│       └── garbage/          <-- Raw, pre-privacy review images
├── metadata/
│   ├── CUSTOM_COLLECTION_GUIDE.md
│   └── collection_template.csv
└── processed/
    └── custom_garbage/       <-- Privacy-cleared, annotated, ready-to-merge data
```
Raw images must NOT be destructively moved until properly copied and cleared.

## 9. Dataset Safety
- Raw source images will be preserved.
- No automatic deletion of raw source images.
- Final YOLO dataset split will NOT be created during collection.
- YOLO training is NOT authorized.
- Capture-session grouping metadata will be preserved to prevent leakage.
- Duplicate detection (pHash) will run before the final dataset merge.

==================================================
FINAL STATUS
==================================================
GARBAGE COLLECTION: READY
TARGET MINIMUM: 500 images
TARGET RECOMMENDED: 1500 images
TARGET STRONG: 5000 images
NEGATIVE IMAGES REQUIRED: 100 (for MVP)
CAPTURE SESSION ID: REQUIRED
PRIVACY REVIEW: REQUIRED
ANNOTATION: NOT STARTED
FINAL SPLIT: NOT CREATED
YOLO TRAINING: NOT AUTHORIZED
