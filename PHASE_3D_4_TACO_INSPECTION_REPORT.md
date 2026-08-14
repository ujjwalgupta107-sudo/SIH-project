# PHASE 3D.4 — TACO DATASET INSPECTION REPORT

## 1. Source
**VERIFIED FACT**: Downloaded via the official TACO dataset GitHub repository (`download.py`).

## 2. Download Integrity
**FAILED**: The download script failed to fetch all images. Due to broken/dead Flickr URLs returning non-image HTML error pages, the Python `PIL` library threw `UnidentifiedImageError` around image 1336.

## 3. Image Count
- **Expected**: 1,500
- **Actual Downloaded**: 1,337

## 4. Annotation Count
- **Total Annotations**: 4,784

## 5. Category Count
- **Total Categories**: 60

## 6. Complete Category Inventory
**VERIFIED FACT**:
*(Abridged subset highlighting the granular nature of the dataset)*
- `Cigarette`: 667 annotations
- `Unlabeled litter`: 517 annotations
- `Plastic film`: 451 annotations
- `Clear plastic bottle`: 285 annotations
- `Other plastic wrapper`: 260 annotations
- `Drink can`: 229 annotations
- `Plastic bottle cap`: 209 annotations
- `Plastic straw`: 157 annotations
- `Garbage bag`: 31 annotations
- ...and 51 other single-item classes (e.g., `Aluminium foil`, `Pizza box`, `Shoe`, `Pop tab`).

## 7. Annotation Format
**VERIFIED FACT**: Standard COCO format (`annotations.json`).

## 8. License Information
- **VERIFIED**: The provided `LICENSE` file explicitly covers the software/code under the **MIT License**.
- **NEEDS REVIEW**: The image files are downloaded directly from third-party Flickr URLs. The repository implies they are Creative Commons, but no explicit image license is distributed in the archive.

## 9. Visual Characteristics
**INFERENCE**: TACO captures scattered, individual pieces of litter primarily in environments like beaches, woods, and Western-style streets. It does not visually represent large, aggregated municipal garbage dumps or typical Indian roadside waste conditions.

## 10. Garbage-Pile Mapping Analysis
**ENGINEERING RECOMMENDATION**: Mapping any of these categories to CivicShield's `garbage_pile` class is **NOT DEFENSIBLE**.
CivicShield defines a `garbage_pile` as an aggregated accumulation of discarded waste requiring municipal cleanup. TACO annotates single, scattered items. If we map `Clear plastic bottle` or `Cigarette` to `garbage_pile`, the YOLO model will train to flag individual litter items on the street as municipal emergencies, causing catastrophic false positives. Even the `Garbage bag` category represents single, intact plastic bags rather than piles of waste.

## 11. Mapping Decision
**TACO DECISION**: **NOT SUITABLE** for `garbage_pile`.

## 12. Limitations
- Focuses exclusively on single-item, scattered litter.
- Missing images due to broken Flickr links.
- High risk of false positives if improperly mapped.
- Lacks Indian urban geographic and contextual relevance.

## 13. Custom Collection Requirement
**VERIFIED FACT**: **REQUIRED**. CivicShield must rely entirely on custom collected images to train the `garbage_pile` class.

## 14. Recommended Next Step
**ENGINEERING RECOMMENDATION**: Abandon TACO. Do not convert the TACO annotations to YOLO format. Proceed directly with the custom data collection plan established in `PHASE_3E_CUSTOM_COLLECTION_SETUP.md`.
