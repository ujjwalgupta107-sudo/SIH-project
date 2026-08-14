# PHASE 3E.4 — GARBAGE CAN OVERFLOW INSPECTION REPORT

## 1. ZIP Integrity & Directory Structure
**VERIFIED FACT**: The dataset archive `garbage can overflow.v1i.yolov11.zip` was intact but hit Windows path-length constraints during extraction. Extracted successfully via Python. The internal structure contains standard YOLO splits (`train`, `valid`, `test`) and `data.yaml`.

## 2. Dataset Volume
**VERIFIED FACT**: 
- **Total Images**: 1,974
- **Total Label Files**: 1,974
- **Empty Label Files**: 212 (images with no target objects)
- **Total Annotations**: 3,725 bounding boxes.

## 3. YOLO Annotation Syntax
**VERIFIED FACT**: Unlike the previous dataset, this dataset *does* use valid YOLO Object Detection syntax (`class x_center y_center width height`). No out-of-bounds coordinates or zero/negative dimensions were found.

## 4. Classes & Semantic Mapping
**CRITICAL BLOCKER**: 
`data.yaml` defines 10 classes: `['Broken trash can', 'Close_empty', 'Close_full', 'Healthy trash can', 'Open_empty', 'Open_full', 'Trash flow', 'closed', 'empty', 'full']`.
- **Mismatch**: CivicShield's `garbage_pile` class (ID `1`) requires "municipal garbage piles, waste heaps, overflowing street-side accumulation." 
- This dataset's objective is classifying the **structural state and fullness of individual trash cans**. Even the `Trash flow` (overflow) class represents an overflowing *individual bin*, rather than the massive municipal street-side dumps CivicShield is built to detect.

## 5. Duplication and Leakage
**CRITICAL BLOCKER**:
- `find_duplicates.py` detected **154 duplicate/near-duplicate pairs** (distance $\le$ 2).
- **Leakage**: An analysis script found **77 duplicate pairs crossing split boundaries** (e.g., duplicates existing in both `train` and `valid`/`test`). This represents severe data leakage that would artificially inflate validation metrics and compromise the integrity of any model trained on this data.

## 6. Quality, Context, and Suitability
**ENGINEERING RECOMMENDATION**: 
- The target object is wrong. CivicShield aims to detect large unmanaged garbage dumps on roadsides, not whether a specific household garbage bin is "Open_full" or "Close_empty".
- The dataset quality is compromised by massive train/test leakage.
- The 212 empty images might be intended for background training, but combined with the leakage and incorrect target objects, the dataset holds no value for CivicShield.

## 7. License Information
**VERIFIED FACT**: The license is **CC BY 4.0**, provided by a Roboflow user. 

---

### BLOCKERS BEFORE MERGE:
1. **Semantic Incompatibility**: The images feature isolated/individual garbage bins and their fullness states, which violates the strict rule against treating isolated objects as `garbage_pile`.
2. **Train/Test Leakage**: 77 image pairs cross between splits.
3. **Class Overload**: 10 classes exist, none of which perfectly map to a generic "municipal waste heap".

==================================================
FINAL STATUS

DATASET: garbage can overflow.v1i.yolov11.zip
IMAGES: 1,974
ANNOTATIONS: 3,725 (YOLO BBox)
CLASSES: 10 (Trash can states)
VALIDATION: PASS (Syntax is valid, bounds are valid)
DUPLICATES: 154 duplicate/near-duplicate pairs
NEAR-DUPLICATES: Present
LEAKAGE: 77 cross-split duplicate pairs detected
LICENSE: CC BY 4.0
GARBAGE_PILE_MAPPING: REJECTED (Incorrect target semantics: Trash Can States vs Municipal Waste Heaps)
CIVICSHIELD_DECISION: REJECTED (Wrong domain, severe data leakage)
FINAL SPLIT: N/A
YOLO TRAINING: DO NOT USE
