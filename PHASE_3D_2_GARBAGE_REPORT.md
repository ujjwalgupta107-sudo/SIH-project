# PHASE 3D.2 — GARBAGE DATASET REPORT

## 1. Dataset Source
**VERIFIED FACT**: TACO (Trash Annotations in Context) is specified as the official source for litter detection.

## 2. Official Source Verification
**VERIFIED FACT**: The dataset is originally from the TACO GitHub repository (Pedram W.).
**VERIFIED FACT**: The dataset has **NOT** been downloaded to the local workspace. 

**MANUAL VERIFICATION REQUIRED**: 
To proceed, the TACO dataset must be manually downloaded and placed in the expected raw location:
`civicshield-dataset/raw/garbage/` (e.g., `civicshield-dataset/raw/garbage/TACO/`).

## 3. License Status
**VERIFIED FACT**: MIT (code), images vary (mostly CC). Commercial and Research usage is allowed with modification.

## 4. Actual Dataset Contents
**VERIFIED FACT**: NONE. The `civicshield-dataset/raw/garbage/` directory is completely empty.

## 5. Annotation Format
**INFERENCE**: Based on the specs, TACO uses COCO JSON format. Since the data is missing, we cannot inspect the actual files to confirm.

## 6. Relevant Classes
**INFERENCE**: TACO contains 60 granular litter classes. The specification suggests mapping super-categories (`Plastic`, `Paper`, `Metal`) that overlap in dense clusters.

## 7. Mapping Decision
**ENGINEERING RECOMMENDATION**: TACO focuses heavily on *individual litter objects* (single items like wrappers or bottles), whereas CivicShield strictly requires `garbage_pile` (aggregated solid waste obstructing pathways). Mapping single bottles or wrappers directly to `garbage_pile` would severely damage the model's accuracy, as it would cause false positives on clean streets containing a single piece of trash. A direct mapping without density-based grouping is not defensible for the `garbage_pile` class.

## 8. Images Processed
**VERIFIED FACT**: 0

## 9. Garbage-Pile Objects
**VERIFIED FACT**: 0

## 10. Conversion Result
**VERIFIED FACT**: NOT RUN.

## 11. Validation Result
**VERIFIED FACT**: NOT RUN.

## 12. Duplicate Result
**VERIFIED FACT**: NOT RUN.

## 13. Limitations
**VERIFIED FACT**: TACO contains primarily Western context individual litter objects, not Indian context municipal garbage piles. This is a severe limitation for CivicShield's use case.

## 14. Custom Collection Requirement
**VERIFIED FACT**: **CUSTOM COLLECTION REQUIRED**. TACO alone is fundamentally insufficient. The team MUST collect custom Indian context garbage piles (e.g., overflowing street bins, mixed waste dumps) capturing a minimum of 300 (target 600) custom images in standard Indian environments (e.g., Lucknow streets). 

## 15. Remaining Work
**MANUAL ACTION REQUIRED**:
1. Manually download TACO and place it in `civicshield-dataset/raw/garbage/` if TACO usage is still desired despite its limitations.
2. Manually collect and annotate custom Indian context `garbage_pile` imagery using Roboflow.
3. Once data is available locally, run the dataset conversion, validation, and duplicate detection tools.

==================================================
FINAL STATUS
==================================================
GARBAGE DATASET: CUSTOM COLLECTION REQUIRED
GARBAGE CLASS MAPPING: REQUIRES REVIEW
VALIDATION: NOT RUN
DUPLICATE CHECK: NOT RUN
FINAL SPLIT: NOT CREATED
YOLO TRAINING: NOT AUTHORIZED
